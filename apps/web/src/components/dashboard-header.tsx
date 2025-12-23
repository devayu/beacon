"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "@tanstack/react-router";
import { items } from "@/components/sidebar/workspace-sidebar-group";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

function BreadcrumbContent() {
  const { pathname } = useLocation();
  const currentItem = items.find(
    (item) => item.url !== "#" && pathname.startsWith(item.url)
  );

  const getSubPaths = () => {
    if (!currentItem) return [];
    const remainingPath = pathname
      .replace(currentItem.url, "")
      .replace(/^\//, "");
    return remainingPath ? remainingPath.split("/").filter(Boolean) : [];
  };

  const subPaths = getSubPaths();

  if (!currentItem) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Current section */}
      <a
        href={currentItem.url}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm",
          "transition-colors duration-200",
          subPaths.length === 0
            ? "font-medium text-foreground bg-muted/50"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <currentItem.icon className="h-4 w-4" />
        <span>{currentItem.title}</span>
      </a>

      {/* Sub paths */}
      {subPaths.map((segment, index) => {
        const subPathUrl =
          currentItem.url + "/" + subPaths.slice(0, index + 1).join("/");
        const isLast = index === subPaths.length - 1;

        // Format segment for display (handle UUID-like strings)
        const displaySegment =
          segment.length > 12 ? `${segment.slice(0, 8)}...` : segment;

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            <a
              href={subPathUrl}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-sm capitalize",
                "transition-colors duration-200",
                isLast
                  ? "font-medium text-foreground bg-muted/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {displaySegment}
            </a>
          </div>
        );
      })}
    </div>
  );
}

const DashboardHeader = () => {
  return (
    <header
      className={cn(
        "sticky top-0 z-20",
        "flex h-14 shrink-0 items-center gap-4",
        "border-b border-border/40",
        "bg-background/80 backdrop-blur-lg",
        "px-4"
      )}
    >
      {/* Sidebar trigger with separator */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-muted/80 transition-colors" />
        <div className="h-5 w-px bg-border/60" />
      </div>

      {/* Breadcrumb navigation */}
      <nav className="flex-1 min-w-0">
        <BreadcrumbContent />
      </nav>

      {/* Right side actions placeholder */}
      <div className="flex items-center gap-2">
        {/* Future: Search, notifications, etc */}
      </div>
    </header>
  );
};

export default DashboardHeader;
