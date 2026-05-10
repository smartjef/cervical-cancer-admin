"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Settings,
  Globe,
  ChevronRight,
  Moon,
  Sun,
  UserPlus,
  Loader2,
  Monitor,
  XCircle,
  LogOut,
  User,
  Activity,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [isLoginAsOpen, setIsLoginAsOpen] = useState(false);
  const [isImpersonatingRunning, setIsImpersonatingRunning] = useState(false);
  const { toast } = useToast();

  const user = session?.user;
  const sessionData = (session as any)?.session;
  const isImpersonating = !!(
    sessionData?.impersonatedBy ||
    sessionData?.impersonatorId ||
    (user as any)?.impersonatedBy
  );
  const isAdmin = (user as any)?.role === "admin" || isImpersonating;

  // Fetch users for the search list - only for admins or when impersonating
  const { data: usersData, isLoading: usersLoading } = useApi<any>(
    isAdmin ? "/auth/admin/list-users" : null,
  );
  const users = usersData?.users || [];

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleImpersonate = async (
    targetUserId: string,
    targetUserName: string,
  ) => {
    setIsImpersonatingRunning(true);
    try {
      await apiRequest(`/auth/admin/impersonate-user`, {
        method: "POST",
        body: JSON.stringify({ userId: targetUserId }),
      });
      setIsLoginAsOpen(false);
      toast({
        title: "Impersonation Started",
        description: `You are now logged in as ${targetUserName}.`,
        variant: "success",
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to impersonate", error);
      toast({
        title: "Error",
        description: "Failed to start impersonation.",
        variant: "destructive",
      });
    } finally {
      setIsImpersonatingRunning(false);
    }
  };

  const handleStopImpersonation = async () => {
    setIsImpersonatingRunning(true);
    try {
      await apiRequest(`/auth/admin/stop-impersonating`, {
        method: "POST",
      });
      toast({
        title: "Impersonation Ended",
        description: "You have returned to your administrator account.",
        variant: "success",
      });
      window.location.href = "/dashboard";
    } catch (error) {
      // Fallback: simple logout if API fails
      await signOut();
      Cookies.remove("better-auth.session_token");
      window.location.href = "/login";
    } finally {
      setIsImpersonatingRunning(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <div className="flex flex-col w-full sticky top-0 z-50">
      {mounted && isImpersonating && (
        <div className="bg-amber-500 py-1.5 px-6 flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 text-white">
            <Monitor className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">
              Impersonation Mode Active:{" "}
              <span className="underline decoration-white/40">
                {user?.name || user?.email}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStopImpersonation}
            className="h-7 bg-white/10 hover:bg-white/20 text-white border-white/20 font-black text-[10px] uppercase tracking-tighter"
            disabled={isImpersonatingRunning}
          >
            {isImpersonatingRunning ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            Exit Session
          </Button>
        </div>
      )}

      <header className="flex h-14 shrink-0 items-center justify-between px-6 bg-sidebar/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden w-60 md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-full bg-muted/60 pl-9 text-sm border border-border rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2 px-4 pr-6">
            {mounted && isAdmin && (
              <Popover open={isLoginAsOpen} onOpenChange={setIsLoginAsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-2 border-border/60 hover:bg-primary/5 hover:text-primary transition-all",
                      isImpersonating &&
                        "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300",
                    )}
                  >
                    {isImpersonating ? (
                      <Monitor className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    <span className="hidden lg:inline">
                      {isImpersonating ? "Impersonating" : "Log in as"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0 border-border"
                  align="end"
                >
                  <Command className="bg-card">
                    <CommandInput
                      placeholder="Search users by name or email..."
                      className="border-none focus:ring-0"
                    />
                    <CommandList className="max-h-[350px]">
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup heading="System Users">
                        {usersLoading ? (
                          <div className="p-4 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          users.map((u: any) => (
                            <CommandItem
                              key={u.id}
                              value={`${u.name} ${u.email}`}
                              onSelect={() =>
                                handleImpersonate(u.id, u.name || u.email)
                              }
                              className="flex items-center justify-between p-2 cursor-pointer hover:bg-accent/50"
                              disabled={
                                u.id === user?.id || isImpersonatingRunning
                              }
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">
                                  {u.name || "No Name"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {u.email}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 font-black uppercase tracking-tighter"
                              >
                                {u.role}
                              </Badge>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                    {isImpersonating && (
                      <div className="p-2 border-t border-border bg-amber-50/50 dark:bg-amber-950/10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopImpersonation}
                          className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-100 font-bold rounded-lg"
                          disabled={isImpersonatingRunning}
                        >
                          <XCircle className="h-4 w-4" />
                          Exit Impersonation
                        </Button>
                      </div>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                ))}
            </button>
          </div>

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                  <div className="hidden md:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 italic">
                      {(user as any)?.role || "User"}
                    </span>
                  </div>
                  <div className="relative">
                    <Avatar className="h-8 w-8 border border-border hover:ring-2 hover:ring-primary/30 transition-all">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-background rounded-full flex items-center justify-center border border-border ">
                      <ChevronDown className="h-2 w-2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 border-border/50 rounded-xl"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold truncate">
                      {user?.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5 opacity-50" />
                <DropdownMenuItem
                  asChild
                  className="rounded-lg h-9 px-3 gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary"
                >
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-bold">View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg h-9 px-3 gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary"
                >
                  <Link href="/dashboard" className="flex items-center w-full">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 opacity-50" />
                <DropdownMenuItem
                  className="rounded-lg h-9 px-3 gap-2 cursor-pointer text-rose-600 focus:bg-rose-500/5 focus:text-rose-600 font-bold"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="bg-card border-border ">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Sign Out
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground font-medium">
                Are you sure you want to log out of your account? You will need
                to sign in again to access the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border-none font-bold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
    </div>
  );
}
