"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { ViolationCard } from "../../components/ViolationCard";
import { ScreenshotDisplay } from "../../components/ScreenshotDisplay";
import { useScanJob } from "../../hooks/useScanJob";
import IconButton from "@/components/ui/IconButton";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const {
    isScanning,
    progress,
    jobStatus,
    scanResult,
    error,
    startScan,
    jobId,
  } = useScanJob();

  const handleScan = async () => {
    if (!url.trim()) return;
    await startScan(url.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isScanning) {
      handleScan();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 font-serif">Dashboard</h1>
      </div>

      {/* Scan Form */}
      <div className="flex gap-4 items-center mb-4">
        <Input
          type="url"
          placeholder=""
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isScanning}
          className="flex-1"
        />
        <IconButton
          onClick={handleScan}
          disabled={isScanning || !url.trim()}
          className="min-w-[100px]"
        >
          {isScanning ? "Scanning..." : "Scan"}
        </IconButton>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Progress Section */}
      {isScanning && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scan Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">
                Status: {jobStatus?.progress.message || "Initializing..."}
              </p>
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {scanResult.priorityScores?.summary.criticalCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {scanResult.priorityScores?.summary.highCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {scanResult.priorityScores?.summary.mediumCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {scanResult.priorityScores?.summary.lowCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screenshot Section */}
          <Card>
            <CardHeader>
              <CardTitle>Violations Screenshot</CardTitle>
            </CardHeader>
            <CardContent>
              {jobId && <ScreenshotDisplay jobId={jobId} />}
            </CardContent>
          </Card>

          {/* Violations List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Accessibility Violations
            </h2>
            <div className="space-y-4">
              {scanResult.priorityScores?.violations.map((violation: any, index: number) => (
                <ViolationCard
                  key={`${violation.violationId}-${index}`}
                  violation={violation}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
