import DashboardHeader from "@/components/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main>
            <DashboardHeader></DashboardHeader>
            {children}
          </main>
        </SidebarInset>

        <Toaster richColors closeButton />
      </SidebarProvider>
    </>
  );
}
