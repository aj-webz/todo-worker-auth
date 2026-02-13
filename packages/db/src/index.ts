import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";


const { Pool } = pkg;

let pool: pkg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }
   const isLocal = DATABASE_URL.includes("localhost") || DATABASE_URL.includes("postgres:5432");


  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isLocal ? false : {
      rejectUnauthorized: false, 
    },
  });

  db = drizzle(pool, { schema });

  return db;
}

export {todos} from "./schema";
export { users} from "./schema"
