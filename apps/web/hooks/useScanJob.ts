import { useState, useCallback, useRef } from "react";

interface JobStatus {
  jobId: string;
  status: string;
  progress: {
    message?: string;
    progress: number;
  };
  result?: any;
  error?: string;
}

interface ScanResult {
  success: boolean;
  result?: any;
  priorityScores?: any;
  metadata?: {
    processingTime: number;
    timestamp: string;
    workerVersion: string;
  };
}

export function useScanJob() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback((jobId: string, statusId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/status/${statusId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get job status");
        }

        setJobStatus(data);

        // Extract progress from job progress data
        if (data.progress && typeof data.progress === "object") {
          setProgress(data.progress.progress || 0);
        }

        // Handle completed job
        if (data.status === "completed") {
          setIsScanning(false);
          setProgress(100);

          if (data.result) {
            setScanResult(data.result);
          }

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }

        // Handle failed job
        if (data.status === "failed") {
          setIsScanning(false);
          setError(data.error || "Scan failed");

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError(err instanceof Error ? err.message : "Unknown polling error");
        setIsScanning(false);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(poll, 2000);

    // Initial poll
    poll();
  }, []);

  const startScan = useCallback(
    async (url: string) => {
      try {
        setIsScanning(true);
        setProgress(0);
        setError(null);
        setScanResult(null);
        setJobStatus(null);

        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to start scan");
        }

        // Start polling for job status
        startPolling(data.jobId, data.statusId);
      } catch (err) {
        setIsScanning(false);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [startPolling]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  return {
    isScanning,
    progress,
    jobStatus,
    scanResult,
    error,
    startScan,
    cleanup,
    jobId: jobStatus?.jobId,
  };
}
