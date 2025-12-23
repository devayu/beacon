import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import PinnedSidebarGroup from "../sidebar/pinned-sidebar-group";
import SidebarUserMenu from "../sidebar/sidebar-user-menu";
import WorkspaceSidebarGroup from "../sidebar/workspace-sidebar-group";
import BeaconIcon from "@/components/beacon-icon";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
        <BeaconIcon asLink showText />
      </SidebarHeader>
      <SidebarContent className="py-2">
        <WorkspaceSidebarGroup />
        <PinnedSidebarGroup />
      </SidebarContent>
      <SidebarUserMenu />
      <SidebarRail />
    </Sidebar>
  );
}
