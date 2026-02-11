import { defineConfig } from 'drizzle-kit';

//if (!process.env.DATABASE_URL) {
  //  console.warn('DATABASE_URL is not defined in environment variables');
//}

export default defineConfig({
    
    schema: "./packages/db/src/schema.ts",
    out: "./packages/db/drizzle",
    dialect: 'postgresql',
    dbCredentials: { 
        url: process.env.DATABASE_URL || "", 
    },
    verbose: true,
    strict: true,
});
