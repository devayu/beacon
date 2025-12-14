import Overview from "@/components/overview/overview-client";
import { getLastRuns } from "@/dal/overview/get-last-runs";
import { isActionError } from "@/lib/error";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/routes/$routeId")({
  loader: async ({ params }) => {
    const lastRuns = await getLastRuns(params.routeId);

    if (isActionError(lastRuns)) {
      throw redirect({ to: "/" });
    }

    return lastRuns;
  },
  component: OverviewPage,
});

function OverviewPage() {
  const lastRuns = Route.useLoaderData();

  return <Overview lastRuns={lastRuns} />;
}
