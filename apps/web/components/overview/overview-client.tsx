"use client";
import { scheduleScan } from "@/app/actions/scan/schedule-scan";
import { GetLastRunsT } from "@/app/dal/overview/get-last-runs";
import IconButton from "@/components/ui/icon-button";
import { useScanStatus } from "@/hooks/useScanStatus";
import { isActionError } from "@/lib/error";
import { ScanJob } from "@beacon/db";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Overview = ({ lastRuns }: { lastRuns: GetLastRunsT }) => {
  console.log(lastRuns, "lastrunnnsss");
  const { status, isLoading, error, startPolling, stopPolling, isPolling } =
    useScanStatus();
  const [isScanning, setIsScanning] = useState(false);
  const { metadata, lastScans } = lastRuns;

  const handleScan = async () => {
    setIsScanning(true);

    try {
      const res = await scheduleScan(lastRuns.metadata?.id!);

      if (isActionError(res)) {
        toast.error(res.error);
        setIsScanning(false);
      } else {
        toast.success("Scan started successfully!");
        startPolling(res?.statusId!);
      }
    } catch (err) {
      toast.error("Failed to start scan");
      setIsScanning(false);
    }
  };
  useEffect(() => {
    if (!isPolling && isScanning) {
      setIsScanning(false);
    }
  }, [isPolling, isScanning]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div>
        <h1>{metadata?.url}</h1>
        <IconButton
          onClick={handleScan}
          disabled={isScanning}
          className="min-w-[100px]"
        >
          {isScanning ? "Scanning..." : "Scan"}
        </IconButton>
      </div>
      <div>
        {lastScans?.map(({ id, result }) => {
          return (
            <div key={id}>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result as any)}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Overview;
