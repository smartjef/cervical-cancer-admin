"use client"

import { useState, useMemo } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RecentActivityFeed from "@/components/recent-activity-feed"
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
    Eye,
    CheckCircle2,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
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
import Link from "next/link"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function UserManagementPage() {
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5

    // 1. Fetch System Users (Admins, CHPs) from Better-Auth Admin API
    const { data: authData, isLoading: authLoading, refetch: refetchAuth } = useApi<any>("/auth/admin/list-users?limit=100")

    // 2. Fetch CHPs to get performance and counts
    const { data: chpsData, isLoading: chpLoading, refetch: refetchChps } = useApi<any>("/chps?limit=1000")

    // 3. Fetch Clients from regular Clients API
    const { data: clientData, isLoading: clientLoading, refetch: refetchClients } = useApi<any>(`/clients?limit=1000${search ? `&search=${search}` : ""}`)

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
    const { toast } = useToast()

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
            toast({
                title: "User Created",
                description: `${newUser.firstName} ${newUser.lastName} has been added successfully.`,
                variant: "success"
            })
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
                if (statusFilter !== 'all') {
                    const isActive = !u.banned
                    if (statusFilter === 'active' && !isActive) return false
                    if (statusFilter === 'inactive' && isActive) return false
                }
                if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
                return true
            })

            results.push(...filteredAuth.map((u: any) => {
                const chpInfo = chpsData?.results?.find((c: any) => c.userId === u.id)
                return {
                    id: u.id,
                    chpId: chpInfo?.id,
                    name: u.name || u.email,
                    role: u.role?.toUpperCase() || "USER",
                    status: u.banned ? "Inactive" : "Active",
                    location: "AIC Pearl Hospital",
                    phone: u.phoneNumber || "N/A",
                    lastActive: dayjs(u.updatedAt).fromNow(),
                    performance: u.role === 'chp' ? (chpInfo?._count?.screenings > 20 ? "High" : chpInfo?._count?.screenings > 5 ? "Normal" : "Baseline") : undefined,
                    clientsCount: chpInfo?._count?.clients || 0,
                    screeningsCount: chpInfo?._count?.screenings || 0,
                    banned: !!u.banned,
                    type: u.role === 'chp' ? 'chp' : 'user'
                }
            }))
        }

        // Add Clients
        if (roleFilter === 'all' || roleFilter === 'client') {
            const clients = clientData?.results || []
            const filteredClients = clients.filter((c: any) => {
                if (statusFilter === 'inactive') return false // Clients are always active for now
                return true
            })
            results.push(...filteredClients.map((c: any) => ({
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
    }, [authData, clientData, roleFilter, statusFilter, search])

    const totalPages = Math.ceil(usersList.length / pageSize)
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return usersList.slice(start, start + pageSize)
    }, [usersList, currentPage])

    // Reset page when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [roleFilter, statusFilter, search])

    const refetchAll = () => {
        refetchAuth()
        refetchChps()
        refetchClients()
    }

    const activities = [] // Placeholder to keep JSX stable if needed, but we'll remove usage

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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 md:gap-6 mb-8 overflow-hidden rounded-2xl border border-border/50 md:border-none md:rounded-none bg-card md:bg-transparent shadow-sm md:shadow-none">
                {userStats.map((stat, index) => (
                    <div
                        key={stat.title}
                        className={`p-5 md:p-6 md:bg-card md:rounded-2xl md:shadow-sm transition-all hover:shadow-md border-border/50 
                            ${index % 2 === 0 ? "border-r" : ""} 
                            ${index < 2 ? "border-b" : ""} 
                            md:border-none`}
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground">
                                {stat.value}
                            </span>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg md:rounded-xl`}>
                                <stat.icon className="h-4 w-4 md:h-6 md:w-6" />
                            </div>
                        </div>
                        <p className="text-xs md:text-sm lg:text-lg font-bold text-foreground">{stat.title}</p>
                    </div>
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
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user: any) => (
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
                                                    {user.type === 'chp' ? (
                                                        <div className="flex items-center gap-6 mt-1.5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-foreground leading-none">{user.clientsCount}</span>
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">Clients</span>
                                                            </div>
                                                            <div className="flex flex-col border-l border-border/30 pl-4">
                                                                <span className="text-sm font-black text-foreground leading-none">{user.screeningsCount}</span>
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">Screenings</span>
                                                            </div>
                                                            <div className="flex flex-col border-l border-border/30 pl-4">
                                                                <span className="text-sm font-black text-primary leading-none">{user.performance}</span>
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">Perf.</span>
                                                            </div>
                                                        </div>
                                                    ) : (
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
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="hidden group-hover:flex items-center gap-2 transition-all">
                                                    {(user.type === 'client' && user.id) || (user.type !== 'client' && user.id) ? (
                                                        <Link href={user.type === 'client' ? `/users/clients/${user.id}` : `/users/${user.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 cursor-not-allowed" disabled>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="text-right flex items-center gap-6">
                                                    <div className="text-right min-w-[60px]">
                                                        {user.type !== 'chp' && user.performance && (
                                                            <>
                                                                <p className="text-sm font-bold text-primary">{user.performance}</p>
                                                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Perf.</p>
                                                            </>
                                                        )}
                                                    </div>
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className="h-8 w-8 p-0 text-xs font-bold"
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                    <Card className="border-none h-fit bg-card shadow-sm">
                        <CardContent className="p-6">
                            <RecentActivityFeed limit={7} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
