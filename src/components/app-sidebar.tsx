"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Activity,
  Building2,
  CalendarClock,
  Smartphone,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Screening", url: "/screening", icon: Activity },
  { title: "Facilities", url: "/facilities", icon: Building2 },
  { title: "Referrals", url: "/referrals", icon: ClipboardList },
  { title: "Follow-ups", url: "/follow-ups", icon: CalendarClock },
  { title: "Users", url: "/users", icon: Users },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "App Management", url: "/dashboard/apks", icon: Smartphone },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      {/* Logo */}
      <SidebarHeader className="p-0 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="h-16 bg-sidebar flex items-center justify-start px-6 gap-3"
        >
          <Image
            src="/logo.jpeg"
            alt="SCREEN-IT Logo"
            width={110}
            height={40}
            className="h-9 w-auto object-contain"
          />
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="bg-sidebar py-3 flex-1">
        <SidebarMenu className="gap-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== "/dashboard" && pathname.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`relative h-10 w-full rounded-lg transition-all group/nav
                    ${isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Link href={item.url} className="flex items-center gap-3 px-3">
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground"}`}
                    />
                    <span className="text-sm font-medium">{item.title}</span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary/60" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Docs link */}
        <div className="px-3 mt-4 pt-4 border-t border-sidebar-border">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 w-full rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            >
              <Link href="/docs" className="flex items-center gap-3 px-3">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Documentation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors group">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {user?.email || ""}
            </p>
          </div>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter border-border shrink-0">
            {(user as any)?.role || "user"}
          </Badge>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
