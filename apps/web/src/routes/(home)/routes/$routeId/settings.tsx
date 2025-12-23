import { CronSelector } from "@/components/cron-selector";
import { getRouteById } from "@/dal/routes/get-routes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/routes/$routeId/settings")({
  component: SettingsPage,
  loader: async ({ params }) => {
    const routeInfo = await getRouteById({ data: params.routeId } as any);
    return routeInfo;
  },
});

function SettingsPage() {
  const routeInfo = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="font-serif font-semibold mb-4">Scheduled Frequency</h2>
      <CronSelector
        defaultValue={(routeInfo?.metadata as any)?.frequency}
      ></CronSelector>
    </div>
  );
}
