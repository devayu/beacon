import { PrismaClient } from "./generated/prisma";
import { logger } from "@beacon/logger";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.__prisma;
}

// Remove query logging for now to avoid TypeScript issues

export { prisma };
export * from "./generated/prisma";

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("Failed to disconnect from database:", error);
    throw error;
  }
};
