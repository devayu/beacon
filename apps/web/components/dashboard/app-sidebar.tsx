import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import PinnedSidebarGroup from "../sidebar/pinned-sidebar-group";
import SidebarUserMenu from "../sidebar/sidebar-user-menu";
import WorkspaceSidebarGroup from "../sidebar/workspace-sidebar-group";
import { Suspense } from "react";

// Menu items.
const items = [
  {
    title: "Overview",
    url: "/overview",
    icon: Home,
  },
  {
    title: "Monitors",
    url: "/dashboard",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <WorkspaceSidebarGroup />
        <PinnedSidebarGroup />
      </SidebarContent>
      <SidebarUserMenu />
    </Sidebar>
  );
}
