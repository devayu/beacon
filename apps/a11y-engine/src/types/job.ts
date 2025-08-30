import { BatchPriorityResult, ScanOptions, ScanResult } from "../types";

export interface ScanJobData {
  url: string;
  options?: ScanOptions;
  jobId?: string;
  timestamp?: string;
}

export interface ScanJobResult {
  success: boolean;
  result?: ScanResult;
  priorityScores?: BatchPriorityResult;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata: {
    processingTime: number;
    timestamp: string;
    workerVersion: string;
  };
}

export interface JobProgress {
  step:
    | "starting"
    | "scanning"
    | "screenshots"
    | "scoring"
    | "completed"
    | "failed";
  progress: number;
  message?: string;
}
