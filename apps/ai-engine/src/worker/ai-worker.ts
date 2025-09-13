import { Job, Worker } from "bullmq";
import { getRedisConnection, Redis, setCache } from "@beacon/redis";
import { logger } from "@beacon/logger";
import { getPriorityScorer } from "../services/priority-scorer";
import { config } from "../config";
import { AccessibilityViolation, prisma } from "@beacon/db";

interface AIJobData {
  scanJobId: string;
  violations: AccessibilityViolation[];
  url: string;
  statusId?: string;
  jobDbId: string;
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
    this.redisConnection = getRedisConnection(config.redis);

    this.worker = new Worker<AIJobData, AIJobResult>(
      config.redis.queueId,
      this.processJob.bind(this),
      {
        connection: this.redisConnection,
        concurrency: config.worker.concurrency,
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
      await setCache(statusId, progressData, 7200);
      logger.debug(`Updated scan job progress: ${step} (${progress}%)`);
    } catch (error) {
      logger.warn(`Failed to update scan job progress:`, error);
    }
  }

  private async processJob(
    job: Job<AIJobData, AIJobResult>
  ): Promise<AIJobResult> {
    const startTime = Date.now();
    const { scanJobId, url, statusId, jobDbId } = job.data;

    logger.info(`Processing AI job ${job.id} for scan job ${scanJobId}`);

    try {
      if (statusId) {
        await this.updateScanJobProgress(
          statusId,
          "AI_PROCESSING",
          80,
          "Analyzing violations with AI..."
        );
      }

      const violations = await prisma.accessibilityViolation.findMany({
        where: {
          scanJobId: jobDbId,
        },
      });
      const priorityScores = await this.scorer.createPriorityScore(violations);

      await prisma.$transaction(async (tx) => {
        // Validate data before processing
        if (
          !priorityScores.violations ||
          priorityScores.violations.length === 0
        ) {
          logger.warn("No violations to process in priority scores");
          return;
        }

        // Create explanations in batch if any violations have explanations
        const explanationsToCreate = priorityScores.violations
          .filter(
            (v) =>
              v.detailedExplanation &&
              v.technicalRecommendation &&
              v.explanation &&
              v.ruleId
          )
          .map((v) => ({
            detailedExplanation: v.detailedExplanation,
            recommendation: v.technicalRecommendation,
            explanation: v.explanation,
            issueCode: v.ruleId,
          }));

        if (explanationsToCreate.length > 0) {
          try {
            await tx.explanation.createMany({
              data: explanationsToCreate,
              skipDuplicates: true,
            });
            logger.info(`Created ${explanationsToCreate.length} explanations`);
          } catch (error) {
            logger.error("Failed to create explanations:", error);
            // Don't throw here as explanations are supplementary
          }
        }

        // Update violations in batch using updateMany for better performance
        const violationUpdates = priorityScores.violations.map((v) => ({
          id: v.id,
          priorityScore: v.totalScore,
        }));

        // Process updates in batches to avoid query size limits
        const batchSize = 100;
        for (let i = 0; i < violationUpdates.length; i += batchSize) {
          const batch = violationUpdates.slice(i, i + batchSize);

          // Use Promise.all for parallel execution within each batch
          await Promise.all(
            batch.map(async (update) => {
              try {
                await tx.accessibilityViolation.update({
                  where: {
                    id: update.id,
                    scanJobId: job.data.jobDbId,
                  },
                  data: {
                    priorityScore: update.priorityScore,
                  },
                });
              } catch (error) {
                logger.error(`Failed to update violation ${update.id}:`, error);
                // Continue with other updates even if one fails
              }
            })
          );
        }

        // Update ScanJob with transformed result
        if (priorityScores.transformedResult) {
          try {
            await tx.scanJob.update({
              where: {
                id: jobDbId,
              },
              data: {
                transformedResult: priorityScores.transformedResult as any,
                status: "COMPLETED",
              },
            });
            logger.info(
              `Saved transformed result for ${priorityScores.transformedResult.length} violations`
            );
          } catch (error) {
            logger.error("Failed to save transformed result:", error);
            // Don't throw here as this is supplementary data
          }
        }

        logger.info(
          `Updated priority scores for ${violationUpdates.length} violations`
        );
      });

      if (statusId) {
        await this.updateScanJobProgress(
          statusId,
          "COMPLETED",
          100,
          "Analysis completed successfully"
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
