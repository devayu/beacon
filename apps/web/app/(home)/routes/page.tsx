import { getRegisteredRoutes } from "@/app/dal/routes/get-routes";
import Dashboard from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const routes = await getRegisteredRoutes();
  return <Dashboard routes={routes}></Dashboard>;
}
