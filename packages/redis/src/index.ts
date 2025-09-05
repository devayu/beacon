import { Redis } from "ioredis";
import { logger } from "@beacon/logger";
import dotenv from "dotenv";
import path from "path";

export interface RedisConfig {
  url: string;
  maxRetriesPerRequest: number | null;
  enableReadyCheck: boolean;
  tls?: any;
}

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let redisInstance: Redis | null = null;

function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function defaultRedisConnection(): RedisConfig {
  return {
    url: validateEnvVar("UPSTASH_REDIS_URL"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {
      rejectUnauthorized: false,
    },
  };
}
export function getRedisConnection(
  config: RedisConfig = defaultRedisConnection()
): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.url, {
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      enableReadyCheck: config.enableReadyCheck,
      tls: config.tls,
      lazyConnect: true,
    });

    redisInstance.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redisInstance.on("error", (error) => {
      logger.error("Redis connection error:", error);
    });

    redisInstance.on("close", () => {
      logger.info("Redis connection closed");
    });
  }

  return redisInstance;
}

export function closeRedisConnection(): void {
  if (redisInstance) {
    redisInstance.disconnect();
    redisInstance = null;
  }
}
export const setCache = async (key: string, value: any, ttl?: number) => {
  if (!redisInstance) return;
  return ttl
    ? redisInstance.set(key, JSON.stringify(value), "EX", ttl)
    : redisInstance.set(key, JSON.stringify(value));
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redisInstance) return null;
  const data = await redisInstance.get(key);
  return data ? JSON.parse(data as string) : null;
};

export const delCache = async (key: string): Promise<Number | null> => {
  if (!redisInstance) return null;
  return redisInstance.del(key);
};
export { Redis };
