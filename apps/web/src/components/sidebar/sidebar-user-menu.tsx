"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ChevronsUpDown, LogOut, User, User2, Wallet } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeSelector from "@/components/theme-selector";

export type Session = typeof authClient.$Infer.Session;

const UserAvatar = ({
  session,
  isPending,
}: {
  session: Session | null;
  isPending: boolean;
}) => {
  if (isPending) {
    return (
      <>
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </>
    );
  }
  if (!session?.user) {
    return (
      <>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <User2 size={16} />
        </div>
        <div className="flex flex-col">
          <p className="font-serif text-sm">Guest User</p>
          <p className="text-xs text-muted-foreground">Not signed in</p>
        </div>
      </>
    );
  }

  return (
    <>
      {session.user.image ? (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage
            src={session.user.image}
            alt={session.user.name ?? "User"}
          />
          <AvatarFallback className="rounded-lg">
            <User2 size={16} />
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <User2 size={16} />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-serif text-sm truncate">
          {session.user.name ?? "User"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {session.user.email}
        </p>
      </div>
    </>
  );
};
const SidebarUserMenu = () => {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: "/sign-in" });
          },
          onError: (error) => {
            console.error("Sign out error:", error);
            navigate({ to: "/sign-in" });
          },
        },
      });
    } catch (error) {
      console.error("Sign out failed:", error);
      navigate({ to: "/sign-in" });
    }
  };

  return (
    <SidebarFooter className="font-sans">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <UserAvatar session={session} isPending={isPending} />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-[--radix-popper-anchor-width] min-w-56"
            >
              <DropdownMenuItem>
                <div className="flex gap-2">
                  <User className="size-4"></User>
                  Account
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex gap-2">
                  <Wallet className="size-4"></Wallet>
                  Billing
                </div>
              </DropdownMenuItem>
              <ThemeSelector />
              <DropdownMenuItem onClick={handleSignOut}>
                <div className="flex gap-2">
                  <LogOut className="size-4"></LogOut>
                  Sign out
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarUserMenu;
