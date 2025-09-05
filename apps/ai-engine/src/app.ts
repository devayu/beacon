import { logger } from "./services/logger";
import { getRedisConnection, closeRedisConnection } from "./services/redis";
import { getAIWorker } from "./worker/ai-worker";
import { getPriorityScorer } from "./services/priority-scorer";

export class AIEngineApp {
  private aiWorker: ReturnType<typeof getAIWorker> | null = null;
  private scorerService: ReturnType<typeof getPriorityScorer> | null = null;
  private isShuttingDown = false;

  async start(): Promise<void> {
    try {
      logger.info("Starting AI Engine...");

      const redis = getRedisConnection();
      await redis.ping();
      logger.info("Redis connection established");

      this.scorerService = getPriorityScorer();
      logger.info("Priority Scorer initialized");

      this.aiWorker = getAIWorker();
      logger.info("AI worker initialized");

      this.setupGracefulShutdown();

      logger.info("AI Engine started successfully");
    } catch (error) {
      logger.error("Failed to start AI Engine:", error);
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
      if (this.aiWorker) {
        await this.aiWorker.close();
        logger.info("AI worker closed");
      }

      closeRedisConnection();
      logger.info("Redis connection closed");

      logger.info("AI Engine shut down successfully");
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

  getAIWorker() {
    return this.aiWorker;
  }
  
  getScorerService() {
    return this.scorerService;
  }
}
