"use client"

import * as React from "react"
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    FileText,
    LogOut,
    Activity,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
            title: "Screening Data",
            url: "/screening-data",
            icon: Activity,
        },
        {
            title: "User Management",
            url: "/user-management",
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

import Image from "next/image"
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

    const user = session?.user
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'

    return (
        <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground" {...props}>
            <SidebarHeader className="h-16 bg-sidebar flex items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden shadow-sm">
                        <Image
                            src="/logo.jpeg"
                            alt="Pearl Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
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
                                        px-6
                                    `}
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
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
                    <SidebarMenuItem className="mb-4">
                        <div className="flex items-center gap-3 px-6 py-2">
                            <Avatar className="h-9 w-9 border-none">
                                <AvatarImage src={user?.image || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-foreground truncate">{user?.name || "Loading..."}</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{(user as any)?.role || "User"}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors px-6 py-6 rounded-none cursor-pointer group"
                            onClick={() => setShowLogoutDialog(true)}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-destructive">Logout</span>
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
