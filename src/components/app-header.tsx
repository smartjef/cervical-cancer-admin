"use client"

import { Search, Bell, Settings, Globe, ChevronRight, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white shadow-none border-b border-gray-100">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-500 hover:text-emerald-700 transition-colors" />
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden w-64 md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-gray-50 pl-9 focus-visible:ring-emerald-500 border-none"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 pr-6">
                    <button className="p-2 hover:bg-gray-100 text-gray-500 transition-colors">
                        <Moon className="h-5 w-5" />
                    </button>
                    <div className="relative">
                        <button className="p-2 hover:bg-gray-100 text-gray-500 transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center">
                            3
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-700">Dr. Peter Kamau</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="outline-none">
                                <Avatar className="h-9 w-9 border-none">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback className="bg-emerald-100">PK</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-none shadow-none">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
