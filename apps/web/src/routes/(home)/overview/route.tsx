import DashboardHeader from "@/components/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/overview")({
  component: RoutesLayoutComponent,
});

function RoutesLayoutComponent() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main>
            <DashboardHeader />
            <Outlet />
          </main>
        </SidebarInset>

        <Toaster richColors closeButton />
      </SidebarProvider>
    </>
  );
}
