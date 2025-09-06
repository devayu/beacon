"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ScanStatus {
  step: string;
  progress: number;
  message: string;
}

interface UseScanStatusReturn {
  status: ScanStatus | null;
  isLoading: boolean;
  error: string | null;
  startPolling: (statusId: string) => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export function useScanStatus(): UseScanStatusReturn {
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentStatusIdRef = useRef<string | null>(null);

  const fetchStatus = useCallback(async (statusId: string) => {
    try {
      setError(null);
      const response = await axios.get(`/api/jobs/${statusId}/status`);

      const statusData = response.data;
      setStatus(statusData);

      // Stop polling if scan is complete (progress reaches 100)
      if (statusData.progress >= 100) {
        stopPolling();
        toast.success("Scan completed successfully!");
      }

      return statusData;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "Failed to fetch scan status";

      setError(errorMessage);
      toast.error(`Scan status error: ${errorMessage}`);

      // Stop polling on persistent errors
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        stopPolling();
      }

      throw err;
    }
  }, []);

  const startPolling = useCallback(
    (statusId: string) => {
      if (!statusId) {
        toast.error("Status ID is required to start polling");
        return;
      }

      // Clear any existing polling
      stopPolling();

      setIsPolling(true);
      setIsLoading(true);
      setStatus(null);
      setError(null);
      currentStatusIdRef.current = statusId;

      // Initial fetch
      fetchStatus(statusId).finally(() => setIsLoading(false));

      // Set up polling interval (every 2 seconds)
      intervalRef.current = setInterval(async () => {
        if (currentStatusIdRef.current) {
          try {
            await fetchStatus(currentStatusIdRef.current);
          } catch (error) {
            // Error handling is already done in fetchStatus
            console.error("Polling error:", error);
          }
        }
      }, 5000);
    },
    [fetchStatus]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    setIsLoading(false);
    currentStatusIdRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    isLoading,
    error,
    startPolling,
    stopPolling,
    isPolling,
  };
}
