  import {
    pgTable,
    text,
    boolean,
    timestamp,
    pgEnum,uuid
  } from "drizzle-orm/pg-core";

  export const users = pgTable("users",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      email: text("email").notNull().unique(),
      password:text("password").notNull(),
      createdAt:timestamp("created_at").defaultNow().notNull(),
    }
  )




  export const todoStatusEnum = pgEnum("todo_status", [
    "todo",
    "in-progress",
    "backlog",
    "completed",
    "cancelled",
  ]);

  
  export const todos = pgTable("todoworker", {
    id: text("id").primaryKey(),

    title: text("title").notNull(),
    description: text("description").notNull(),


    status: todoStatusEnum("status")
      .notNull()
      .default("todo"),

    completed: boolean("completed")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),


    endAt: timestamp("end_at", {
      withTimezone: true,
      mode: "date",
    }),
  });
