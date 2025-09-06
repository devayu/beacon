import { Job, Worker, Queue } from "bullmq";
import { config } from "../config";
import { getRedisConnection, Redis, setCache } from "@beacon/redis";
import { logger } from "@beacon/logger";
import { ScanJobData, ScanJobResult, JobProgress } from "../types/job";
import { AccessibilityScanner } from "../services/scanner";
import { getUploadThingStorage } from "../services/uploadthing-storage";
import { prisma } from "@beacon/db";

export class ScanWorker {
  private worker: Worker<ScanJobData, ScanJobResult>;
  private scanner: AccessibilityScanner;
  private redisConnection: Redis;
  private aiQueue: Queue;
  private uploadStorage = getUploadThingStorage();

  constructor() {
    this.scanner = new AccessibilityScanner();

    this.redisConnection = getRedisConnection(config.redis);

    this.aiQueue = new Queue(config.redis.aiQueueId, {
      connection: this.redisConnection,
    });

    this.worker = new Worker<ScanJobData, ScanJobResult>(
      config.redis.queueId,
      this.processJob.bind(this),
      {
        connection: this.redisConnection,
        concurrency: config.worker.concurrency,
      }
    );

    this.setupEventListeners();
    logger.info("Scan worker started and listening...");
  }

  private setupEventListeners(): void {
    this.worker.on("completed", (job) => {
      logger.info(`Worker completed job ${job.id}`);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Worker failed job ${job?.id}:`, error);
    });

    this.worker.on("error", (error) => {
      logger.error("Worker error:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`Job ${jobId} stalled`);
    });
  }

  private async updateProgress(
    job: Job<ScanJobData, ScanJobResult>,
    progress: JobProgress
  ): Promise<void> {
    try {
      await job.updateProgress(progress);
      if (job.data.statusId) await setCache(job.data.statusId, progress, 7200);

      logger.debug(
        `Job ${job.id} progress: ${progress.step} (${progress.progress}%)`
      );
    } catch (error) {
      logger.warn(`Failed to update progress for job ${job.id}:`, error);
    }
  }

  private async processJob(
    job: Job<ScanJobData, ScanJobResult>
  ): Promise<ScanJobResult> {
    const startTime = Date.now();
    const { url, options = {} } = job.data;

    logger.info(`Processing job ${job.id} for URL: ${url}`);

    try {
      await this.updateProgress(job, {
        step: "SCANNING",
        progress: 0,
        message: `Starting scan for ${url}`,
      });

      await this.updateProgress(job, {
        step: "SCANNING",
        progress: 25,
        message: "Running accessibility scan...",
      });

      const result = await this.scanner.runScan(url, job.id as string, options);

      // Upload screenshots to Supabase and get URLs
      let screenshotUrl: string | undefined;
      let violationsScreenshotUrl: string | undefined;

      if (result.screenshotPaths) {
        await this.updateProgress(job, {
          step: "PROCESSING_SCREENSHOTS",
          progress: 40,
          message: "Uploading screenshots...",
        });

        try {
          const screenshots = [];

          if (result.screenshotPaths.original) {
            screenshots.push({
              filePath: result.screenshotPaths.original.path,
              fileName: result.screenshotPaths.original.name,
              type: "original" as const,
            });
          }

          if (result.screenshotPaths.violations) {
            screenshots.push({
              filePath: result.screenshotPaths.violations.path,
              fileName: result.screenshotPaths.violations.name,
              type: "violations" as const,
            });
          }

          if (screenshots.length > 0) {
            const uploadedUrls =
              await this.uploadStorage.uploadScreenshots(screenshots);

            screenshotUrl = uploadedUrls.original;
            violationsScreenshotUrl = uploadedUrls.violations;

            logger.info(`Screenshots uploaded successfully for job ${job.id}`);
          }
        } catch (error) {
          logger.error(
            `Failed to upload screenshots for job ${job.id}:`,
            error
          );
          // Continue processing even if screenshot upload fails
        }
      }

      await prisma.$transaction(async (tx) => {
        if (result.violations.length > 0) {
          await tx.accessibilityViolation.createMany({
            data: result.violations.map((violation) => ({
              scanJobId: job.data.jobDbId,
              ruleId: violation.id,
              impact: violation.impact.toUpperCase() as any,
              description: violation.description,
              help: violation.help,
              helpUrl: violation.helpUrl,
              nodes: violation.nodes as any,
              priorityScore: 0,
              priority: "LOW",
            })),
          });
        }

        await tx.scanJob.update({
          where: {
            id: job.data.jobDbId,
          },
          data: {
            result: result as any,
            status: "SCAN_COMPLETE",
            screenshotUrl,
            violationsScreenshotUrl,
          },
        });
      });

      await this.updateProgress(job, {
        step: "SCAN_COMPLETE",
        progress: 50,
        message: "Scan completed...",
      });

      await this.aiQueue.add("priority-scoring", {
        scanJobId: job.id,
        jobDbId: job.data.jobDbId,
        url: url,
        statusId: job.data.statusId,
      });

      await this.updateProgress(job, {
        step: "AI_QUEUED",
        progress: 60,
        message: "Queueing AI analysis...",
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          workerVersion: "1.0.0",
        },
      };
    } catch (error) {
      await this.updateProgress(job, {
        step: "FAILED",
        progress: 0,
        message: `Scan failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

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
    logger.info("Closing scan worker...");
    await this.worker.close();
  }

  getWorker(): Worker<ScanJobData, ScanJobResult> {
    return this.worker;
  }
}

let scanWorkerInstance: ScanWorker | null = null;

export function getScanWorker(): ScanWorker {
  if (!scanWorkerInstance) {
    scanWorkerInstance = new ScanWorker();
  }
  return scanWorkerInstance;
}
