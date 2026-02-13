import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { sign, verify } from "hono/jwt";
import { logger } from "hono/logger";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getDb, todos, users } from "@repo/db";
import secure from "hono/cookie";
import  type { Context, Next } from "hono"
import {
  CreateTodoSchema,
  TodoSchema,
  TodoStatusEnum,
} from "@repo/shared";
import {
  deleteCookie,
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  generateCookie,
  generateSignedCookie,
} from 'hono/cookie';
import { jwt } from "hono/jwt"
import type { JwtVariables } from "hono/jwt";

type Variables = {
  user:{
    sub:string;
    email:string;
    exp:number;
  };
};
const app = new Hono<{Variables:Variables}>().basePath("/api");

app.use("*", logger());
const hour = 60 * 60;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
  
    if (process.env.NODE_ENV === "production") {
       return "build-time-dummy-key"; 
    }
    throw new Error("JWT secret is missing");
  }
  return secret;
}

console.log("BUILD JWT_SECRET:", process.env.JWT_SECRET);

const authGuard = async (c:Context, next:Next) =>
{
  const token = getCookie(c,"auth_token");
  if(!token)
  {
    return c.json({error:"Unauthorised access"}, 401);
  }

  try
  {
    const payload = await verify(token, getJwtSecret(),"HS256");
    c.set("user", payload as Variables["user"]);
    await next();
  }
  catch
  {
    return c.json({error:"Invalid or expired token"},401);
  }
}
app.post("/register", async (c) => {
  try {
    const db = getDb();
    const { email, password } = await c.req.json();

    if (!email || !password || password.length < 8) {
      return c.json({ error: "Invalid email or password" }, 400);
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing) {
      return c.json({ error: "User already exists" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    return c.json({
      success: true,
      user: {
        id: newUser?.id,
        email: newUser?.email,
      },
    }, 201);

  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});



app.post("/login", async (c) => {
  try {
    const db = getDb();
    const { email, password } = await c.req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const payload = {
      sub: user.id,
      email: user.email,  
      exp: Math.floor(Date.now() / 1000) + hour,
    };

    const token = await sign(payload, getJwtSecret());

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: hour,
    });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});



app.post("/logout", (c) => {
  deleteCookie(c, "auth_token", {
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  return c.json({
    success: true,
  });
});



app.get("/get-session", authGuard, (c) => {
  const payload = c.get("user");

  return c.json({
    authenticated: true,
    user:payload,
  });
});


app.use("/dashboard/*", authGuard);
app.use("/manage/*", authGuard);














// Todo API

app.get("/", async (c) => {
  const db = getDb();
  const data = await db.select().from(todos);

  console.log("GET /api → rows:", data.length);

  return c.json(TodoSchema.array().parse(data));
});

app.post("/", async (c) => {
  const db = getDb();
  const body = await c.req.json();

  console.log("POST /api → BODY:", body);

  const parsed = CreateTodoSchema.safeParse(body);

  if (!parsed.success) {
    console.error(
      "POST /api → VALIDATION FAILED:",
      parsed.error.flatten()
    );

    return c.json(
      { errors: parsed.error.flatten() },
      400
    );
  }

  console.log("POST /api → PARSED (DB PAYLOAD):", parsed.data);

  const [row] = await db
    .insert(todos)
    .values({
      id: nanoid(),
      ...parsed.data,
    })
    .returning();

  console.log("POST /api → INSERTED ROW:", row);

  return c.json(TodoSchema.parse(row), 201);
});

app.patch("/:id/status", async (c) => {
  const db = getDb();
  const { id } = c.req.param();
  const body = await c.req.json();

  console.log(`PATCH /api/${id}/status → BODY:`, body);

  const statusResult = TodoStatusEnum.safeParse(body.status);

  if (!statusResult.success) {
    console.error(
      `PATCH /api/${id}/status → INVALID STATUS:`,
      body.status
    );

    return c.json(
      { error: "Invalid todo status" },
      400
    );
  }

  const status = statusResult.data;

  const [row] = await db
    .update(todos)
    .set({
      status,
      completed: status === "completed",
    })
    .where(eq(todos.id, id))
    .returning();

  if (!row) {
    console.warn(`PATCH /api/${id}/status → NOT FOUND`);
    return c.json({ message: "Not found" }, 404);
  }

  console.log(`PATCH /api/${id}/status → UPDATED ROW:`, row);

  return c.json(TodoSchema.parse(row));
});

app.delete("/:id", async (c) => {
  const db = getDb();
  const { id } = c.req.param();

  console.log(`DELETE /api/${id}`);

  const result = await db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning();

  if (!result.length) {
    console.warn(`DELETE /api/${id} → NOT FOUND`);
    return c.json({ message: "Not found" }, 404);
  }

  console.log(`DELETE /api/${id} → DELETED`);

  return c.body(null, 204);
});

export default app;
