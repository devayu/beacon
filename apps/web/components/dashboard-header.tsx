"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { items } from "@/components/sidebar/workspace-sidebar-group";
import dynamic from "next/dynamic";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

function DynamicBreadcrumbContent() {
  const pathname = usePathname();
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
          {subPaths?.map((segment, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="capitalize">
                  {segment}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          ))}
        </>
      )}
    </>
  );
}

const ClientOnlyBreadcrumbContent = dynamic(
  () => Promise.resolve(DynamicBreadcrumbContent),
  {
    ssr: false,
  }
);

export function CurrentTab() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <SidebarTrigger></SidebarTrigger>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <ClientOnlyBreadcrumbContent />
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
