import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";

type PinnedSidebarGroupProps = {
  items?: any[];
};

const PinnedSidebarGroup = ({ items = [] }: PinnedSidebarGroupProps) => {
  if (items.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
          Pinned
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-3 py-4">
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg border border-dashed border-sidebar-border/50 bg-sidebar-accent/20">
              <Pin className="h-4 w-4 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground/70">
                No pinned items
              </p>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
        Pinned
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item: any) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="h-9 px-3 rounded-lg hover:bg-sidebar-accent/80 transition-all duration-200"
              >
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default PinnedSidebarGroup;
