import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

// Create a connection pool for PostgreSQL
function createPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return global.__pgPool;
}

// Create PrismaClient with the pg adapter
function createPrismaClient(): PrismaClient {
  const pool = createPool();
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({ adapter });
  } else {
    return new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
export * from "./generated/prisma/client";
