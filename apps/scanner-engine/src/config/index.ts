import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface Config {
  redis: {
    url: string;
    queueId: string;
    aiQueueId: string;
    maxRetriesPerRequest: number | null;
    enableReadyCheck: boolean;
    tls: {
      rejectUnauthorized: boolean;
    };
  };
  scanner: {
    defaultTimeout: number;
    defaultOutputDir: string;
    defaultViewport: {
      width: number;
      height: number;
    };
    defaultTags: string[];
  };
  worker: {
    concurrency: number;
    removeOnComplete: number;
    removeOnFail: number;
  };
}

function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: Config = {
  redis: {
    url: validateEnvVar("UPSTASH_REDIS_URL"),
    queueId: validateEnvVar("REDIS_QUEUE_ID"),
    aiQueueId: validateEnvVar("REDIS_AI_QUEUE_ID"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {
      rejectUnauthorized: false,
    },
  },
  scanner: {
    defaultTimeout: 60000,
    defaultOutputDir: "./accessibility-reports",
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    defaultTags: [
      "wcag2a",
      "wcag2aa",
      "wcag21aa",
      "best-practice",
      "wcag22aa",
      "wcag2aaa",
    ],
  },
  worker: {
    concurrency: 1,
    removeOnComplete: 10,
    removeOnFail: 50,
  },
};