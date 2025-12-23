import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bell, Blocks, Route, Settings } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

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
    url: "/settings",
    icon: Settings,
  },
];

const WorkspaceSidebarGroup = () => {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
        Workspace
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item: any) => {
          const isActive = item.url !== "#" && pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "relative h-10 px-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent/80",
                  isActive && [
                    "bg-primary/10 text-primary",
                    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                    "before:h-6 before:w-1 before:rounded-full before:bg-primary",
                  ]
                )}
              >
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default WorkspaceSidebarGroup;
