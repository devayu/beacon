// Main exports for external consumption
export { A11yEngineApp } from "./app";
export { AccessibilityScanner } from "./scanner";
export { getQueueService } from "./services/queue";
export { getScanWorker } from "./worker/scanWorker";
export { config } from "./config";
export { logger } from "./services/logger";

export * from "./types";

export {
  scanMultipleUrls,
  generateReport,
  printSummary,
  detectDarkModeMethod,
} from "./scanner";

export { getRedisConnection, closeRedisConnection } from "./services/redis";
export { QueueService } from "./services/queue";
export { ScanWorker } from "./worker/scanWorker";
