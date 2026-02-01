"use client"

import { useState, useMemo } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/combobox"
import {
    Users,
    UserPlus,
    Search,
    UserCheck,
    ShieldCheck,
    MonitorDot,
    MapPin,
    Phone,
    Calendar,
    Edit3,
    PauseCircle,
    PlayCircle,
    Trash2,
    AlertCircle,
    X,
    Plus,
    Check
} from "lucide-react"
import { apiRequest } from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function UserManagementPage() {
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [search, setSearch] = useState("")

    // 1. Fetch System Users (Admins, CHPs) from Better-Auth Admin API
    const { data: authData, isLoading: authLoading, refetch: refetchAuth } = useApi<any>("/auth/admin/list-users?limit=100")

    // 2. Fetch Clients from regular Clients API
    const { data: clientData, isLoading: clientLoading, refetch: refetchClients } = useApi<any>(`/clients?limit=1000${search ? `&search=${search}` : ""}`)

    const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useApi<any>("/activities")

    // --- Create User States ---
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [creationLoading, setCreationLoading] = useState(false)
    const [newUser, setNewUser] = useState<any>({
        role: "admin",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        username: "",
        phoneNumber: "",
        county: "Nairobi",
        subcounty: "Kibra",
        nationalId: "",
        maritalStatus: "SINGLE",
        dateOfBirth: "1990-01-01" // Added for client form reset
    })
    const [error, setError] = useState<string | null>(null)

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreationLoading(true)
        setError(null)

        try {
            let endpoint = "/auth/admin/create-user"
            let body: any = {
                email: newUser.email,
                password: newUser.password,
                name: `${newUser.firstName} ${newUser.lastName}`.trim(),
                role: newUser.role
            }

            if (newUser.role === "chp") {
                endpoint = "/chps"
                body = {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    username: newUser.username,
                    email: newUser.email,
                    password: newUser.password,
                    phoneNumber: newUser.phoneNumber,
                    dateOfBirth: new Date(newUser.dateOfBirth || "1990-01-01").toISOString()
                }
            } else if (newUser.role === "client") {
                endpoint = "/clients"
                body = {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    phoneNumber: newUser.phoneNumber,
                    dateOfBirth: new Date(newUser.dateOfBirth || "1990-01-01").toISOString(),
                    county: newUser.county,
                    subcounty: newUser.subcounty,
                    ward: "Woodley",
                    nationalId: newUser.nationalId,
                    maritalStatus: newUser.maritalStatus
                }
            }

            await apiRequest(endpoint, {
                method: "POST",
                body: JSON.stringify(body)
            })

            setIsAddUserOpen(false)
            refetchAll()
            refetchActivity()
            // Reset form
            setNewUser({
                role: "admin",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                username: "",
                phoneNumber: "",
                county: "Nairobi",
                subcounty: "Kibra",
                nationalId: "",
                maritalStatus: "SINGLE",
                dateOfBirth: "1990-01-01"
            })
        } catch (err: any) {
            console.error("Creation error:", err)
            let msg = "Failed to create user"
            if (err.errors) {
                // NestJS validation errors
                const firstKey = Object.keys(err.errors)[0]
                const errors = err.errors[firstKey]
                msg = Array.isArray(errors) ? errors[0] : (errors._errors ? errors._errors[0] : JSON.stringify(errors))
            } else if (err.message) {
                msg = err.message
            }
            setError(msg)
        } finally {
            setCreationLoading(false)
        }
    }

    // Compute stats on UI
    const systemUsers = authData?.users || []
    const chpCount = systemUsers.filter((u: any) => u.role === 'chp').length
    const adminCount = systemUsers.filter((u: any) => u.role === 'admin').length
    const clientCount = clientData?.totalCount || 0

    const userStats = [
        { title: "CHPs", value: chpCount, icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
        { title: "Clients", value: clientCount, icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
        { title: "Admins", value: adminCount, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Total Users", value: chpCount + adminCount + clientCount, icon: MonitorDot, color: "text-cyan-600", bg: "bg-cyan-50" },
    ]

    // Unified list mapping
    const usersList = useMemo(() => {
        const results = []

        // Add System Users (excluding clients if they are somehow there, but usually they aren't)
        if (roleFilter === 'all' || roleFilter === 'chp' || roleFilter === 'admin') {
            const filteredAuth = systemUsers.filter((u: any) => {
                if (roleFilter !== 'all' && u.role !== roleFilter) return false
                if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
                return true
            })

            results.push(...filteredAuth.map((u: any) => ({
                id: u.id,
                name: u.name || u.email,
                role: u.role?.toUpperCase() || "USER",
                status: u.banned ? "Banned" : "Active",
                location: "AIC Pearl Hospital",
                phone: u.phoneNumber || "N/A",
                lastActive: dayjs(u.updatedAt).fromNow(),
                performance: u.role === 'chp' ? "Calculated" : undefined,
                banned: !!u.banned,
                type: u.role === 'chp' ? 'chp' : 'user'
            })))
        }

        // Add Clients
        if (roleFilter === 'all' || roleFilter === 'client') {
            const clients = clientData?.results || []
            results.push(...clients.map((c: any) => ({
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                role: "Client",
                status: "Active",
                location: c.subcounty || "Kibera",
                phone: c.phoneNumber || "N/A",
                lastActive: dayjs(c.updatedAt).fromNow(),
                banned: false,
                type: 'client'
            })))
        }

        return results.sort((a, b) => b.lastActive.localeCompare(a.lastActive))
    }, [authData, clientData, roleFilter, search])

    const refetchAll = () => {
        refetchAuth()
        refetchClients()
    }

    const handleDelete = async (user: any) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
        try {
            const endpoint = user.type === 'client' ? `/clients/${user.id}` : (user.type === 'chp' ? `/chps/${user.id}` : `/auth/admin/remove-user`)
            const options = user.type === 'user' || user.type === 'chp'
                ? { method: 'POST', body: JSON.stringify({ userId: user.id }) } // removal by better-auth admin plugin
                : { method: 'DELETE' }

            await apiRequest(endpoint, options)
            refetchAll()
        } catch (error) {
            console.error("Failed to delete user", error)
        }
    }

    const handleToggleStatus = async (user: any) => {
        if (user.type === 'client') return
        const isBanned = user.banned
        try {
            const endpoint = isBanned ? `/auth/admin/unban-user` : `/auth/admin/ban-user`
            await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify({ userId: user.id })
            })
            refetchAll()
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const recentActivities = activityData?.results?.map((activity: any) => ({
        text: activity.description || "System activity recorded",
        time: dayjs(activity.createdAt).fromNow(),
        color: activity.type === 'error' ? 'bg-red-500' : 'bg-primary'
    })) || [
            { text: "Jane Wanjiku completed screening for Mary Njeri", time: "2 hours ago", color: "bg-primary" },
            { text: "High-risk client referral generated", time: "4 hours ago", color: "bg-amber-500" },
            { text: "New CHP training session scheduled", time: "1 day ago", color: "bg-secondary" },
        ]

    return (
        <DashboardShell title="User Management" subtitle="Pearl Hospital">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                    <p className="text-sm text-muted-foreground font-medium">{chpCount + adminCount + clientCount} total accounts across all roles</p>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 gap-2 font-bold h-11">
                            <UserPlus className="h-5 w-5" />
                            Add New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold text-center sm:text-left">Add New Account</DialogTitle>
                            <DialogDescription className="text-center sm:text-left">
                                Create a new Admin, CHP, or Client profile.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateUser} className="space-y-6 pb-10">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Role</label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                                >
                                    <SelectTrigger className="h-12 font-medium">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">System Administrator</SelectItem>
                                        <SelectItem value="chp">Community Health Provider (CHP)</SelectItem>
                                        <SelectItem value="client">Patient / Client</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                                    <Input
                                        required
                                        placeholder="Jane"
                                        className="h-12"
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                                    <Input
                                        required
                                        placeholder="Wanjiku"
                                        className="h-12"
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            {(newUser.role === 'admin' || newUser.role === 'chp') && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                                        <Input
                                            required
                                            type="email"
                                            placeholder="jane@example.com"
                                            className="h-12"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                                        <Input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-12"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {newUser.role === 'chp' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Username</label>
                                    <Input
                                        required
                                        placeholder="jane_wanjiku"
                                        className="h-12"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    />
                                </div>
                            )}

                            {(newUser.role === 'chp' || newUser.role === 'client') && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                                    <Input
                                        required
                                        placeholder="+254712345678"
                                        className="h-12"
                                        value={newUser.phoneNumber}
                                        onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                                    />
                                </div>
                            )}

                            {(newUser.role === 'client' || newUser.role === 'chp') && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
                                    <Input
                                        required
                                        type="date"
                                        className="h-12"
                                        value={newUser.dateOfBirth || "1990-01-01"}
                                        onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                                    />
                                </div>
                            )}

                            {newUser.role === 'client' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">National ID</label>
                                            <Input
                                                required
                                                placeholder="12345678"
                                                className="h-12"
                                                value={newUser.nationalId}
                                                onChange={(e) => setNewUser({ ...newUser, nationalId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Marital Status</label>
                                            <Select
                                                value={newUser.maritalStatus}
                                                onValueChange={(val) => setNewUser({ ...newUser, maritalStatus: val })}
                                            >
                                                <SelectTrigger className="h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SINGLE">Single</SelectItem>
                                                    <SelectItem value="MARRIED">Married</SelectItem>
                                                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                                                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                                                    <SelectItem value="SEPARATED">Separated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
                                        <Input
                                            required
                                            type="date"
                                            className="h-12"
                                            value={newUser.dateOfBirth || "1990-01-01"}
                                            onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">County</label>
                                            <Input
                                                required
                                                placeholder="Nairobi"
                                                className="h-12"
                                                value={newUser.county}
                                                onChange={(e) => setNewUser({ ...newUser, county: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sub-County</label>
                                            <Input
                                                required
                                                placeholder="Kibra"
                                                className="h-12"
                                                value={newUser.subcounty}
                                                onChange={(e) => setNewUser({ ...newUser, subcounty: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 font-bold text-base"
                                disabled={creationLoading}
                            >
                                {creationLoading ? "Creating..." : `Create ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}`}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {userStats.map((stat) => (
                    <Card key={stat.title} className="border-none bg-card shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl font-bold text-foreground">
                                    {stat.value}
                                </span>
                                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-lg font-bold text-foreground">{stat.title}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email"
                        className="pl-10 h-11 bg-card border-border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Combobox
                        options={[
                            { label: "All Roles", value: "all" },
                            { label: "CHPs", value: "chp" },
                            { label: "Clients", value: "client" },
                            { label: "Admins", value: "admin" },
                        ]}
                        value={roleFilter}
                        onValueChange={setRoleFilter}
                        placeholder="All Roles"
                        className="w-[140px] bg-card border-border"
                    />
                    <Combobox
                        options={[
                            { label: "All Status", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Suspended", value: "suspended" },
                        ]}
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        placeholder="All Status"
                        className="w-[140px] bg-card border-border"
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-foreground">User Directory</h3>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hover to see actions</span>
                    </div>

                    <div className="space-y-2">
                        {authLoading || clientLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-none animate-pulse">
                                        <CardContent className="p-4 h-16"></CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : usersList.length > 0 ? (
                            usersList.map((user: any) => (
                                <Card key={user.id} className="border-none group overflow-hidden transition-all bg-card hover:bg-primary/5">
                                    <CardContent className="p-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
                                                        <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[9px] font-bold px-1.5 py-0 leading-none h-4 border-none">
                                                            {user.role}
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 ml-2">
                                                            <div className={`w-1.5 h-1.5 ${user.status === 'Active' ? 'bg-primary' : 'bg-red-500'}`}></div>
                                                            <span className={`text-[9px] font-bold ${user.status === 'Active' ? 'text-primary' : 'text-red-500'} uppercase tracking-wider`}>{user.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-0.5">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <MapPin className="h-3 w-3 opacity-60" />
                                                            {user.location}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <Phone className="h-3 w-3 opacity-60" />
                                                            {user.phone}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <Calendar className="h-3 w-3 opacity-60" />
                                                            {user.lastActive}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="hidden group-hover:flex items-center gap-2 transition-all">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {user.type !== 'client' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 ${user.banned ? 'text-primary hover:bg-primary/10' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            {user.banned ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                <div className="text-right min-w-[60px]">
                                                    {user.performance && (
                                                        <>
                                                            <p className="text-sm font-bold text-primary">{user.performance}</p>
                                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Perf.</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border">
                                <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">No users found</h3>
                                <p className="text-sm text-muted-foreground max-w-xs text-center">Try adjusting your filters or search query to find the users you are looking for.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                    <Card className="border-none h-fit bg-card shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            {activityLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-50 animate-pulse"></div>)}
                                </div>
                            ) : recentActivities.length > 0 ? (
                                recentActivities.slice(0, 5).map((activity: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0 mt-1.5`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground leading-tight">{activity.text}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{activity.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Calendar className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                    <p className="text-xs text-muted-foreground font-medium">No recent activity recorded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
