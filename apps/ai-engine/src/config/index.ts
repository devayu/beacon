import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface Config {
  redis: {
    url: string;
    queueId: string;
    maxRetriesPerRequest: number | null;
    enableReadyCheck: boolean;
    tls: {
      rejectUnauthorized: boolean;
    };
  };
  model: {
    openai: string;
    gemini: string;
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
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {
      rejectUnauthorized: false,
    },
  },
  model: {
    openai: validateEnvVar("OPENAI_API_KEY"),
    gemini: validateEnvVar("GEMINI_API_KEY"),
  },
  worker: {
    concurrency: 1,
    removeOnComplete: 10,
    removeOnFail: 50,
  },
};
