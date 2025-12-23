import RegisterRouteForm from "@/components/dashboard/register-route-form";
import RouteList from "@/components/routes-list";
import { getRegisteredRoutes } from "@/dal/routes/get-routes";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, Activity, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Note the trailing slash in the path - this denotes an index route
export const Route = createFileRoute("/(home)/routes/")({
  loader: async () => await getRegisteredRoutes(),
  component: RoutesIndexPage,
});

function RoutesIndexPage() {
  const routes = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-8">
      {/* Hero Header */}
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-semibold font-serif tracking-tight">
                  Routes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Monitor your web pages for accessibility issues
                </p>
              </div>
            </div>
          </div>

          <RegisterRouteForm />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{routes.length}</p>
              <p className="text-xs text-muted-foreground">Total Routes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{routes.length}</p>
              <p className="text-xs text-muted-foreground">Active Monitors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Quick Actions</p>
              <p className="text-xs text-muted-foreground">
                Use the Register button above to add a new route
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-serif">Your Routes</h2>
            <p className="text-sm text-muted-foreground">
              Click on a route to view scan details
            </p>
          </div>
        </div>

        <RouteList routes={routes} />
      </div>
    </div>
  );
}
