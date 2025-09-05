import { Job, Worker } from "bullmq";
import { getRedisConnection } from "../services/redis";
import { logger } from "../services/logger";
import { getPriorityScorer } from "../services/priority-scorer";
import { AccessibilityViolation } from "../types";
import Redis from "ioredis";
import { config } from "../config/index";

interface AIJobData {
  scanJobId: string;
  violations: AccessibilityViolation[];
  url: string;
  statusId?: string;
}

interface AIJobResult {
  success: boolean;
  priorityScores?: any;
  error?: any;
  metadata: {
    processingTime: number;
    timestamp: string;
    workerVersion: string;
  };
}

export class AIWorker {
  private worker: Worker<AIJobData, AIJobResult>;
  private scorer: ReturnType<typeof getPriorityScorer>;
  private redisConnection: Redis;

  constructor() {
    this.scorer = getPriorityScorer();
    this.redisConnection = getRedisConnection();

    this.worker = new Worker<AIJobData, AIJobResult>(
      config.redis.queueId,
      this.processJob.bind(this),
      {
        connection: this.redisConnection,
        concurrency: config.worker.concurrency
      }
    );

    this.setupEventListeners();
    logger.info("AI worker started and listening...");
  }

  private setupEventListeners(): void {
    this.worker.on("completed", (job) => {
      logger.info(`AI Worker completed job ${job.id}`);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`AI Worker failed job ${job?.id}:`, error);
    });

    this.worker.on("error", (error) => {
      logger.error("AI Worker error:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`AI Job ${jobId} stalled`);
    });
  }

  private async updateScanJobProgress(
    statusId: string,
    step: string,
    progress: number,
    message: string
  ): Promise<void> {
    try {
      const progressData = { step, progress, message };
      await this.redisConnection.set(statusId, JSON.stringify(progressData));
      logger.debug(`Updated scan job progress: ${step} (${progress}%)`);
    } catch (error) {
      logger.warn(`Failed to update scan job progress:`, error);
    }
  }

  private async processJob(job: Job<AIJobData, AIJobResult>): Promise<AIJobResult> {
    const startTime = Date.now();
    const { scanJobId, violations, url, statusId } = job.data;

    logger.info(`Processing AI job ${job.id} for scan job ${scanJobId}`);

    try {
      if (statusId) {
        await this.updateScanJobProgress(
          statusId,
          "ai-processing",
          80,
          "Analyzing violations with AI..."
        );
      }

      const priorityScores = await this.scorer.createPriorityScore(violations);

      if (statusId) {
        await this.updateScanJobProgress(
          statusId,
          "completed",
          100,
          "Analysis completed successfully"
        );

        // Store final result in Redis for the web app to fetch
        await this.redisConnection.set(
          `scan-result:${scanJobId}`,
          JSON.stringify({
            success: true,
            result: { violations, url },
            priorityScores,
            metadata: {
              processingTime: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              workerVersion: "1.0.0",
            },
          }),
          "EX", 
          3600 // Expire after 1 hour
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        priorityScores,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          workerVersion: "1.0.0",
        },
      };
    } catch (error) {
      if (statusId) {
        await this.updateScanJobProgress(
          statusId,
          "failed",
          0,
          `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          code: (error as any)?.code,
        },
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          workerVersion: "1.0.0",
        },
      };
    }
  }

  async close(): Promise<void> {
    logger.info("Closing AI worker...");
    await this.worker.close();
  }

  getWorker(): Worker<AIJobData, AIJobResult> {
    return this.worker;
  }
}

let aiWorkerInstance: AIWorker | null = null;

export function getAIWorker(): AIWorker {
  if (!aiWorkerInstance) {
    aiWorkerInstance = new AIWorker();
  }
  return aiWorkerInstance;
}