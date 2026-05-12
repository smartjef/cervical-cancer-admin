"use client"

import { useApi } from "@/hooks/use-api"
import DashboardShell from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    Activity, 
    ArrowLeft, 
    Calendar, 
    Loader2, 
    Phone, 
    User, 
    Users, 
    Trash2, 
    PlayCircle, 
    PauseCircle, 
    Key, 
    Edit, 
    Save, 
    XCircle, 
    UserPlus, 
    ShieldAlert, 
    Monitor, 
    LogOut, 
    Mail, 
    Clock, 
    ClipboardList, 
    CheckCircle2, 
    AlertCircle, 
    FileText 
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import dynamic from "next/dynamic"

const ScreeningActivityMap = dynamic(() => import("@/components/screening-activity-map"), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full rounded-2xl bg-muted/30 animate-pulse" />
})
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

dayjs.extend(relativeTime)

// Helper to parse user agent
const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return "Unknown Device"
    
    // Extract browser
    let browser = "Unknown Browser"
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) { browser = "Chrome" }
    else if (userAgent.includes("Firefox")) { browser = "Firefox" }
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) { browser = "Safari" }
    else if (userAgent.includes("Edg")) { browser = "Edge" }

    // Extract OS
    let os = ""
    if (userAgent.includes("Windows")) { os = "Windows" }
    else if (userAgent.includes("Mac OS")) { os = "macOS" }
    else if (userAgent.includes("Linux")) { os = "Linux" }
    else if (userAgent.includes("Android")) { os = "Android" }
    else if (userAgent.includes("iOS")) { os = "iOS" }

    return os ? `${browser} on ${os}` : browser
}

