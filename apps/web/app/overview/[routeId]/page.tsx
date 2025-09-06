import { getLastRuns } from "@/app/dal/overview/get-last-runs";
import Overview from "@/components/overview/overview-client";
import { isActionError } from "@/lib/error";
import { redirect } from "next/navigation";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;
  const lastRuns = await getLastRuns(routeId);

  if (isActionError(lastRuns)) {
    redirect("/dashboard");
  }

  return <Overview lastRuns={lastRuns} />;
}
