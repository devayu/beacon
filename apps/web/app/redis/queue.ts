import { Queue } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: { rejectUnauthorized: false },
});
export const scanQueue = new Queue(process.env.REDIS_SCAN_QUEUE_ID!, {
  connection,
});
