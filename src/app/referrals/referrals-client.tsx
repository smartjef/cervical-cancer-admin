"use client"

import { useState, useMemo } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"
import { useApi } from "@/hooks/use-api"
import { DataTable } from "@/components/data-table"
import { exportToCSV } from "@/lib/export-utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Filter,
    RotateCcw,
    Download,
    Calendar,
    Activity,
    FileText,
    MapPin
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import dayjs from "dayjs"

export default function ReferralsClient() {
    // Filter States
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [riskFilter, setRiskFilter] = useState("all")
    const [dateRange, setDateRange] = useState("all")
    const [supportFilter, setSupportFilter] = useState("all")

    // DataTable States
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {
            page,
            limit,
            includeRelations: "true"
        }

        if (search) params.search = search
        if (sortBy) params.sortBy = sortBy
        if (sortOrder) params.sortOrder = sortOrder.toUpperCase()

        if (statusFilter !== "all") params.status = statusFilter

        // Handle Support Needs Filter
        if (supportFilter === "transport") params.transportNeeded = "true"
        if (supportFilter === "financial") params.financialSupport = "true"
        if (supportFilter === "both") {
            params.transportNeeded = "true"
            params.financialSupport = "true"
        }

        if (dateRange !== "all") {
            const days = parseInt(dateRange)
            params.createdAtFrom = dayjs().subtract(days, 'day').toISOString()
        }

        return new URLSearchParams(params).toString()
    }, [page, limit, search, sortBy, sortOrder, statusFilter, supportFilter, dateRange])

    // Fetch Referrals
    const { data: referralsData, isLoading } = useApi<any>(`/referrals?${queryParams}`)

    // Handle Export
    const handleExport = () => {
        if (!referralsData?.results) return;

        const exportData = referralsData.results.map((item: any) => ({
            ID: item.id.slice(-6).toUpperCase(),
            Client: `${item.screening?.client?.firstName || ''} ${item.screening?.client?.lastName || ''}`,
            Facility: item.healthFacility?.name || 'N/A',
            Status: item.status,
            Appointment: dayjs(item.appointmentTime).format('YYYY-MM-DD HH:mm'),
            Transport: item.transportNeeded ? 'Yes' : 'No',
            Financial: item.financialSupport ? 'Yes' : 'No',
            Created: dayjs(item.createdAt).format('YYYY-MM-DD')
        }));

        exportToCSV(exportData, 'referrals-export', [
            { key: 'ID', label: 'Referral ID' },
            { key: 'Client', label: 'Client Name' },
            { key: 'Facility', label: 'Health Facility' },
            { key: 'Status', label: 'Status' },
            { key: 'Appointment', label: 'Appointment Time' },
            { key: 'Transport', label: 'Transport Needed' },
            { key: 'Financial', label: 'Financial Support' },
            { key: 'Created', label: 'Date Created' },
        ]);
    };

    const activeFilterCount = [
        statusFilter !== "all",
        supportFilter !== "all",
        riskFilter !== "all",
        dateRange !== "all"
    ].filter(Boolean).length

    return (
        <DashboardShell title="Patient Referrals" subtitle="Manage and track facility-based referrals">
            <Card className="border-none bg-card shadow-sm mb-8">
                <DataTable
                    columns={[
                        {
                            header: "Referral ID",
                            accessorKey: "id",
                            cell: (item: any) => (
                                <div className="flex flex-col">
                                    <Link href={`/referrals/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                        #{item.id.slice(-6).toUpperCase()}
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                </div>
                            ),
                            sortable: true,
                            className: "pl-6"
                        },
                        {
                            header: "Client",
                            accessorKey: "screening.client.firstName",
                            cell: (item: any) => (
                                <Link href={`/user-management/clients/${item.screening?.clientId}`} className="font-bold text-foreground hover:underline flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Activity className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="truncate">{item.screening?.client?.firstName} {item.screening?.client?.lastName}</span>
                                </Link>
                            ),
                            sortable: false
                        },
                        {
                            header: "Health Facility",
                            accessorKey: "healthFacility.name",
                            cell: (item: any) => (
                                <div className="flex flex-col max-w-[200px]">
                                    {item.healthFacilityId ? (
                                        <Link href={`/facilities/${item.healthFacilityId}`} className="font-bold text-foreground truncate hover:underline flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {item.healthFacility?.name || 'N/A'}
                                        </Link>
                                    ) : (
                                        <span className="font-bold text-foreground truncate italic opacity-50 flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {item.healthFacility?.name || 'N/A'}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground truncate ml-4.5">
                                        {item.healthFacility?.subcounty}, {item.healthFacility?.county}
                                    </span>
                                </div>
                            ),
                            sortable: false
                        },
                        {
                            header: "Appointment",
                            accessorKey: "appointmentTime",
                            cell: (item: any) => (
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-foreground">{dayjs(item.appointmentTime).format('MMM D, YYYY')}</span>
                                    <span className="text-[10px] text-muted-foreground">{dayjs(item.appointmentTime).format('h:mm A')}</span>
                                </div>
                            ),
                            sortable: true
                        },
                        {
                            header: "Status",
                            accessorKey: "status",
                            cell: (item: any) => (
                                <Badge variant="outline" className={`
                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                    ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                                        item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                                            item.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-muted text-muted-foreground'
                                    }
                                `}>
                                    {item.status || 'N/A'}
                                </Badge>
                            ),
                            sortable: true
                        },
                        {
                            header: "Support Needs",
                            accessorKey: "transportNeeded",
                            cell: (item: any) => (
                                <div className="flex flex-col gap-1">
                                    {item.transportNeeded && (
                                        <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-none text-[9px] w-fit">
                                            Transport
                                        </Badge>
                                    )}
                                    {item.financialSupport && (
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-none text-[9px] w-fit">
                                            Financial
                                        </Badge>
                                    )}
                                    {!item.transportNeeded && !item.financialSupport && (
                                        <span className="text-[10px] text-muted-foreground">None</span>
                                    )}
                                </div>
                            ),
                            sortable: false,
                            className: "text-right pr-6"
                        }
                    ]}
                    data={referralsData?.results || []}
                    isLoading={isLoading}
                    totalCount={referralsData?.totalCount || 0}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    controls={
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                            {/* Search Area */}
                            <div className="flex-1 w-full md:max-w-md relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                    placeholder="Search client, facility or ID..."
                                    className="h-11 pl-9 font-bold border-2 w-full transition-all focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>

                            {/* Actions Area */}
                            <div className="flex items-center gap-3">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-11 px-4 gap-2 border-2 font-bold text-[10px] uppercase tracking-wider bg-background hover:bg-muted/50 transition-colors">
                                            <Filter className="h-3.5 w-3.5" />
                                            Filter
                                            {activeFilterCount > 0 && (
                                                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 font-black bg-primary text-primary-foreground">
                                                    {activeFilterCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-5 space-y-5" align="end">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                                <Filter className="h-3 w-3" />
                                                Filter Referrals
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive gap-1"
                                                onClick={() => {
                                                    setStatusFilter("all")
                                                    setSupportFilter("all")
                                                    setRiskFilter("all")
                                                    setDateRange("all")
                                                    setPage(1)
                                                }}
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </Button>
                                        </div>

                                        <Separator className="opacity-50" />

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Statuses", value: "all" },
                                                        { label: "Pending", value: "PENDING" },
                                                        { label: "Completed", value: "COMPLETED" },
                                                        { label: "Cancelled", value: "CANCELLED" },
                                                    ]}
                                                    value={statusFilter}
                                                    onValueChange={(val) => { setStatusFilter(val); setPage(1); }}
                                                    placeholder="Select Status"
                                                    className="border-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Needs</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Referrals", value: "all" },
                                                        { label: "Transport Needed", value: "transport" },
                                                        { label: "Financial Support", value: "financial" },
                                                        { label: "Both Required", value: "both" },
                                                    ]}
                                                    value={supportFilter}
                                                    onValueChange={(val) => { setSupportFilter(val); setPage(1); }}
                                                    placeholder="Select Support"
                                                    className="border-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Range</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Time", value: "all" },
                                                        { label: "Past 7 days", value: "7" },
                                                        { label: "Past 30 days", value: "30" },
                                                        { label: "Past 90 days", value: "90" },
                                                    ]}
                                                    value={dateRange}
                                                    onValueChange={(val) => { setDateRange(val); setPage(1); }}
                                                    placeholder="Select Range"
                                                    className="border-2"
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    className="h-11 px-4 gap-2 bg-background font-bold text-[10px] uppercase tracking-wider shrink-0 border-2 hover:bg-muted/50 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    }
                />
            </Card>
        </DashboardShell>
    )
}
