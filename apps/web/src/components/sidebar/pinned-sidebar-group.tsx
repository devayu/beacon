import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { SidebarGroupContent } from "@/components/ui/sidebar";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Calendar,
  Inbox,
  Search,
  Settings,
  Home,
  Blocks,
  Activity,
  Book,
  Bell,
} from "lucide-react";

type PinnedSidebarGroupProps = {
  items?: any[];
};

const PinnedSidebarGroup = ({ items = [] }: PinnedSidebarGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-serif text-base">
        Pinned
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item: any) => (
            <SidebarMenuItem
              key={item.title}
              className="text-sm font-sans font-semibold"
            >
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
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
