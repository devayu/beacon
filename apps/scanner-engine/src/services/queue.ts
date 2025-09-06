import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { config } from "../config";
import { getRedisConnection } from "@beacon/redis";
import { logger } from "@beacon/logger";
import { ScanJobData, ScanJobResult } from "../types/job";

export class QueueService {
  private queue: Queue<ScanJobData, ScanJobResult>;
  private queueEvents: QueueEvents;

  constructor() {
    const connection = getRedisConnection(config.redis);

    this.queue = new Queue<ScanJobData, ScanJobResult>(config.redis.queueId, {
      connection,
      defaultJobOptions: {
        removeOnComplete: config.worker.removeOnComplete,
        removeOnFail: config.worker.removeOnFail,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    this.queueEvents = new QueueEvents(config.redis.queueId, { connection });
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.queueEvents.on("completed", ({ jobId, returnvalue }) => {
      logger.info(`Job ${jobId} completed successfully`);
      logger.debug("Job result:", returnvalue);
    });

    this.queueEvents.on("failed", ({ jobId, failedReason }) => {
      logger.error(`Job ${jobId} failed: ${failedReason}`);
    });

    this.queueEvents.on("stalled", ({ jobId }) => {
      logger.warn(`Job ${jobId} stalled`);
    });

    this.queueEvents.on("progress", ({ jobId, data }) => {
      logger.info(`Job ${jobId} progress: ${JSON.stringify(data)}`);
    });
  }

  async addScanJob(
    jobName: string,
    data: ScanJobData
  ): Promise<Job<ScanJobData, ScanJobResult>> {
    try {
      const job = await this.queue.add(jobName, data);
      logger.info(`Added scan job ${job.id} for URL: ${data.url}`);
      return job;
    } catch (error) {
      logger.error("Failed to add scan job:", error);
      throw error;
    }
  }

  async getJob(
    jobId: string
  ): Promise<Job<ScanJobData, ScanJobResult> | undefined> {
    return this.queue.getJob(jobId);
  }

  async getWaiting(): Promise<Job<ScanJobData, ScanJobResult>[]> {
    return this.queue.getWaiting();
  }

  async getActive(): Promise<Job<ScanJobData, ScanJobResult>[]> {
    return this.queue.getActive();
  }

  async getCompleted(): Promise<Job<ScanJobData, ScanJobResult>[]> {
    return this.queue.getCompleted();
  }

  async getFailed(): Promise<Job<ScanJobData, ScanJobResult>[]> {
    return this.queue.getFailed();
  }

  async close(): Promise<void> {
    await this.queueEvents.close();
    await this.queue.close();
  }

  getQueue(): Queue<ScanJobData, ScanJobResult> {
    return this.queue;
  }
}

let queueServiceInstance: QueueService | null = null;

export function getQueueService(): QueueService {
  if (!queueServiceInstance) {
    queueServiceInstance = new QueueService();
  }
  return queueServiceInstance;
}
