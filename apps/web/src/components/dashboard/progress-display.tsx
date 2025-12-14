"use client";

import { ScanStatus } from "@/hooks/useScanStatus";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface ProgressDisplayProps {
  status: ScanStatus;
  isLoading?: boolean;
}

export function ProgressDisplay({
  status,
  isLoading = false,
}: ProgressDisplayProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Scan Progress</span>
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">{status.step}</span>
            <span className="text-gray-500">
              {Math.round(status.progress)}%
            </span>
          </div>
          <Progress
            value={status.progress}
            className="h-2 w-full transition-all duration-300 ease-in-out"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 leading-relaxed">
            {status.message || "Processing..."}
          </p>

          {status.progress < 100 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Scan in progress...</span>
            </div>
          )}

          {status.progress >= 100 && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Scan completed!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
