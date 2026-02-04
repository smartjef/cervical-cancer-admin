"use client"

import { useState, useMemo } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Link from "next/link"
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
    ArrowLeft,
    Download,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    User,
    Activity,
    Database,
    Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

dayjs.extend(relativeTime)

export default function ActivitiesPage() {
    // --- State for Query Parameters ---
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [userId, setUserId] = useState("")
    const [action, setAction] = useState("all")
    const [resource, setResource] = useState("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [search, setSearch] = useState("") // Manual search for resourceId or description

    // --- Build Query String ---
    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("limit", limit.toString())

        if (userId) params.append("userId", userId)
        if (action !== "all") params.append("action", action)
        if (resource !== "all") params.append("resource", resource)
        if (dateFrom) params.append("dateFrom", dateFrom)
        if (dateTo) params.append("dateTo", dateTo)
        if (search) params.append("resourceId", search) // Using search as resourceId filter for now

        return params.toString()
    }, [page, limit, userId, action, resource, dateFrom, dateTo, search])

    const { data: activityData, isLoading, refetch } = useApi<any>(`/activities?${queryString}`)
    const { data: allUsers } = useApi<any>("/auth/admin/list-users?limit=100")

    const activities = activityData?.results || []
    const totalPages = activityData?.totalPages || 1
    const totalCount = activityData?.totalCount || 0

    // --- Handlers ---
    const handleResetFilters = () => {
        setPage(1)
        setUserId("")
        setAction("all")
        setResource("all")
        setDateFrom("")
        setDateTo("")
        setSearch("")
    }

    const handleExportCSV = () => {
        if (!activities.length) return

        const headers = ["ID", "Timestamp", "User", "Email", "Action", "Resource", "Resource ID", "Description", "Risk Score", "IP Address"]
        const rows = activities.map((a: any) => [
            a.id,
            dayjs(a.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            a.user?.name || "System",
            a.user?.email || "N/A",
            a.action,
            a.resource,
            a.resourceId,
            a.description.replace(/,/g, ";"), // Prevent CSV breakage
            a.metadata?.riskScore || "N/A",
            a.ipAddress
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `system_activities_${dayjs().format("YYYYMMDD_HHmm")}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // --- Utility to get color for resource ---
    const getResourceColor = (res: string) => {
        switch (res.toLowerCase()) {
            case 'screening': return 'bg-primary/10 text-primary border-primary/20'
            case 'client': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
            case 'user': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    return (
        <DashboardShell title="System Activities" subtitle="Full Audit Trail & Logs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-widest text-[10px] h-9">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Activity Logs</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 font-bold h-9 border-2"
                        onClick={handleExportCSV}
                        disabled={!activities.length}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <Card className="border-none shadow-sm mb-6 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Resource ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                    placeholder="Enter partial ID..."
                                    className="h-10 pl-9 font-medium border-2"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Performed By</label>
                            <Select value={userId} onValueChange={(val) => { setUserId(val); setPage(1); }}>
                                <SelectTrigger className="h-10 font-medium border-2">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All Users</SelectItem>
                                    {allUsers?.users?.map((u: any) => (
                                        <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resource Type</label>
                            <Select value={resource} onValueChange={(val) => { setResource(val); setPage(1); }}>
                                <SelectTrigger className="h-10 font-medium border-2">
                                    <SelectValue placeholder="All Resources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Resources</SelectItem>
                                    <SelectItem value="screening">Screening</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="user">User/Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Action</label>
                            <Select value={action} onValueChange={(val) => { setAction(val); setPage(1); }}>
                                <SelectTrigger className="h-10 font-medium border-2">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="create">Create</SelectItem>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From Date</label>
                            <Input
                                type="date"
                                className="h-10 font-medium border-2"
                                value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                            />
                        </div>

                        <div className="flex items-end pb-0.5">
                            <Button variant="ghost" className="h-10 w-full font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-colors" onClick={handleResetFilters}>
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Table View --- */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b-2">
                                    <TableHead className="w-[180px] font-black text-[10px] uppercase tracking-widest">Time & Date</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">User</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Action</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Resource</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Details</TableHead>
                                    <TableHead className="w-[100px] text-right font-black text-[10px] uppercase tracking-widest">Link</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Records...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : activities.length > 0 ? (
                                    activities.map((activity: any) => (
                                        <TableRow key={activity.id} className="group hover:bg-primary/[0.02] border-b transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-foreground tabular-nums">
                                                        {dayjs(activity.createdAt).format("HH:mm:ss")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                        {dayjs(activity.createdAt).format("MMM D, YYYY")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shadow-inner">
                                                        <User className="h-4 w-4 text-muted-foreground/60" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={`/users/${activity.userId}`}
                                                            className="text-sm font-black hover:text-primary transition-colors hover:underline underline-offset-2"
                                                        >
                                                            {activity.user?.name || "System"}
                                                        </Link>
                                                        <span className="text-[10px] font-medium text-muted-foreground/70 truncate max-w-[140px]">
                                                            {activity.user?.email || "internal@system"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border-2
                                                        ${activity.action === 'create' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                            activity.action === 'update' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                                'bg-gray-500/10 text-gray-600 border-gray-500/20'}
                                                    `}
                                                >
                                                    {activity.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border-2 ${getResourceColor(activity.resource)}`}
                                                >
                                                    {activity.resource}
                                                </Badge>
                                                <div className="mt-1 text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                                                    ID: {activity.resourceId?.slice(-8) || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 max-w-[300px]">
                                                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-1 group-hover:line-clamp-none transition-all">
                                                        {activity.description}
                                                    </p>
                                                    {activity.metadata?.riskScore !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-md">
                                                                <span className="text-[9px] font-black text-red-600 uppercase">Score: {activity.metadata.riskScore}</span>
                                                            </div>
                                                            <span className="text-[9px] font-black text-red-600/60 uppercase">{activity.metadata.riskInterpretation?.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                    {activity.metadata?.clientName && (
                                                        <Link
                                                            href={`/users/clients/${activity.metadata.clientId}`}
                                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 mt-0.5"
                                                        >
                                                            <User className="h-2.5 w-2.5" />
                                                            {activity.metadata.clientName}
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {activity.resourceId && (
                                                    <Link
                                                        href={activity.resource === 'screening' ? `/screening/${activity.resourceId}` :
                                                            activity.resource === 'client' ? `/users/clients/${activity.resourceId}` :
                                                                `/users/${activity.userId}`}
                                                    >
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <Database className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                                <h3 className="text-base font-black text-foreground uppercase tracking-widest">No matching activities</h3>
                                                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto mt-1">
                                                    Try adjusting your filters or search query to find the logs you are looking for.
                                                </p>
                                                <Button variant="link" className="mt-4 font-black uppercase text-xs text-primary" onClick={handleResetFilters}>
                                                    Clear all filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- Pagination Controls --- */}
                    <div className="px-6 py-4 flex items-center justify-between bg-muted/20 border-t">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Total Records: <span className="text-foreground">{totalCount}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rows per page:</span>
                                <Select value={limit.toString()} onValueChange={(val) => { setLimit(parseInt(val)); setPage(1); }}>
                                    <SelectTrigger className="h-8 w-[70px] text-[10px] font-black border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="h-9 w-9 p-0 border-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="h-9 w-9 p-0 border-2"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </DashboardShell>
    )
}
