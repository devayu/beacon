import { getRedisConnection } from "@beacon/redis";
import { Queue } from "bullmq";

export const scanQueue = new Queue(process.env.REDIS_SCAN_QUEUE_ID!, {
  connection: getRedisConnection(),
});
