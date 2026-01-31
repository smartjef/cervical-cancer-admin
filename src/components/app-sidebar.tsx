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
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar className="border-r border-gray-100 bg-white" {...props}>
            <SidebarHeader className="h-16 bg-white flex items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-emerald-900 italic">Pearl</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-white">
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
                                        hover:bg-emerald-50/50 hover:text-emerald-700
                                        data-[active=true]:bg-transparent data-[active=true]:text-emerald-700
                                        px-6
                                    `}
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                                        )}
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4 bg-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors px-6 py-6 rounded-none"
                        >
                            <Link href="/login" className="flex items-center gap-3">
                                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-destructive" />
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-destructive">Logout</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
