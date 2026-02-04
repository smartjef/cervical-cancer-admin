"use client"

import { useState, useEffect } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User, Mail, Key, Monitor, Trash2, Loader2,
    LogOut, AlertCircle, Calendar, Settings
} from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function ProfilePage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const user = session?.user

    // Form states
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [revokeOtherSessions, setRevokeOtherSessions] = useState(false)

    // Loading states
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)

    // Sessions
    const [sessions, setSessions] = useState<any[]>([])

    // Dialogs
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setEmail(user.email || "")
        }
    }, [user])

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        setIsLoadingSessions(true)
        try {
            const data = await apiRequest('/auth/list-sessions')
            setSessions(data || [])
        } catch (error) {
            console.error("Failed to fetch sessions", error)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Name is required.",
                variant: "destructive"
            })
            return
        }

        setIsUpdatingProfile(true)
        try {
            await apiRequest('/auth/update-user', {
                method: 'POST',
                body: JSON.stringify({ name })
            })
            toast({
                title: "Profile Updated",
                description: "Your profile information has been updated successfully.",
                variant: "success"
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile.",
                variant: "destructive"
            })
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: "Validation Error",
                description: "All password fields are required.",
                variant: "destructive"
            })
            return
        }

        if (newPassword.length < 8) {
            toast({
                title: "Validation Error",
                description: "New password must be at least 8 characters long.",
                variant: "destructive"
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Validation Error",
                description: "New passwords do not match.",
                variant: "destructive"
            })
            return
        }

        setIsChangingPassword(true)
        try {
            await apiRequest('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    revokeOtherSessions
                })
            })
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
                variant: "success"
            })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setRevokeOtherSessions(false)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password.",
                variant: "destructive"
            })
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleRevokeSession = async (token: string) => {
        try {
            await apiRequest('/auth/revoke-session', {
                method: 'POST',
                body: JSON.stringify({ token })
            })
            toast({
                title: "Session Revoked",
                description: "The session has been terminated.",
                variant: "success"
            })
            fetchSessions()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to revoke session.",
                variant: "destructive"
            })
        }
    }

    const handleRevokeAllSessions = async () => {
        try {
            await apiRequest('/auth/revoke-sessions', {
                method: 'POST',
                body: JSON.stringify({})
            })
            toast({
                title: "All Sessions Revoked",
                description: "All sessions have been terminated. You will be logged out.",
                variant: "success"
            })
            setTimeout(() => {
                signOut()
                router.push('/login')
            }, 1500)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to revoke sessions.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await apiRequest('/auth/delete-user', {
                method: 'POST',
                body: JSON.stringify({ password: currentPassword })
            })
            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
                variant: "success"
            })
            setTimeout(() => {
                signOut()
                router.push('/login')
            }, 1500)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete account.",
                variant: "destructive"
            })
        }
    }

    const handleLogout = async () => {
        await signOut()
        router.push("/login")
    }

    const currentSession = (session as any)?.session

    // Helper function to parse user agent
    const parseUserAgent = (userAgent: string) => {
        if (!userAgent) return "Unknown Device"

        // Extract browser
        let browser = "Unknown Browser"
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
            browser = "Chrome"
        } else if (userAgent.includes("Firefox")) {
            browser = "Firefox"
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            browser = "Safari"
        } else if (userAgent.includes("Edg")) {
            browser = "Edge"
        }

        // Extract OS
        let os = ""
        if (userAgent.includes("Windows")) {
            os = "Windows"
        } else if (userAgent.includes("Mac OS")) {
            os = "macOS"
        } else if (userAgent.includes("Linux")) {
            os = "Linux"
        } else if (userAgent.includes("Android")) {
            os = "Android"
        } else if (userAgent.includes("iOS")) {
            os = "iOS"
        }

        return os ? `${browser} on ${os}` : browser
    }

    return (
        <DashboardShell title="Account Settings" subtitle="Manage your profile and preferences">
            <div className="grid gap-6 lg:grid-cols-4">
                {/* Left Sidebar: User Info */}
                <Card className="border border-border/50 bg-card shadow-sm lg:col-span-1 h-fit">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-foreground">{user?.name || "User"}</CardTitle>
                        <CardDescription className="font-semibold text-primary capitalize">{(user as any)?.role || "Guest"}</CardDescription>
                        <Badge variant="outline" className="mt-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider w-fit">
                            Active
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-lg bg-muted/50">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-foreground font-medium truncate text-xs">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-lg bg-muted/50">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-foreground font-medium text-xs">Joined {dayjs(user?.createdAt).format('MMM D, YYYY')}</span>
                        </div>
                        <div className="pt-3 border-t border-border/50">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 font-bold rounded-xl border-border/60 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 h-9 text-xs"
                                onClick={() => setShowLogoutDialog(true)}
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Content: Tabs */}
                <div className="lg:col-span-3">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="profile" className="gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="security" className="gap-2">
                                <Key className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="sessions" className="gap-2">
                                <Monitor className="h-4 w-4" />
                                Sessions
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card className="border border-border/50 bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-foreground">Personal Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold text-foreground">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="email"
                                            value={email}
                                            disabled
                                            className="h-10 bg-muted/50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed at this time.</p>
                                    </div>
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={isUpdatingProfile}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6"
                                    >
                                        {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border border-destructive/50 bg-destructive/5">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription>Irreversible actions that affect your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="w-full justify-start gap-2 font-bold border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <Card className="border border-border/50 bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-foreground">Change Password</CardTitle>
                                    <CardDescription>Update your password and security settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" className="text-sm font-bold text-foreground">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-bold text-foreground">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min. 8 characters"
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Retype new password"
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="revokeOther"
                                            checked={revokeOtherSessions}
                                            onCheckedChange={(checked) => setRevokeOtherSessions(checked as boolean)}
                                        />
                                        <Label htmlFor="revokeOther" className="text-sm font-medium cursor-pointer">
                                            Revoke all other sessions after password change
                                        </Label>
                                    </div>
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword}
                                        className="bg-foreground hover:bg-foreground/90 text-background font-bold h-10 px-6"
                                    >
                                        {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Sessions Tab */}
                        <TabsContent value="sessions">
                            <Card className="border border-border/50 bg-card shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold text-foreground">Active Sessions</CardTitle>
                                            <CardDescription>Manage your active login sessions.</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRevokeAllSessions}
                                            className="text-xs font-bold"
                                        >
                                            Revoke All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingSessions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Monitor className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No active sessions</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessions.map((s) => {
                                                const isCurrent = s.token === currentSession?.token || s.id === currentSession?.id
                                                return (
                                                    <div
                                                        key={s.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-foreground truncate max-w-[200px]">
                                                                    {parseUserAgent(s.userAgent)}
                                                                </p>
                                                                {isCurrent && (
                                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold">
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {s.ipAddress} · {dayjs(s.createdAt).fromNow()}
                                                            </p>
                                                        </div>
                                                        {!isCurrent && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevokeSession(s.token)}
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-bold"
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out? You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardShell>
    )
}
