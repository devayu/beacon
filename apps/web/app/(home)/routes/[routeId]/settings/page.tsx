import { getRouteById } from "@/app/dal/routes/get-routes";
import CronSelector from "@/components/cron-selector";

export default async function SettingsPage(
  props: PageProps<"/routes/[routeId]/settings">
) {
  const routeInfo = await getRouteById((await props.params).routeId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="font-serif font-semibold mb-4">Scheduled Frequency</h2>
      <CronSelector
        defaultValue={(routeInfo?.metadata as any)?.frequency}
      ></CronSelector>
    </div>
  );
}
