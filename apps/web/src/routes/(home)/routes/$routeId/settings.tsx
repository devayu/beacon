import { CronSelector } from "@/components/cron-selector";
import { getRouteById } from "@/dal/routes/get-routes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/routes/$routeId/settings")({
  component: SettingsPage,
});

async function SettingsPage() {
  const { routeId } = Route.useParams();
  const routeInfo = await getRouteById(routeId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="font-serif font-semibold mb-4">Scheduled Frequency</h2>
      <CronSelector
        defaultValue={(routeInfo?.metadata as any)?.frequency}
      ></CronSelector>
    </div>
  );
}
