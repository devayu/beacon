import { Redis } from "ioredis";
import { config } from "../config";

let redisInstance: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.redis.url, {
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
      enableReadyCheck: config.redis.enableReadyCheck,
      tls: config.redis.tls,
      lazyConnect: true,
    });

    redisInstance.on("connect", () => {
      console.log("[INFO] Redis connected successfully");
    });

    redisInstance.on("error", (error) => {
      console.error("[ERROR] Redis connection error:", error);
    });

    redisInstance.on("close", () => {
      console.log("[INFO] Redis connection closed");
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
