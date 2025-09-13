"use client";

import RegisterRouteForm from "@/components/dashboard/register-route-form";
import RouteList from "@/components/routes-list";
import { Route } from "@beacon/db";

export default function Dashboard({ routes }: { routes: Route[] }) {
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
          <RegisterRouteForm></RegisterRouteForm>
        </div>
      </div>

      <RouteList routes={routes}></RouteList>
    </div>
  );
}
