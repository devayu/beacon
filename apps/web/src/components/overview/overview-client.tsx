"use client";
import { scheduleScan } from "@/actions/scan/schedule-scan";
import { GetLastRunsT } from "@/dal/overview/get-last-runs";
import { ProgressDisplay } from "@/components/dashboard/progress-display";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IconButton from "@/components/ui/icon-button";
import { useScanStatus } from "@/hooks/useScanStatus";
import { cronDescription, parseCron } from "@/lib/cron";
import { isActionError } from "@/lib/error";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Edit,
  CheckCircle2,
  ImageIcon,
  Maximize2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const parsedCron = parseCron((metadata?.metadata as any)?.frequency);

  const handleScan = async () => {
    setIsScanning(true);

    try {
      const res = await scheduleScan({ data: lastRuns.metadata?.id! } as any);

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
    if (score >= 8.5)
      return "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_-4px_rgba(239,68,68,0.2)]";
    if (score >= 7)
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (score >= 5)
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
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
        router.invalidate();
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
            <p className="text-muted-foreground">{metadata?.url}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <IconButton
              onClick={handleScan}
              disabled={isScanning}
              className="min-w-[120px]"
            >
              {isScanning ? "Scanning..." : "New Scan"}
            </IconButton>
            <a
              href={`${metadata?.id}/settings`}
              className="text-sm flex gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {parsedCron &&
                cronDescription(parsedCron?.frequency, {
                  time: parsedCron?.time,
                  dayOfMonth: parsedCron?.dayOfMonth,
                  dayOfWeek: parsedCron?.dayOfWeek,
                })}
              <Edit className="size-4"></Edit>{" "}
            </a>
          </div>
        </div>
      </div>

      {/* Scan Runs List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Recent Scan Runs</h2>

        {status && isPolling && (
          <ProgressDisplay status={status} isLoading={isLoading} />
        )}

        {!lastRuns.lastScans || lastRuns.lastScans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No scan runs found. Start your first scan!
              </p>
            </CardContent>
          </Card>
        ) : (
          lastRuns.lastScans.map((scan: any) => {
            const parsedResults =
              (scan.transformedResult as TransformedResult[]) || [];
            const isExpanded = expandedRuns.has(scan.id);
            const hasResults = parsedResults.length > 0;
            return (
              <Card
                key={scan.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 border-l-[3px] border-l-transparent hover:border-l-primary group"
              >
                <CardHeader
                  className="cursor-pointer bg-card/50 px-6 py-4"
                  onClick={() => toggleExpansion(scan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <span className="font-serif">Scan Run</span>
                          <span className="font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                            #{scan.id.slice(-8)}
                          </span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {new Date(scan.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-normal",
                          hasResults
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-500"
                        )}
                      >
                        {hasResults
                          ? `${parsedResults.length} issues found`
                          : "No issues detected"}
                      </Badge>
                      {scan.screenshotUrl && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 bg-background/50">
                    {!hasResults ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="text-foreground font-medium text-lg mb-1">
                          Passed all checks
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {scan.screenshotUrl
                            ? "No accessibility violations were detected in this run."
                            : "Scan results not available yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8 p-6">
                        {/* Screenshots Section */}
                        {(scan.screenshotUrl ||
                          scan.violationsScreenshotUrl) && (
                          <div className="">
                            <h3 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                              <ImageIcon className="w-4 h-4" />
                              Visual Evidence
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2">
                              {scan.screenshotUrl && (
                                <div className="group relative">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 pl-1">
                                    Original State
                                  </p>
                                  <div
                                    className="relative rounded-xl overflow-hidden border shadow-sm aspect-video bg-muted/20 cursor-zoom-in ring-1 ring-border/50 group-hover:ring-primary/20 transition-all"
                                    onClick={() =>
                                      window.open(
                                        scan.screenshotUrl as string,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <img
                                      src={scan.screenshotUrl}
                                      alt="Page screenshot"
                                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white text-xs font-medium border border-white/20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md flex items-center gap-2">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        View Fullscreen
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {scan.violationsScreenshotUrl && (
                                <div className="group relative">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 pl-1">
                                    Violations Highlighted
                                  </p>
                                  <div
                                    className="relative rounded-xl overflow-hidden border shadow-sm aspect-video bg-muted/20 cursor-zoom-in ring-1 ring-border/50 group-hover:ring-destructive/20 transition-all"
                                    onClick={() =>
                                      window.open(
                                        scan.violationsScreenshotUrl as string,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <img
                                      src={scan.violationsScreenshotUrl}
                                      alt="Violations screenshot"
                                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white text-xs font-medium border border-white/20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md flex items-center gap-2">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        View Fullscreen
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Issues Section */}
                        <div className="border-t pt-8">
                          <h3 className="font-medium mb-6 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            Findings & Recommendations ({parsedResults.length})
                          </h3>
                          <div className="space-y-5">
                            {parsedResults.map((issue, index) => (
                              <Card
                                key={`${scan.id}-${issue.ruleId}-${index}`}
                                className="overflow-hidden border border-border/40 shadow-none bg-zinc-50/50 dark:bg-zinc-900/40"
                              >
                                <CardContent className="p-0">
                                  <div className="flex flex-col md:flex-row">
                                    {/* Left Status Strip */}
                                    <div
                                      className={cn(
                                        "w-full md:w-1",
                                        getPriorityColor(issue.priorityScore)
                                          .replace("text-", "bg-")
                                          .split(" ")[0]
                                      )}
                                    />

                                    <div className="p-5 flex-1 flex flex-col gap-4">
                                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                                        <div className="flex items-center gap-3">
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "uppercase font-bold tracking-wider text-[10px] border px-2",
                                              getPriorityColor(
                                                issue.priorityScore
                                              )
                                            )}
                                          >
                                            {getPriorityLabel(
                                              issue.priorityScore
                                            )}{" "}
                                            • {issue.priorityScore}
                                          </Badge>
                                          <code className="text-[10px] text-muted-foreground font-mono">
                                            {issue.ruleId}
                                          </code>
                                        </div>
                                      </div>

                                      <div className="grid md:grid-cols-[1.5fr,1fr] gap-6">
                                        <div className="space-y-2">
                                          <h4 className="font-serif text-lg font-medium leading-snug text-foreground">
                                            {issue.explanation}
                                          </h4>
                                          <p className="text-sm text-muted-foreground leading-relaxed">
                                            {issue.detailedExplanation}
                                          </p>
                                        </div>

                                        <div className="bg-background rounded-md border border-border/50 p-4 shadow-sm h-full">
                                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                            Fix Recommendation
                                          </h5>
                                          <div className="text-xs font-mono text-foreground/80 break-words whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                            {issue.recommendation}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
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
