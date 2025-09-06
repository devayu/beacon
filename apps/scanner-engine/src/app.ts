import { logger } from "@beacon/logger";
import { getRedisConnection, closeRedisConnection } from "@beacon/redis";
import { getScanWorker } from "./worker/scan-worker";
import { getQueueService } from "./services/queue";
import { config } from "./config";
export class ScannerEngineApp {
  private scanWorker: ReturnType<typeof getScanWorker> | null = null;
  private queueService: ReturnType<typeof getQueueService> | null = null;
  private isShuttingDown = false;

  async start(): Promise<void> {
    try {
      logger.info("Starting Scanner Engine...");

      const redis = getRedisConnection(config.redis);
      await redis.ping();
      logger.info("Redis connection established");

      this.queueService = getQueueService();
      logger.info("Queue service initialized");

      this.scanWorker = getScanWorker();
      logger.info("Scan worker initialized");

      this.setupGracefulShutdown();

      logger.info("Scanner Engine started successfully");
    } catch (error) {
      logger.error("Failed to start Scanner Engine:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn("Shutdown already in progress...");
      return;
    }

    this.isShuttingDown = true;
    logger.info("Shutting down Scanner Engine...");

    try {
      if (this.scanWorker) {
        await this.scanWorker.close();
        logger.info("Scan worker closed");
      }

      if (this.queueService) {
        await this.queueService.close();
        logger.info("Queue service closed");
      }
      closeRedisConnection();
      logger.info("Redis connection closed");

      logger.info("Scanner Engine shut down successfully");
    } catch (error) {
      logger.error("Error during shutdown:", error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, initiating graceful shutdown...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception:", error);
      handleShutdown("uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection:", reason);
      handleShutdown("unhandledRejection");
    });
  }

  getQueueService() {
    return this.queueService;
  }

  getScanWorker() {
    return this.scanWorker;
  }
}
