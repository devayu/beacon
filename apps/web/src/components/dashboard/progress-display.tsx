"use client";

import { ScanStatus } from "@/hooks/useScanStatus";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle2, Loader2 } from "lucide-react";

interface ProgressDisplayProps {
  status: ScanStatus;
  isLoading?: boolean;
}

export function ProgressDisplay({
  status,
  isLoading = false,
}: ProgressDisplayProps) {
  const isComplete = status.progress >= 100;

  return (
    <Card
      className={cn(
        "mb-6 border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden",
        isComplete ? "border-emerald-500/20" : "border-primary/20"
      )}
    >
      {/* Top gradient accent */}
      <div
        className={cn(
          "h-1 w-full",
          isComplete
            ? "bg-gradient-to-r from-emerald-500/50 via-emerald-500 to-emerald-500/50"
            : "bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        )}
      />

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-md",
                isComplete ? "bg-emerald-500/30" : "bg-primary/30"
              )}
            />
            <div
              className={cn(
                "relative p-2 rounded-full",
                isComplete ? "bg-emerald-500/20" : "bg-primary/20"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : isLoading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              )}
            </div>
          </div>
          <span
            className={cn(
              "font-serif",
              isComplete && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isComplete ? "Scan Complete" : "Scan Progress"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">{status.step}</span>
            <span
              className={cn(
                "font-mono text-sm px-2 py-0.5 rounded-md",
                isComplete
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {Math.round(status.progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                isComplete
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  : "bg-gradient-to-r from-primary to-primary/70"
              )}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {status.message || "Processing..."}
          </p>

          {!isComplete && (
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur rounded-full animate-pulse" />
                <div className="relative h-2 w-2 rounded-full bg-primary" />
              </div>
              <span className="text-muted-foreground">Scan in progress...</span>
            </div>
          )}

          {isComplete && (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Scan completed successfully!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
