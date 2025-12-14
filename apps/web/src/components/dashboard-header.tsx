"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "@tanstack/react-router";
import { items } from "@/components/sidebar/workspace-sidebar-group";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

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

  return (
    <>
      {currentItem && (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href={currentItem.url} className="flex items-center gap-2">
                <currentItem.icon className="h-4 w-4" />
                <span>{currentItem.title}</span>
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {subPaths?.map((segment, index) => {
            // Build the URL for this breadcrumb segment
            const subPathUrl =
              currentItem.url + "/" + subPaths.slice(0, index + 1).join("/");

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a href={subPathUrl} className="capitalize">
                      {segment}
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

export function CurrentTab() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <SidebarTrigger></SidebarTrigger>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbContent />
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b bg-background px-2">
      <CurrentTab></CurrentTab>
    </header>
  );
};

export default DashboardHeader;
