import RegisterRouteForm from "@/components/dashboard/register-route-form";
import RouteListLoader from "@/components/loaders/route-list-loader";
import RouteList from "@/components/routes-list";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

// Note the trailing slash in the path - this denotes an index route
export const Route = createFileRoute("/(home)/routes/")({
  component: RoutesIndexPage,
});

function RoutesIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium font-serif">Routes</h1>
            <p className="font-sans text-muted-foreground">
              Register a route to start monitoring.
            </p>
          </div>
          <RegisterRouteForm />
        </div>
      </div>

      <Suspense fallback={<RouteListLoader />}>
        <RouteList />
      </Suspense>
    </div>
  );
}
