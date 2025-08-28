// Legacy compatibility file - use the new exports.ts for new implementations
// This file maintains backward compatibility for existing code

import { getRedisConnection } from "./services/redis";
import { getQueueService, QueueService } from "./services/queue";
import { getScanWorker, ScanWorker } from "./worker/scanWorker";
import { Queue } from "bullmq";
import { ScanJobData, ScanJobResult } from "./types/job";

// Legacy exports for backward compatibility
export const connection = getRedisConnection();

// Initialize services
const queueService = getQueueService();
const scanWorker = getScanWorker();

// Legacy exports
export const worker = scanWorker.getWorker();
export const scanQueue = queueService.getQueue();

console.log("[INFO] Legacy worker interface initialized");
