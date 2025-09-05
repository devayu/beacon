import { checkUnauthorizedAccess } from "@/lib/get-session";

export default async function OverviewPage() {
  await checkUnauthorizedAccess();
  return <h1>This is a hidden page</h1>;
}
