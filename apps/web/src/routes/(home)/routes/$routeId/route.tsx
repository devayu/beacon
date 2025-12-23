"use client";
import { scheduleScan } from "@/actions/scan/schedule-scan";
import { GetLastRunsT } from "@/dal/overview/get-last-runs";
import { getLastRuns } from "@/dal/overview/get-last-runs";
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
  Activity,
  Clock,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowLeft,
  Scan,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(home)/routes/$routeId")({
  loader: async ({ params }) => {
    const lastRuns = await getLastRuns({ data: params.routeId } as any);

    if (isActionError(lastRuns)) {
      throw redirect({ to: "/" });
    }

    return lastRuns;
  },
  component: OverviewPage,
});

type TransformedResult = {
  detailedExplanation: string;
  explanation: string;
  priorityScore: number;
  recommendation: string;
  ruleId: string;
};

function OverviewPage() {
  const lastRuns = Route.useLoaderData();
  const { status, isLoading, error, startPolling, stopPolling, isPolling } =
    useScanStatus();
  const [isScanning, setIsScanning] = useState(false);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [wasPolling, setWasPolling] = useState(false);
  const { metadata } = lastRuns;
  const router = useRouter();
  const parsedCron = parseCron((metadata?.metadata as any)?.frequency);

  // Calculate stats from scans
  const totalScans = lastRuns.lastScans?.length || 0;
  const totalIssues =
    lastRuns.lastScans?.reduce((acc: number, scan: any) => {
      const results = (scan.transformedResult as TransformedResult[]) || [];
      return acc + results.length;
    }, 0) || 0;

  const latestScan = lastRuns.lastScans?.[0];
  const latestIssues = latestScan?.transformedResult?.length || 0;
  const previousScan = lastRuns.lastScans?.[1];
  const previousIssues = previousScan?.transformedResult?.length || 0;
  const issuesTrend = previousScan ? latestIssues - previousIssues : 0;

  const passedScans =
    lastRuns.lastScans?.filter(
      (scan: any) =>
        (scan.transformedResult as TransformedResult[])?.length === 0
    ).length || 0;
  const passRate =
    totalScans > 0 ? Math.round((passedScans / totalScans) * 100) : 0;

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
      return "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_20px_-8px_rgba(239,68,68,0.4)]";
    if (score >= 7)
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    if (score >= 5) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8.5) return "CRITICAL";
    if (score >= 7) return "HIGH";
    if (score >= 5) return "MEDIUM";
    return "LOW";
  };

  const getPriorityIcon = (score: number) => {
    if (score >= 8.5) return <AlertCircle className="w-3.5 h-3.5" />;
    if (score >= 7) return <AlertTriangle className="w-3.5 h-3.5" />;
    if (score >= 5) return <Target className="w-3.5 h-3.5" />;
    return <Eye className="w-3.5 h-3.5" />;
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
      setTimeout(() => {
        router.invalidate();
      }, 1500);
    }
  }, [isPolling, isScanning, wasPolling, status, router]);

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Back Button */}
      <Link
        to="/routes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Routes</span>
      </Link>

      {/* Hero Header Section */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left side - Title and URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-semibold font-serif tracking-tight">
                  {(metadata?.metadata as any)?.name || "Scan Overview"}
                </h1>
                <a
                  href={metadata?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  <span className="font-mono truncate max-w-[400px]">
                    {metadata?.url}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Schedule display */}
            {parsedCron && (
              <Link
                to="/routes/$routeId/settings"
                params={{ routeId: metadata?.id }}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all"
              >
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Schedule
                  </span>
                  <span className="text-sm font-medium">
                    {cronDescription(parsedCron?.frequency, {
                      time: parsedCron?.time,
                      dayOfMonth: parsedCron?.dayOfMonth,
                      dayOfWeek: parsedCron?.dayOfWeek,
                    })}
                  </span>
                </div>
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}

            {/* Scan button */}
            <IconButton
              onClick={handleScan}
              disabled={isScanning}
              className="min-w-[140px] h-11 gap-2 text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  New Scan
                </>
              )}
            </IconButton>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {/* Total Scans */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Scans
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {totalScans}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Historical analysis</span>
            </div>
          </CardContent>
        </Card>

        {/* Latest Issues */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-destructive/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Latest Issues
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {latestIssues}
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl",
                  latestIssues === 0
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {latestIssues === 0 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              {issuesTrend !== 0 && previousScan && (
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                    issuesTrend > 0
                      ? "bg-red-500/10 text-red-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  )}
                >
                  <TrendingUp
                    className={cn("w-3 h-3", issuesTrend < 0 && "rotate-180")}
                  />
                  {Math.abs(issuesTrend)} {issuesTrend > 0 ? "more" : "fewer"}
                </span>
              )}
              {issuesTrend === 0 && previousScan && (
                <span className="text-muted-foreground">
                  No change from previous
                </span>
              )}
              {!previousScan && (
                <span className="text-muted-foreground">
                  First scan completed
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pass Rate */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {passRate}%
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl",
                  passRate >= 80
                    ? "bg-emerald-500/10 text-emerald-500"
                    : passRate >= 50
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                )}
              >
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {passedScans} of {totalScans} scans passed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Issues Found */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Issues
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {totalIssues}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Across all scans</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Progress (if active) */}
      {status && isPolling && (
        <div className="mb-10">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-md rounded-full animate-pulse" />
                  <div className="relative p-2 rounded-full bg-primary/20">
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  </div>
                </div>
                <span>Scan in Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">
                    {status.step}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {Math.round(status.progress)}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {status.message || "Processing..."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan Runs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-serif">Scan History</h2>
              <p className="text-sm text-muted-foreground">
                Recent accessibility scan results
              </p>
            </div>
          </div>
        </div>

        {!lastRuns.lastScans || lastRuns.lastScans.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Scan className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start your first accessibility scan to see detailed results and
                recommendations.
              </p>
              <IconButton onClick={handleScan} disabled={isScanning}>
                <Scan className="w-4 h-4 mr-2" />
                Start First Scan
              </IconButton>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lastRuns.lastScans.map((scan: any, scanIndex: number) => {
              const parsedResults =
                (scan.transformedResult as TransformedResult[]) || [];
              const isExpanded = expandedRuns.has(scan.id);
              const hasResults = parsedResults.length > 0;
              const isLatest = scanIndex === 0;

              return (
                <Card
                  key={scan.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    "border-border/40 hover:border-primary/30",
                    "bg-card/50 backdrop-blur-sm hover:bg-card/80",
                    isExpanded && "bg-card border-primary/20",
                    isLatest && "ring-1 ring-primary/10"
                  )}
                >
                  <CardHeader
                    className="cursor-pointer px-6 py-5 select-none"
                    onClick={() => toggleExpansion(scan.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Expand/Collapse indicator */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                            isExpanded
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </div>

                        {/* Run info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                              <span className="font-serif">Scan Run</span>
                              {isLatest && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0"
                                >
                                  Latest
                                </Badge>
                              )}
                            </CardTitle>
                            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              #{scan.id.slice(-8)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.updatedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-medium px-3 py-1 text-xs",
                            hasResults
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          )}
                        >
                          {hasResults ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1.5" />
                              {parsedResults.length}{" "}
                              {parsedResults.length === 1 ? "issue" : "issues"}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1.5" />
                              All passed
                            </>
                          )}
                        </Badge>
                        {scan.screenshotUrl && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <ImageIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">Screenshot</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="pt-0 border-t border-border/40">
                      {!hasResults ? (
                        <div className="text-center py-16">
                          <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                            <div className="relative w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            All Checks Passed! 🎉
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            {scan.screenshotUrl
                              ? "No accessibility violations were detected in this scan. Your page meets accessibility standards."
                              : "Scan results are still being processed..."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8 py-6">
                          {/* Screenshots Section */}
                          {(scan.screenshotUrl ||
                            scan.violationsScreenshotUrl) && (
                            <div>
                              <h3 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                <ImageIcon className="w-4 h-4" />
                                Visual Evidence
                              </h3>
                              <div className="grid gap-6 md:grid-cols-2">
                                {scan.screenshotUrl && (
                                  <div className="group relative">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2 pl-1">
                                      Original Page
                                    </p>
                                    <div
                                      className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/20 cursor-zoom-in ring-1 ring-transparent group-hover:ring-primary/30 transition-all shadow-lg"
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
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                          <span className="text-white text-xs font-medium border border-white/20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
                                            <Maximize2 className="w-4 h-4" />
                                            View Full Size
                                          </span>
                                        </div>
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
                                      className="relative rounded-xl overflow-hidden border border-red-500/20 aspect-video bg-muted/20 cursor-zoom-in ring-1 ring-transparent group-hover:ring-red-500/30 transition-all shadow-lg"
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
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                          <span className="text-white text-xs font-medium border border-white/20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
                                            <Maximize2 className="w-4 h-4" />
                                            View Full Size
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Issues Section */}
                          <div className="border-t border-border/40 pt-8">
                            <h3 className="font-medium mb-6 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                              Issues & Recommendations ({parsedResults.length})
                            </h3>
                            <div className="space-y-4">
                              {parsedResults.map((issue, index) => (
                                <Card
                                  key={`${scan.id}-${issue.ruleId}-${index}`}
                                  className="overflow-hidden border border-border/30 shadow-sm bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm"
                                >
                                  <CardContent className="p-0">
                                    <div className="flex flex-col">
                                      {/* Issue Header */}
                                      <div className="flex flex-wrap items-center gap-3 p-5 border-b border-border/30 bg-muted/20">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "uppercase font-bold tracking-wider text-[10px] border px-2.5 py-1 flex items-center gap-1.5",
                                            getPriorityColor(
                                              issue.priorityScore
                                            )
                                          )}
                                        >
                                          {getPriorityIcon(issue.priorityScore)}
                                          {getPriorityLabel(
                                            issue.priorityScore
                                          )}
                                          <span className="opacity-60 ml-1">
                                            •
                                          </span>
                                          <span className="font-mono">
                                            {issue.priorityScore}
                                          </span>
                                        </Badge>
                                        <code className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                          {issue.ruleId}
                                        </code>
                                      </div>

                                      {/* Issue Content */}
                                      <div className="p-5 space-y-6">
                                        <div className="grid md:grid-cols-[1.5fr,1fr] gap-6">
                                          {/* Issue Description */}
                                          <div className="space-y-3">
                                            <h4 className="font-serif text-lg font-medium leading-snug text-foreground">
                                              {issue.explanation}
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                              {issue.detailedExplanation}
                                            </p>
                                          </div>

                                          {/* Recommendation */}
                                          <div className="relative">
                                            <div className="absolute -inset-px bg-gradient-to-br from-primary/20 to-transparent rounded-xl opacity-50" />
                                            <div className="relative bg-background/80 backdrop-blur-sm rounded-xl border border-primary/10 p-4 h-full">
                                              <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                How to Fix
                                              </h5>
                                              <div className="text-xs font-mono text-foreground/80 break-words whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                                {issue.recommendation}
                                              </div>
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
