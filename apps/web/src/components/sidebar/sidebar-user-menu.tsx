"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  ChevronsUpDown,
  LogOut,
  User,
  User2,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeSelector from "@/components/theme-selector";
import { cn } from "@/lib/utils";

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
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </>
    );
  }
  if (!session?.user) {
    return (
      <>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50">
          <User2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium">Guest User</p>
          <p className="text-xs text-muted-foreground">Not signed in</p>
        </div>
      </>
    );
  }

  return (
    <>
      {session.user.image ? (
        <Avatar className="h-9 w-9 rounded-xl border border-border/50">
          <AvatarImage
            src={session.user.image}
            alt={session.user.name ?? "User"}
          />
          <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
          <span className="text-sm font-semibold text-primary">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
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
    <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  "h-14 px-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent/80",
                  "data-[state=open]:bg-sidebar-accent"
                )}
              >
                <UserAvatar session={session} isPending={isPending} />
                <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-64 p-2">
              {/* User info header */}
              <div className="px-2 py-3 mb-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {session?.user?.image ? (
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={session.user.image} />
                      <AvatarFallback className="rounded-xl">
                        {session.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {session?.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer">
                <Wallet className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>Billing</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer">
                <Sparkles className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <ThemeSelector />

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="h-10 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarUserMenu;
