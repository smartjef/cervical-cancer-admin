"use client"

import React, { useEffect, useState } from "react"
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
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"

import { signOut, useSession } from "@/lib/auth-client"

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    const router = useRouter()
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)

    const handleLogout = async () => {
        await signOut()
        router.push("/login")
    }

    const user = session?.user
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-background dark:bg-card shadow-none border-b border-border transition-colors">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden w-64 md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-muted/50 pl-9 focus-visible:ring-primary border-none text-foreground"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 pr-6">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 hover:bg-muted text-muted-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
                    </button>
                    <div className="relative">
                        <button className="p-2 hover:bg-muted text-muted-foreground transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center">
                            3
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground">{user?.name || "Loading..."}</p>
                        <p className="text-xs text-muted-foreground capitalize">{(user as any)?.role || "Guest"}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="outline-none">
                                <Avatar className="h-9 w-9 border-none">
                                    <AvatarImage src={user?.image || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border border-border bg-card shadow-lg">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer font-bold focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20"
                                onSelect={(e) => {
                                    e.preventDefault()
                                    setShowLogoutDialog(true)
                                }}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

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
        </header>
    )
}
