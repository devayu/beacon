import { logger } from "./services/logger";
import { getRedisConnection, closeRedisConnection } from "./services/redis";
import { getScanWorker } from "./worker/scanWorker";
import { getQueueService } from "./services/queue";
import { getPriorityScorer } from "./services/priorityScorer";

export class A11yEngineApp {
  private scanWorker: ReturnType<typeof getScanWorker> | null = null;
  private queueService: ReturnType<typeof getQueueService> | null = null;
  private scorerService: ReturnType<typeof getPriorityScorer> | null = null;
  private isShuttingDown = false;

  async start(): Promise<void> {
    try {
      logger.info("Starting A11y Engine...");

      const redis = getRedisConnection();
      await redis.ping();
      logger.info("Redis connection established");

      this.queueService = getQueueService();
      logger.info("Queue service initialized");

      this.scanWorker = getScanWorker();
      logger.info("Scan worker initialized");

      this.scorerService = getPriorityScorer();
      logger.info("Priority Scorer initialized");

      this.setupGracefulShutdown();

      logger.info("A11y Engine started successfully");
    } catch (error) {
      logger.error("Failed to start A11y Engine:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn("Shutdown already in progress...");
      return;
    }

    this.isShuttingDown = true;
    logger.info("Shutting down A11y Engine...");

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

      logger.info("A11y Engine shut down successfully");
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
  getScorerService() {
    return this.scorerService;
  }
}