export default function SystemUserDetailClient({ id }: { id: string }) {
    const router = useRouter()
    const { data: session } = useSession()
    const isSelf = session?.user?.id === id

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [isRevokeSessionsDialogOpen, setIsRevokeSessionsDialogOpen] = useState(false)

    // Form states
    const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '' })
    const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
    const [pendingRole, setPendingRole] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const isInvalidId = !id || id === "undefined"
    const { data: userData, isLoading: userLoading, refetch: refetchUser } = useApi<any>(isInvalidId ? null : `/auth/admin/get-user?id=${id}`)
    
    // Auth user response usually has 'user' property or is the user itself depending on better-auth response
    const user = userData?.user || userData

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState<string>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [activeTab, setActiveTab] = useState("activities")

    // Explicitly fetch CHP info if not pre-loaded (e.g. better-auth admin response)
    const userEmail = user?.email
    const { data: chpFetchData } = useApi<any>(isInvalidId || !userEmail || user?.communityHealthProvider ? null : `/chps?email=${userEmail}`)
    const chpInfo = user?.communityHealthProvider || chpFetchData?.results?.[0]
    const chpId = chpInfo?.id

    const [actionFilter, setActionFilter] = useState<string>("all")
    const [resourceFilter, setResourceFilter] = useState<string>("all")
    const [referralStatusFilter, setReferralStatusFilter] = useState<string>("all")
    const [clientRiskFilter, setClientRiskFilter] = useState<string>("all")
    const [followUpCategoryFilter, setFollowUpCategoryFilter] = useState<string>("all")
    const [followUpPriorityFilter, setFollowUpPriorityFilter] = useState<string>("all")
    const [dateFrom, setDateFrom] = useState<string>("")
    const [dateTo, setDateTo] = useState<string>("")

    const queryParams = `page=${page}&limit=${limit}${search ? `&search=${search}` : ""}${sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ""}`
    const activitiesParams = `${queryParams}${actionFilter !== 'all' ? `&action=${actionFilter}` : ""}${resourceFilter !== 'all' ? `&resource=${resourceFilter}` : ""}${dateFrom ? `&dateFrom=${dateFrom}` : ""}${dateTo ? `&dateTo=${dateTo}` : ""}`

    const { data: screenings, isLoading: screeningsLoading } = useApi<any>(isInvalidId || !chpId ? null : `/screenings?providerId=${chpId}&includeForAllProviders=true`)
    const { data: activityData, isLoading: activitiesLoading } = useApi<any>(isInvalidId || activeTab !== 'activities' ? null : `/activities?userId=${id}&${activitiesParams}`)
    const { data: referralData, isLoading: referralsLoading } = useApi<any>(isInvalidId || !chpId || activeTab !== 'referrals' ? null : `/referrals?providerId=${chpId}&${queryParams}${referralStatusFilter !== 'all' ? `&status=${referralStatusFilter}` : ""}`)
    const { data: clientData, isLoading: clientsLoading } = useApi<any>(isInvalidId || !chpId || activeTab !== 'clients' ? null : `/clients?createdById=${chpId}&${queryParams}${clientRiskFilter !== 'all' ? `&risk=${clientRiskFilter}` : ""}`)
    const { data: followUpData, isLoading: followUpsLoading } = useApi<any>(isInvalidId || !chpId || activeTab !== 'followups' ? null : `/follow-up?providerId=${chpId}&${queryParams}${followUpCategoryFilter !== 'all' ? `&category=${followUpCategoryFilter}` : ""}${followUpPriorityFilter !== 'all' ? `&priority=${followUpPriorityFilter}` : ""}`)

    // Sessions data - using POST endpoint
    const [sessionsData, setSessionsData] = useState<any>(null)
    const [sessionsLoading, setSessionsLoading] = useState(false)

    // Reset pagination when tab changes
    const onTabChange = (value: string) => {
        setActiveTab(value)
        setPage(1)
        setSearch("")
        setSortBy("createdAt")
        setSortOrder("desc")
        setActionFilter("all")
        setResourceFilter("all")
        setReferralStatusFilter("all")
        setClientRiskFilter("all")
        setFollowUpCategoryFilter("all")
        setFollowUpPriorityFilter("all")
        setDateFrom("")
        setDateTo("")
    }

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || ''
            })
        }
    }, [user])

    // Fetch sessions when sessions tab is active
    useEffect(() => {
        if (activeTab === 'sessions' && !isInvalidId && id) {
            setSessionsLoading(true)
            apiRequest('/auth/admin/list-user-sessions', {
                method: 'POST',
                body: JSON.stringify({ userId: id })
            })
            .then((data) => setSessionsData(data?.sessions || []))
            .catch((error) => {
                console.error('Failed to fetch sessions:', error)
                setSessionsData([])
            })
            .finally(() => setSessionsLoading(false))
        }
    }, [activeTab, id, isInvalidId])

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await apiRequest(`/auth/admin/remove-user`, {
                method: 'POST',
                body: JSON.stringify({ userId: id })
            })
            setIsDeleteDialogOpen(false)
            router.push('/users')
        } catch (error) {
            console.error("Failed to delete user", error)
            toast({
                title: "Error",
                description: "Failed to delete user. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async () => {
        const isBanned = !!user?.banned
        setIsSubmitting(true)
        try {
            const endpoint = isBanned ? `/auth/admin/unban-user` : `/auth/admin/ban-user`
            await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify({ userId: id })
            })
            setIsStatusDialogOpen(false)
            refetchUser()
        } catch (error) {
            console.error("Failed to update status", error)
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await apiRequest(`/auth/admin/update-user`, {
                method: 'POST',
                body: JSON.stringify({ userId: id, data: editForm })
            })
            setIsEditDialogOpen(false)
            refetchUser()
        } catch (error) {
            console.error("Failed to update user", error)
            toast({
                title: "Update Failed",
                description: "Could not save user changes.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.password !== passwordForm.confirmPassword) {
            toast({
                title: "Validation Error",
                description: "Passwords do not match.",
                variant: "warning"
            })
            return
        }
        if (passwordForm.password.length < 8) {
            toast({
                title: "Validation Error",
                description: "Password must be at least 8 characters long.",
                variant: "warning"
            })
            return
        }

        setIsSubmitting(true)
        try {
            await apiRequest(`/auth/admin/set-user-password`, {
                method: 'POST',
                body: JSON.stringify({ userId: id, newPassword: passwordForm.password })
            })
            setIsPasswordDialogOpen(false)
            setPasswordForm({ password: '', confirmPassword: '' })
            toast({
                title: "Success",
                description: "Password updated successfully.",
                variant: "success"
            })
        } catch (error) {
            console.error("Failed to update password", error)
            toast({
                title: "Error",
                description: "Failed to update password.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSetRole = async () => {
        if (!pendingRole) return
        setIsSubmitting(true)
        try {
            await apiRequest(`/auth/admin/set-role`, {
                method: 'POST',
                body: JSON.stringify({ userId: id, role: pendingRole })
            })
            setIsRoleDialogOpen(false)
            refetchUser()
            toast({
                title: "Role Updated",
                description: `User role has been set to ${pendingRole.toUpperCase()}.`,
                variant: "success"
            })
        } catch (error) {
            console.error("Failed to update role", error)
            toast({
                title: "Error",
                description: "Failed to update user role.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRevokeSessions = async () => {
        setIsSubmitting(true)
        try {
            await apiRequest(`/auth/admin/revoke-user-sessions`, {
                method: 'POST',
                body: JSON.stringify({ userId: id })
            })
            setIsRevokeSessionsDialogOpen(false)
            toast({
                title: "Sessions Revoked",
                description: "All active sessions have been terminated.",
                variant: "success"
            })
        } catch (error) {
            console.error("Failed to revoke sessions", error)
            toast({
                title: "Error",
                description: "Failed to revoke user sessions.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (userLoading) {
        return (
            <DashboardShell title="User Detail">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardShell>
        )
    }

    if (!user) {
        return (
            <DashboardShell title="User Detail">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                    <p>User not found</p>
                </div>
            </DashboardShell>
        )
    }

    const isChp = user.role === 'chp' || user.role === 'hcw'

    return (
        <DashboardShell 
            title={`${isChp ? 'CHP' : 'Admin'} Detail`} 
            subtitle={user.name || user.email}
        >
            <div className="mb-6">
                <Link href="/users">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to User Management
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border border-border/50 bg-card overflow-hidden flex flex-col items-center p-4 text-center">
                        <div className="relative mb-3">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border-4 border-white dark:border-card ">
                                <Activity className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white dark:border-card flex items-center justify-center">
                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg font-bold text-foreground">{user.name || "System User"}</h2>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                        </div>
                        <Badge 
                            variant="outline" 
                            className="bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider mb-4"
                        >
                            {user.role === 'admin' ? 'System Administrator' : user.role === 'hcw' ? 'Health Care Worker' : 'Community Health Provider'}
                        </Badge>

                        {/* Quick Stats Grid */}
                        <div className="w-full grid grid-cols-3 gap-2 mb-4 bg-muted/30 p-1.5 rounded-xl border border-border/50">
                            <div className="flex flex-col items-center py-1.5 px-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-0.5">Clients</span>
                                <span className="text-base font-black text-foreground">{chpInfo?.clients?.length || 0}</span>
                            </div>
                            <div className="flex flex-col items-center py-1.5 px-1 border-x border-border/50">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-0.5">Screenings</span>
                                <span className="text-base font-black text-foreground">{screenings?.totalCount || screenings?.results?.length || 0}</span>
                            </div>
                            <div className="flex flex-col items-center py-1.5 px-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-0.5">Referrals</span>
                                <span className="text-base font-black text-foreground">{referralData?.totalCount || 0}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="w-full space-y-2 text-left">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-default">
                                <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <Phone className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium text-xs">{user.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-default">
                                <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <Mail className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium truncate text-xs">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-default">
                                <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <Calendar className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium text-xs">Joined {dayjs(user.createdAt).format('MMM D, YYYY')}</span>
                            </div>
                            <div className="pt-2 flex flex-col gap-1.5">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-2 font-bold rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 h-9 text-xs"
                                    onClick={() => setIsPasswordDialogOpen(true)}
                                >
                                    <Key className="h-3.5 w-3.5" /> Change Password
                                </Button>
                                {!isSelf && (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsStatusDialogOpen(true)}
                                            className="w-full justify-start gap-2 font-bold rounded-xl border-border/60 hover:bg-amber-50 text-amber-700 hover:border-amber-200 h-9 text-xs"
                                        >
                                            <PauseCircle className="h-3.5 w-3.5" />
                                            {user?.banned ? 'Activate Account' : 'Deactivate Account'}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start gap-2 font-bold rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 h-9 text-xs"
                                            onClick={() => {
                                                setIsRoleDialogOpen(true);
                                            }}
                                        >
                                            <ShieldAlert className="h-3.5 w-3.5" /> Update Role
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            className="w-full justify-start gap-2 font-bold rounded-xl border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete Account
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {isChp && screenings?.results && screenings.results.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ScreeningActivityMap 
                                screenings={screenings.results} 
                                providerName={user.name} 
                            />
                        </div>
                    )}

                    <Card className="border-none -none bg-transparent">
                        <Tabs defaultValue="activities" value={activeTab} onValueChange={onTabChange} className="w-full">
                            <TabsList variant="line" className="bg-transparent border-b border-border/50 w-full justify-start h-auto p-0 gap-8">
                                <TabsTrigger value="activities" className="data-[state=active]:bg-transparent border-none rounded-none px-0 py-3 h-auto gap-2 group">
                                    <Clock className="h-4 w-4 text-emerald-500" />
                                    <span className="font-bold">Activities</span>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">{activityData?.totalCount || 0}</Badge>
                                </TabsTrigger>
                                {chpInfo && (
                                    <>
                                        <TabsTrigger value="referrals" className="data-[state=active]:bg-transparent border-none rounded-none px-0 py-3 h-auto gap-2">
                                            <ClipboardList className="h-4 w-4 text-primary" />
                                            <span className="font-bold">Referrals</span>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">{referralData?.totalCount || 0}</Badge>
                                        </TabsTrigger>
                                        <TabsTrigger value="clients" className="data-[state=active]:bg-transparent border-none rounded-none px-0 py-3 h-auto gap-2">
                                            <Users className="h-4 w-4 text-secondary" />
                                            <span className="font-bold">Clients</span>
                                            <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">{clientData?.totalCount || 0}</Badge>
                                        </TabsTrigger>
                                        <TabsTrigger value="followups" className="data-[state=active]:bg-transparent border-none rounded-none px-0 py-3 h-auto gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-amber-500" />
                                            <span className="font-bold">Follow-ups</span>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">{followUpData?.totalCount || 0}</Badge>
                                        </TabsTrigger>
                                    </>
                                )}
                                <TabsTrigger value="sessions" className="data-[state=active]:bg-transparent border-none rounded-none px-0 py-3 h-auto gap-2">
                                    <Monitor className="h-4 w-4 text-rose-500" />
                                    <span className="font-bold">Sessions</span>
                                    <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">{sessionsData?.length || 0}</Badge>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="activities" className="mt-4">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Action",
                                            accessorKey: "action",
                                            cell: (item: any) => (
                                                <Badge variant="outline" className={`font-bold border-none px-2 rounded-full text-[10px] uppercase tracking-wider ${item.action === 'create' ? 'bg-emerald-500/10 text-emerald-600' : item.action === 'update' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {item.action}
                                                </Badge>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Resource",
                                            accessorKey: "resource",
                                            cell: (item: any) => (
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className={`w-fit font-black border-none px-2 rounded-md text-[9px] uppercase tracking-widest ${item.resource === 'screening' ? 'bg-primary/10 text-primary' : item.resource === 'client' ? 'bg-orange-500/10 text-orange-600' : 'bg-slate-500/10 text-slate-600'}`}>
                                                        {item.resource}
                                                    </Badge>
                                                    <span className="text-[9px] font-mono text-muted-foreground/40 font-bold tabular-nums">
                                                        ID: {item.resourceId?.slice(-8) || "N/A"}
                                                    </span>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Activity",
                                            accessorKey: "description",
                                            cell: (item: any) => {
                                                const metadata = item.metadata || {}
                                                return (
                                                    <div className="flex flex-col gap-1 max-w-[350px]">
                                                        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {metadata.riskScore !== undefined && (
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-md">
                                                                    <span className="text-[9px] font-black text-red-600 uppercase">Score: {metadata.riskScore}</span>
                                                                    <span className="text-[9px] font-black text-red-600/60 uppercase">{metadata.riskInterpretation?.replace('_', ' ')}</span>
                                                                </div>
                                                            )}
                                                            {metadata.clientId && (
                                                                <Link 
                                                                    href={`/users/clients/${metadata.clientId}`}
                                                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/20"
                                                                >
                                                                    <User className="h-2.5 w-2.5" />
                                                                    {metadata.clientName || "Client"}
                                                                </Link>
                                                            )}
                                                            {item.resourceId && item.resource === 'screening' && (
                                                                <Link 
                                                                    href={`/screening/${item.resourceId}`}
                                                                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20"
                                                                >
                                                                    <FileText className="h-2.5 w-2.5" />
                                                                    View Screening
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            className: "min-w-[280px]"
                                        },
                                        {
                                            header: "Date",
                                            accessorKey: "createdAt",
                                            cell: (item: any) => (
                                                <div className="flex flex-col tabular-nums">
                                                    <span className="text-muted-foreground font-bold text-xs">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                                    <span className="text-[9px] text-muted-foreground/50 font-medium">{dayjs(item.createdAt).format('HH:mm:ss')}</span>
                                                </div>
                                            ),
                                            sortable: true
                                        }
                                    ]}
                                    data={activityData?.results || []}
                                    isLoading={activitiesLoading}
                                    totalCount={activityData?.totalCount || 0}
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    search={search}
                                    setSearch={setSearch}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    searchPlaceholder="Search activities..."
                                    filters={
                                        <>
                                            <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setPage(1); }}>
                                                <SelectTrigger className="h-10 w-[130px] font-bold border-2">
                                                    <SelectValue placeholder="Action" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Actions</SelectItem>
                                                    <SelectItem value="create">Create</SelectItem>
                                                    <SelectItem value="update">Update</SelectItem>
                                                    <SelectItem value="delete">Delete</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={resourceFilter} onValueChange={(val) => { setResourceFilter(val); setPage(1); }}>
                                                <SelectTrigger className="h-10 w-[140px] font-bold border-2">
                                                    <SelectValue placeholder="Resource" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Resources</SelectItem>
                                                    <SelectItem value="screening">Screening</SelectItem>
                                                    <SelectItem value="client">Client</SelectItem>
                                                    <SelectItem value="user">User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center gap-2 border-2 rounded-md px-2 h-10 bg-background">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <input 
                                                    type="date" 
                                                    value={dateFrom} 
                                                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                                    className="bg-transparent border-none text-[10px] font-bold focus:outline-none uppercase w-[100px]"
                                                />
                                                <span className="text-muted-foreground font-black text-[10px]">\u2014</span>
                                                <input 
                                                    type="date" 
                                                    value={dateTo} 
                                                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                                    className="bg-transparent border-none text-[10px] font-bold focus:outline-none uppercase w-[100px]"
                                                />
                                                {(dateFrom || dateTo) && (
                                                    <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }} className="ml-1 p-0.5 hover:bg-muted rounded-full">
                                                        <XCircle className="h-3 w-3 text-muted-foreground" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    }
                                />
                            </TabsContent>

                            {chpInfo && <TabsContent value="referrals">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Client",
                                            accessorKey: "screening.client.firstName",
                                            cell: (item: any) => (
                                                <Link 
                                                    href={`/users/clients/${item.screening?.clientId}`}
                                                    className="flex flex-col hover:underline group max-w-[180px]"
                                                >
                                                    <span className="font-bold text-foreground truncate group-hover:text-primary">
                                                        {item.screening?.client?.firstName} {item.screening?.client?.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                        CID: {item.screening?.clientId?.split('-')[0]}
                                                    </span>
                                                </Link>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Screening",
                                            accessorKey: "screening.id",
                                            cell: (item: any) => {
                                                const scoring = item.screening?.scoringResult as any;
                                                const interpretation = scoring?.interpretation || "UNKNOWN";
                                                const colorMap: any = {
                                                    HIGH_RISK: "text-rose-600 bg-rose-50 border-rose-100",
                                                    MEDIUM_RISK: "text-amber-600 bg-amber-50 border-amber-100",
                                                    LOW_RISK: "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                };
                                                return (
                                                    <Link 
                                                        href={`/screening/${item.screening?.id}`}
                                                        className="flex flex-col gap-1 hover:opacity-80 group"
                                                    >
                                                        <Badge variant="outline" className={`w-fit font-bold rounded-full text-[10px] px-2 py-0 h-5 group-hover:ring-2 ring-primary/20 ${colorMap[interpretation] || "bg-muted text-muted-foreground"}`}>
                                                            {interpretation.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            Score: {scoring?.aggregateScore || 0}
                                                        </span>
                                                    </Link>
                                                );
                                            },
                                            sortable: true
                                        },
                                        {
                                            header: "Facility",
                                            accessorKey: "healthFacility.name",
                                            cell: (item: any) => (
                                                <div className="flex flex-col max-w-[200px]">
                                                    <span className="font-semibold text-foreground/80 truncate">{item.healthFacility?.name}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">{item.healthFacility?.county} \u00b7 {item.healthFacility?.subcounty}</span>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Status",
                                            accessorKey: "status",
                                            cell: (item: any) => {
                                                const statusMap: any = {
                                                    PENDING: "bg-amber-100 text-amber-700",
                                                    COMPLETED: "bg-emerald-100 text-emerald-700",
                                                    REFUSED: "bg-rose-100 text-rose-700",
                                                    VISITED_PENDING_RESULTS: "bg-sky-100 text-sky-700"
                                                };
                                                return <Badge variant="outline" className={`font-black border-none px-2.5 rounded-full text-[10px] uppercase tracking-wider ${statusMap[item.status] || "bg-muted text-muted-foreground"}`}>{item.status.replace(/_/g, ' ')}</Badge>
                                            }
                                        },
                                        {
                                            header: "Date",
                                            accessorKey: "appointmentTime",
                                            className: "text-right pr-6",
                                            cell: (item: any) => (
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-foreground/80">{dayjs(item.appointmentTime).format('MMM D, YYYY')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{dayjs(item.appointmentTime).format('h:mm A')}</span>
                                                </div>
                                            ),
                                            sortable: true
                                        }
                                    ]}
                                    data={referralData?.results || []}
                                    isLoading={referralsLoading}
                                    totalCount={referralData?.totalCount || 0}
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    search={search}
                                    setSearch={setSearch}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    searchPlaceholder="Search referrals..."
                                    filters={
                                        <Select value={referralStatusFilter} onValueChange={(val) => { setReferralStatusFilter(val); setPage(1); }}>
                                            <SelectTrigger className="h-10 w-[160px] font-bold border-2">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="VISITED_PENDING_RESULTS">Visited (Pending Results)</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="REFUSED">Refused</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    }
                                />
                            </TabsContent>}

                            {chpInfo && <TabsContent value="clients">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Client",
                                            accessorKey: "firstName",
                                            cell: (item: any) => (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">
                                                        {item.firstName} {item.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                        CID: {item.id?.split('-')[0]}
                                                    </span>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Age/Gender",
                                            accessorKey: "dateOfBirth",
                                            cell: (item: any) => (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground/80">
                                                        {dayjs().diff(dayjs(item.dateOfBirth), 'year')} yrs
                                                    </span>
                                                    <Badge variant="outline" className="w-fit font-medium border-none px-0 h-4 text-[10px] uppercase text-muted-foreground">
                                                        {item.maritalStatus}
                                                    </Badge>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Location",
                                            accessorKey: "county",
                                            cell: (item: any) => (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-foreground/80">{item.county}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.subcounty} \u00b7 {item.ward}</span>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Risk Profile",
                                            accessorKey: "metadata",
                                            cell: (item: any) => {
                                                const interpretation = item.metadata?.riskInterpretation || "NOT_SCREENED";
                                                const colorMap: any = {
                                                    HIGH_RISK: "text-rose-600 bg-rose-50 border-rose-100",
                                                    MEDIUM_RISK: "text-amber-600 bg-amber-50 border-amber-100",
                                                    LOW_RISK: "text-emerald-600 bg-emerald-50 border-emerald-100",
                                                    NOT_SCREENED: "text-muted-foreground bg-muted/30 border-muted/50"
                                                };
                                                return (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className={`w-fit font-bold rounded-full text-[10px] px-2 py-0 h-5 border ${colorMap[interpretation]}`}>
                                                            {interpretation.replace('_', ' ')}
                                                        </Badge>
                                                        {item.metadata?.riskScore !== undefined && (
                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                Last Score: {item.metadata.riskScore}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            },
                                            sortable: true
                                        },
                                        {
                                            header: "Joined",
                                            accessorKey: "createdAt",
                                            className: "text-right pr-6",
                                            cell: (item: any) => (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-foreground/80">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{dayjs(item.createdAt).fromNow()}</span>
                                                </div>
                                            ),
                                            sortable: true
                                        }
                                    ]}
                                    data={clientData?.results || []}
                                    isLoading={clientsLoading}
                                    totalCount={clientData?.totalCount || 0}
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    search={search}
                                    setSearch={setSearch}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    searchPlaceholder="Search clients..."
                                    filters={
                                        <Select value={clientRiskFilter} onValueChange={(val) => { setClientRiskFilter(val); setPage(1); }}>
                                            <SelectTrigger className="h-10 w-[160px] font-bold border-2">
                                                <SelectValue placeholder="Risk Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Risk Levels</SelectItem>
                                                <SelectItem value="LOW_RISK">Low Risk</SelectItem>
                                                <SelectItem value="MEDIUM_RISK">Medium Risk</SelectItem>
                                                <SelectItem value="HIGH_RISK">High Risk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    }
                                />
                            </TabsContent>}

                            {chpInfo && <TabsContent value="followups">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Client",
                                            accessorKey: "client.firstName",
                                            cell: (item: any) => (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                                                        {item.client?.firstName?.[0]}{item.client?.lastName?.[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">
                                                            {item.client?.firstName} {item.client?.lastName}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                                            {item.category?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                            sortable: true
                                        },
                                        {
                                            header: "Priority",
                                            accessorKey: "priority",
                                            cell: (item: any) => {
                                                const priorityColor: any = {
                                                    HIGH: "text-rose-600 bg-rose-50 border-rose-100",
                                                    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
                                                    LOW: "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                };
                                                return (
                                                    <Badge variant="outline" className={`font-black border px-2 py-0 h-5 rounded-full text-[10px] uppercase tracking-wider ${priorityColor[item.priority]}`}>
                                                        {item.priority}
                                                    </Badge>
                                                );
                                            },
                                            sortable: true
                                        },
                                        {
                                            header: "Deadline",
                                            accessorKey: "dueDate",
                                            cell: (item: any) => {
                                                const isOverdue = dayjs().isAfter(dayjs(item.dueDate)) && !item.completedAt;
                                                return (
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-foreground/80'}`}>
                                                            {dayjs(item.dueDate).format('MMM D, YYYY')}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {isOverdue ? 'Overdue' : `Due ${dayjs(item.dueDate).fromNow()}`}
                                                        </span>
                                                    </div>
                                                );
                                            },
                                            sortable: true
                                        },
                                        {
                                            header: "Status",
                                            accessorKey: "completedAt",
                                            className: "text-right pr-6",
                                            cell: (item: any) => (
                                                <div className="flex justify-end">
                                                    {item.completedAt ? (
                                                        <div className="flex flex-col items-end">
                                                            <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 font-black text-[10px] rounded-full px-2 py-0 h-5 uppercase">Completed</Badge>
                                                            <span className="text-[10px] text-muted-foreground mt-0.5">{dayjs(item.completedAt).format('MMM D')}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 font-black text-[10px] rounded-full px-2 py-0 h-5 uppercase">Pending</Badge>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    data={followUpData?.results || []}
                                    isLoading={followUpsLoading}
                                    totalCount={followUpData?.totalCount || 0}
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    search={search}
                                    setSearch={setSearch}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    searchPlaceholder="Search follow-ups..."
                                    filters={
                                        <>
                                            <Select value={followUpCategoryFilter} onValueChange={(val) => { setFollowUpCategoryFilter(val); setPage(1); }}>
                                                <SelectTrigger className="h-10 w-[160px] font-bold border-2">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    <SelectItem value="REFERRAL_ADHERENCE">Referral Adherence</SelectItem>
                                                    <SelectItem value="RE_SCREENING_RECALL">Re-screening Recall</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={followUpPriorityFilter} onValueChange={(val) => { setFollowUpPriorityFilter(val); setPage(1); }}>
                                                <SelectTrigger className="h-10 w-[130px] font-bold border-2">
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Priorities</SelectItem>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </>
                                    }
                                />
                            </TabsContent>}

                            <TabsContent value="sessions">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Device / Agent",
                                            accessorKey: "userAgent",
                                            cell: (item: any) => (
                                                <div className="flex flex-col max-w-[240px]" title={item.userAgent}>
                                                    <span className="font-bold text-foreground truncate">{parseUserAgent(item.userAgent)}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">{item.ipAddress || "No IP"} \u00b7 {dayjs(item.createdAt).fromNow()}</span>
                                                </div>
                                            ),
                                            sortable: true,
                                            className: "pl-6"
                                        },
                                        {
                                            header: "IP Address",
                                            accessorKey: "ipAddress",
                                            cell: (item: any) => <div className="text-muted-foreground font-mono text-[10px]">{item.ipAddress || "N/A"}</div>,
                                            sortable: true
                                        },
                                        {
                                            header: "Last Active",
                                            accessorKey: "updatedAt",
                                            cell: (item: any) => <div className="text-muted-foreground font-medium">{dayjs(item.updatedAt).format('MMM D, HH:mm')}</div>,
                                            sortable: true
                                        },
                                        {
                                            header: "Status",
                                            accessorKey: "expiresAt",
                                            className: "text-right pr-6",
                                            cell: (item: any) => (
                                                <Badge variant="outline" className={`font-bold border-none px-2 rounded-full text-[10px] uppercase tracking-wider ${dayjs(item.expiresAt).isAfter(dayjs()) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                                    {dayjs(item.expiresAt).isAfter(dayjs()) ? 'Active' : 'Expired'}
                                                </Badge>
                                            )
                                        }
                                    ]}
                                    data={sessionsData || []}
                                    isLoading={sessionsLoading}
                                    totalCount={sessionsData?.length || 0}
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                />
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete <strong>{user.name || user.email}</strong> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleDelete(); }} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{user?.banned ? 'Activate User Account?' : 'Deactivate User Account?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {user?.banned 
                                ? `Are you sure you want to activate ${user.name || user.email}'s account? They will be able to log in again.` 
                                : `Are you sure you want to deactivate ${user.name || user.email}'s account? They will be immediately logged out and blocked from logging in.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleToggleStatus(); }} 
                            className={user?.banned ? "bg-primary text-primary-foreground" : "bg-amber-600 text-white hover:bg-amber-700"}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (user?.banned ? <PlayCircle className="h-4 w-4 mr-2" /> : <PauseCircle className="h-4 w-4 mr-2" />)}
                            {user?.banned ? 'Activate' : 'Deactivate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="bg-background border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for <strong>{user.name || user.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">New Password</label>
                            <Input 
                                type="password" 
                                placeholder="Enter new password" 
                                required 
                                value={passwordForm.password} 
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                                className="bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Confirm Password</label>
                            <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                required 
                                value={passwordForm.confirmPassword} 
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-background border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                        <DialogDescription>
                            Update profile information for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Full Name</label>
                            <Input 
                                type="text" 
                                placeholder="Full Name" 
                                required 
                                value={editForm.name} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Email Address</label>
                            <Input 
                                type="email" 
                                placeholder="email@example.com" 
                                required 
                                value={editForm.email} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Phone Number</label>
                            <Input 
                                type="tel" 
                                placeholder="+254..." 
                                value={editForm.phoneNumber} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="bg-background border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update User Role</DialogTitle>
                        <DialogDescription>
                            Select a new role for <strong>{user.name || user.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Select Role</label>
                            <Select value={pendingRole || user.role} onValueChange={setPendingRole}>
                                <SelectTrigger className="h-12 font-medium">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">System Administrator</SelectItem>
                                    <SelectItem value="hcw">Health Care Worker (Facility)</SelectItem>
                                    <SelectItem value="chp">Community Health Provider (Field)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRoleDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button 
                            onClick={handleSetRole} 
                            className="bg-primary text-primary-foreground"
                            disabled={isSubmitting || !pendingRole || pendingRole === user.role}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isRevokeSessionsDialogOpen} onOpenChange={setIsRevokeSessionsDialogOpen}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke All Active Sessions?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will immediately log <strong>{user.name || user.email}</strong> out from all devices and browsers. They will need to log in again to access the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleRevokeSessions(); }} 
                            className="bg-amber-600 text-white hover:bg-amber-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                            Revoke Sessions
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardShell>
    )
}
