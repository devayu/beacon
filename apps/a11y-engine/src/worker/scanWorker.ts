import { Job, Worker } from "bullmq";
import { config } from "../config";
import { getRedisConnection } from "../services/redis";
import { logger } from "../services/logger";
import { ScanJobData, ScanJobResult, JobProgress } from "../types/job";
import { AccessibilityScanner } from "../services/scanner";
import { PriorityScorer } from "../services/priorityScorer";

export class ScanWorker {
  private worker: Worker<ScanJobData, ScanJobResult>;
  private scanner: AccessibilityScanner;
  private scorer: PriorityScorer;

  constructor() {
    this.scanner = new AccessibilityScanner();
    this.scorer = new PriorityScorer();

    const connection = getRedisConnection();

    this.worker = new Worker<ScanJobData, ScanJobResult>(
      config.redis.queueId,
      this.processJob.bind(this),
      {
        connection,
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
        step: "starting",
        progress: 0,
        message: `Starting scan for ${url}`,
      });

      await this.updateProgress(job, {
        step: "scanning",
        progress: 25,
        message: "Running accessibility scan...",
      });

      const result = await this.scanner.runScan(url, job.id as string, options);

      await this.updateProgress(job, {
        step: "scoring",
        progress: 50,
        message: "Generating Priority score...",
      });

      const priorityScores = await this.scorer.createPriorityScore(
        result.violations
      );

      await this.updateProgress(job, {
        step: "screenshots",
        progress: 75,
        message: "Processing screenshots...",
      });

      await this.updateProgress(job, {
        step: "completed",
        progress: 100,
        message: "Scan completed successfully",
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        result,
        priorityScores,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          workerVersion: "1.0.0",
        },
      };
    } catch (error) {
      await this.updateProgress(job, {
        step: "failed",
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
