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
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <BeaconIcon asLink showText></BeaconIcon>
      </SidebarHeader>
      <SidebarContent>
        <WorkspaceSidebarGroup />
        <PinnedSidebarGroup />
      </SidebarContent>
      <SidebarUserMenu />
    </Sidebar>
  );
}
