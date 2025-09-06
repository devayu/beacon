import { getRegisteredRoutes } from "@/app/dal/routes/get-routes";
import Dashboard from "@/components/dashboard/dashboard-client";
import RouteList from "@/components/routes-list";

export default async function DashboardPage() {
  const routes = await getRegisteredRoutes();
  console.log(routes);
  return <Dashboard routes={routes}></Dashboard>;
}
