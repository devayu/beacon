import { ScanOptions, ScanResult } from "../types";

export interface ScanJobData {
  url: string;
  options?: ScanOptions;
  jobId?: string;
  jobDbId: string;
  statusId?: string;
  timestamp?: string;
}

export interface ScanJobResult {
  success: boolean;
  result?: ScanResult;
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
    | "SCANNING"
    | "PROCESSING_SCREENSHOTS"
    | "SCAN_COMPLETE"
    | "AI_QUEUED"
    | "FAILED";
  progress: number;
  message?: string;
}
