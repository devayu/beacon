import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bell, Blocks, Route, Settings } from "lucide-react";

export const items = [
  {
    title: "Overview",
    url: "/overview",
    icon: Blocks,
  },
  {
    title: "Routes",
    url: "/routes",
    icon: Route,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
const WorkspaceSidebarGroup = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-serif text-base">
        Workspace
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item: any) => (
          <SidebarMenuItem key={item.title} className="font-sans">
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span className="text-base tracking-wide">{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default WorkspaceSidebarGroup;
