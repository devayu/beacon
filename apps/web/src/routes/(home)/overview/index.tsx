import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Globe,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  BarChart3,
  ArrowUpRight,
  Shield,
  Target,
  Calendar,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/overview/")({
  component: OverviewDashboard,
});

// Dummy data for demonstration
const stats = {
  totalRoutes: 12,
  activeMonitors: 12,
  totalScans: 156,
  issuesFound: 47,
  issuesResolved: 38,
  passRate: 76,
};

const recentScans = [
  {
    id: "1",
    routeName: "testing.com",
    routeId: "abc123",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "passed",
    issuesCount: 0,
  },
  {
    id: "2",
    routeName: "devayu.vercel.app",
    routeId: "def456",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "issues",
    issuesCount: 3,
  },
  {
    id: "3",
    routeName: "pilotplans.com",
    routeId: "ghi789",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "passed",
    issuesCount: 0,
  },
  {
    id: "4",
    routeName: "corp.com",
    routeId: "jkl012",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    status: "issues",
    issuesCount: 5,
  },
];

const topIssues = [
  {
    ruleId: "color-contrast",
    count: 12,
    severity: "critical",
    description: "Elements must have sufficient color contrast",
  },
  {
    ruleId: "image-alt",
    count: 8,
    severity: "high",
    description: "Images must have alternate text",
  },
  {
    ruleId: "label",
    count: 6,
    severity: "medium",
    description: "Form elements must have labels",
  },
  {
    ruleId: "link-name",
    count: 4,
    severity: "medium",
    description: "Links must have discernible text",
  },
];

const routeHealth = [
  { name: "testing.com", score: 100, trend: "up" },
  { name: "devayu.vercel.app", score: 72, trend: "down" },
  { name: "pilotplans.com", score: 95, trend: "up" },
  { name: "corp.com", score: 68, trend: "stable" },
  { name: "legal.com", score: 88, trend: "up" },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
}

function OverviewDashboard() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold font-serif tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Monitor your accessibility compliance across all routes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {/* Total Routes */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Routes
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {stats.totalRoutes}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5" />
              <span>{stats.activeMonitors} actively monitored</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Scans */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Scans
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {stats.totalScans}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
                <Eye className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                <TrendingUp className="w-3 h-3" />
                +12 this week
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Issues Found */}
        <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Open Issues
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {stats.issuesFound - stats.issuesResolved}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{stats.issuesResolved} resolved this month</span>
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
                  {stats.passRate}%
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl",
                  stats.passRate >= 80
                    ? "bg-emerald-500/10 text-emerald-500"
                    : stats.passRate >= 50
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                )}
              >
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                <TrendingUp className="w-3 h-3" />
                +4% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        {/* Recent Scans */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Scans
              </CardTitle>
              <Link
                to="/routes"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentScans.map((scan) => (
              <Link
                key={scan.id}
                to="/routes/$routeId"
                params={{ routeId: scan.routeId }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      scan.status === "passed"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {scan.routeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(scan.timestamp)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    scan.status === "passed"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}
                >
                  {scan.status === "passed"
                    ? "Passed"
                    : `${scan.issuesCount} issues`}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                Top Issues
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Across all routes
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIssues.map((issue, index) => (
              <div
                key={issue.ruleId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-4">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {issue.description}
                    </p>
                    <code className="text-[10px] text-muted-foreground font-mono">
                      {issue.ruleId}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      getSeverityColor(issue.severity)
                    )}
                  >
                    {issue.severity}
                  </Badge>
                  <span className="text-sm font-mono font-medium">
                    {issue.count}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Route Health */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              Route Health Scores
            </CardTitle>
            <Link
              to="/routes"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Manage routes
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {routeHealth.map((route) => (
              <div
                key={route.name}
                className="p-4 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium truncate">{route.name}</p>
                  {route.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  )}
                  {route.trend === "down" && (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold font-mono",
                      route.score >= 90
                        ? "text-emerald-500"
                        : route.score >= 70
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  >
                    {route.score}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">
                    / 100
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      route.score >= 90
                        ? "bg-emerald-500"
                        : route.score >= 70
                          ? "bg-amber-500"
                          : "bg-red-500"
                    )}
                    style={{ width: `${route.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
