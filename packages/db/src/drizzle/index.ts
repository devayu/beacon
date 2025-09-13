import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
declare global {
  var __drizzle: ReturnType<typeof drizzle> | undefined;
}

let db: ReturnType<typeof drizzle>;

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

if (process.env.NODE_ENV === "production") {
  db = drizzle(sql);
} else {
  if (!global.__drizzle) {
    global.__drizzle = drizzle(sql);
  }
  db = global.__drizzle;
}

export * from "./schema";
export { db as drizzleDb };
