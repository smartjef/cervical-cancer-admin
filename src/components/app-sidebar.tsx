"use client"

import * as React from "react"
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    FileText,
    LogOut,
    Activity,
    Building2,
    CalendarClock,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Screening",
            url: "/screening",
            icon: Activity,
        },
        {
            title: "Facilities",
            url: "/facilities",
            icon: Building2,
        },
        {
            title: "Referrals",
            url: "/referrals",
            icon: ClipboardList,
        },
        {
            title: "Follow-ups",
            url: "/follow-ups",
            icon: CalendarClock,
        },
        {
            title: "Users",
            url: "/users",
            icon: Users,
        },
        {
            title: "Reports",
            url: "/reports",
            icon: FileText,
        },
    ],
}

import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()

    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)

    const handleLogout = async () => {
        await signOut()
        router.push("/login")
    }

    return (
        <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground" {...props}>
            <SidebarHeader className="p-0 border-none overflow-hidden">
                <div className="h-20 bg-primary flex items-center justify-center w-full">
                    <span className="text-white font-black text-xl tracking-[0.2em] ml-[0.2em]">SCREEN-IT</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-sidebar">
                <SidebarMenu className="gap-1 py-4">
                    {data.navMain.map((item) => {
                        const isActive = pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className={`
                                        relative h-14 w-full transition-all rounded-none
                                        hover:bg-primary/10 hover:text-primary
                                        data-[active=true]:bg-transparent data-[active=true]:text-primary
                                        px-6 group/nav
                                    `}
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover/nav:text-primary'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground group-hover/nav:text-primary'}`}>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4 bg-sidebar border-t border-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors px-6 py-6 rounded-none cursor-pointer group/logout"
                            onClick={() => setShowLogoutDialog(true)}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="h-5 w-5 text-muted-foreground group-hover/logout:text-destructive" />
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover/logout:text-destructive">Logout</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="bg-card border-border shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Sign Out</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium">
                            Are you sure you want to log out of your account? You will need to sign in again to access the dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border-none font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                        >
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    )
}
