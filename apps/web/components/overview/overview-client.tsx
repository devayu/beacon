"use client";
import { scheduleScan } from "@/app/actions/scan/schedule-scan";
import { GetLastRunsT } from "@/app/dal/overview/get-last-runs";
import { ProgressDisplay } from "@/components/dashboard/progress-display";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IconButton from "@/components/ui/icon-button";
import { useScanStatus } from "@/hooks/useScanStatus";
import { isActionError } from "@/lib/error";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TransformedResult = {
  detailedExplanation: string;
  explanation: string;
  priorityScore: number;
  recommendation: string;
  ruleId: string;
};

const Overview = ({ lastRuns }: { lastRuns: GetLastRunsT }) => {
  const { status, isLoading, error, startPolling, stopPolling, isPolling } =
    useScanStatus();
  const [isScanning, setIsScanning] = useState(false);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [wasPolling, setWasPolling] = useState(false);
  const { metadata } = lastRuns;
  const router = useRouter();

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

  const toggleExpansion = (runId: string) => {
    setExpandedRuns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(runId)) {
        newSet.delete(runId);
      } else {
        newSet.add(runId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8.5) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 7) return "bg-orange-100 text-orange-800 border-orange-200";
    if (score >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8.5) return "URGENT";
    if (score >= 7) return "HIGH";
    if (score >= 5) return "MEDIUM";
    return "LOW";
  };

  // Track polling state changes
  useEffect(() => {
    setWasPolling(isPolling);
  }, [isPolling]);

  // Handle scan completion and page refresh
  useEffect(() => {
    if (!isPolling && isScanning) {
      setIsScanning(false);
    }

    // If we were polling and now we're not (scan completed), refresh the page
    if (wasPolling && !isPolling && status && status.progress >= 100) {
      toast.success("Scan completed! Refreshing results...");
      // Small delay to ensure the success toast is visible
      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
  }, [isPolling, isScanning, wasPolling, status, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2 font-serif">
              Scan Overview
            </h1>
            <p className="text-gray-600">{metadata?.url}</p>
          </div>
          <IconButton
            onClick={handleScan}
            disabled={isScanning}
            className="min-w-[120px]"
          >
            {isScanning ? "Scanning..." : "New Scan"}
          </IconButton>
        </div>
      </div>

      {/* Scan Runs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recent Scan Runs</h2>
        
        {status && isPolling && (
          <ProgressDisplay status={status} isLoading={isLoading} />
        )}

        {!lastRuns.lastScans || lastRuns.lastScans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                No scan runs found. Start your first scan!
              </p>
            </CardContent>
          </Card>
        ) : (
          lastRuns.lastScans.map((scan) => {
            const parsedResults =
              (scan.transformedResult as TransformedResult[]) || [];
            const isExpanded = expandedRuns.has(scan.id);
            const hasResults = parsedResults.length > 0;
            return (
              <Card key={scan.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleExpansion(scan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Scan Run #{scan.id.slice(-8)}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(scan.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {hasResults
                          ? `${parsedResults.length} issues`
                          : "No issues"}
                      </Badge>
                      {scan.screenshotUrl && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {!hasResults ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {scan.screenshotUrl
                            ? "No accessibility issues found! 🎉"
                            : "Scan results not available yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Screenshots Section */}
                        {(scan.screenshotUrl ||
                          scan.violationsScreenshotUrl) && (
                          <div className="border-t pt-4">
                            <h3 className="font-medium mb-3">Screenshots</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              {scan.screenshotUrl && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Original Page
                                  </p>
                                  <img
                                    src={scan.screenshotUrl}
                                    alt="Page screenshot"
                                    className="w-full border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() =>
                                      window.open(
                                        scan.screenshotUrl as string,
                                        "_blank"
                                      )
                                    }
                                  />
                                </div>
                              )}
                              {scan.violationsScreenshotUrl && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Violations Highlighted
                                  </p>
                                  <img
                                    src={scan.violationsScreenshotUrl}
                                    alt="Violations screenshot"
                                    className="w-full border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() =>
                                      window.open(
                                        scan.violationsScreenshotUrl as string,
                                        "_blank"
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Issues Section */}
                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-3">
                            Accessibility Issues Found ({parsedResults.length})
                          </h3>
                          <div className="space-y-3">
                            {parsedResults.map((issue, index) => (
                              <div
                                key={`${scan.id}-${issue.ruleId}-${index}`}
                                className="border rounded-lg p-4 "
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <code className="text-sm px-2 py-1 rounded font-mono">
                                        {issue.ruleId}
                                      </code>
                                      <Badge
                                        className={getPriorityColor(
                                          issue.priorityScore
                                        )}
                                      >
                                        {getPriorityLabel(issue.priorityScore)}{" "}
                                        ({issue.priorityScore})
                                      </Badge>
                                    </div>
                                    <h4 className="font-medium mb-2 font-serif">
                                      {issue.explanation}
                                    </h4>
                                    <p className="text-sm mb-3 opacity-85 font-sans">
                                      {issue.detailedExplanation}
                                    </p>
                                    <div className="bg-blue-50 border-l-4 border-chart- p-3 rounded">
                                      <h5 className="font-medium text-chart-1 mb-1">
                                        Recommendation:
                                      </h5>
                                      <p className="text-sm text-chart-1 font-mono">
                                        <code>{issue.recommendation}</code>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Overview;
