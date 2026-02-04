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
    CalendarClock,
    User,
    ClipboardCheck,
    AlertCircle
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function FollowUpsClient() {
    // Filter States
    const [search, setSearch] = useState("")
    const [dateRange, setDateRange] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // DataTable States
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [sortBy, setSortBy] = useState("dueDate")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

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

        if (priorityFilter !== "all") params.priority = priorityFilter
        if (categoryFilter !== "all") params.category = categoryFilter
        if (statusFilter !== "all") params.status = statusFilter

        if (dateRange !== "all") {
            const days = parseInt(dateRange)
            params.dueDateFrom = dayjs().subtract(days, 'day').toISOString()
        }

        return new URLSearchParams(params).toString()
    }, [page, limit, search, sortBy, sortOrder, dateRange, priorityFilter, categoryFilter, statusFilter])

    // Fetch Follow-ups
    const { data: followUpsData, isLoading } = useApi<any>(`/follow-up?${queryParams}`)

    // Handle Export
    const handleExport = () => {
        if (!followUpsData?.results) return;

        const exportData = followUpsData.results.map((item: any) => ({
            ID: item.id.slice(-6).toUpperCase(),
            Client: `${item.client?.firstName || ''} ${item.client?.lastName || ''}`,
            Category: item.category?.replace(/_/g, " ") || 'N/A',
            Priority: item.priority || 'N/A',
            DueDate: dayjs(item.dueDate).format('YYYY-MM-DD'),
            Status: item.completedAt ? 'Completed' : (dayjs(item.dueDate).isBefore(dayjs()) ? 'Overdue' : 'Pending'),
            Trigger: item.triggerScreeningId ? `Screening #${item.triggerScreeningId.slice(-6).toUpperCase()}` : 'N/A',
        }));

        exportToCSV(exportData, 'followups-export', [
            { key: 'ID', label: 'Follow-up ID' },
            { key: 'Client', label: 'Client Name' },
            { key: 'Category', label: 'Category' },
            { key: 'Priority', label: 'Priority' },
            { key: 'DueDate', label: 'Due Date' },
            { key: 'Status', label: 'Status' },
            { key: 'Trigger', label: 'Trigger Event' },
        ]);
    };

    const activeFilterCount = [
        dateRange !== "all",
        priorityFilter !== "all",
        categoryFilter !== "all",
        statusFilter !== "all"
    ].filter(Boolean).length

    return (
        <DashboardShell title="Patient Follow-ups" subtitle="Monitor and manage patient adherence">
            <Card className="border-none bg-card shadow-sm mb-8">
                <DataTable
                    columns={[
                        {
                            header: "Follow-up ID",
                            accessorKey: "id",
                            cell: (item: any) => (
                                <div className="flex flex-col">
                                    <Link href={`/follow-ups/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
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
                            accessorKey: "client.firstName",
                            cell: (item: any) => (
                                <Link href={`/user-management/clients/${item.clientId}`} className="font-bold text-foreground hover:underline flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="truncate">{item.client?.firstName} {item.client?.lastName}</span>
                                </Link>
                            ),
                            sortable: false
                        },
                        {
                            header: "Category & Priority",
                            accessorKey: "category",
                            cell: (item: any) => (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.category?.replace(/_/g, " ")}</span>
                                    <Badge variant="outline" className={`
                                        w-fit text-[9px] font-bold border-none px-1.5 py-0 rounded
                                        ${item.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                                            item.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-sky-500/10 text-sky-600'}
                                    `}>
                                        {item.priority}
                                    </Badge>
                                </div>
                            ),
                            sortable: true
                        },
                        {
                            header: "Trigger",
                            accessorKey: "triggerScreeningId",
                            cell: (item: any) => (
                                <div className="flex flex-col gap-1">
                                    <Link href={`/screening/${item.triggerScreeningId}`} className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1">
                                        <ClipboardCheck className="h-3 w-3" />
                                        #{item.triggerScreeningId.slice(-6).toUpperCase()}
                                    </Link>
                                    {item.referralId && (
                                        <Link href={`/referrals/${item.referralId}`} className="text-[9px] text-muted-foreground hover:underline ml-4">
                                            Related Referral
                                        </Link>
                                    )}
                                </div>
                            ),
                            sortable: false
                        },
                        {
                            header: "Due Date & Status",
                            accessorKey: "dueDate",
                            cell: (item: any) => {
                                const isCompleted = !!item.completedAt;
                                const isOverdue = !isCompleted && dayjs(item.dueDate).isBefore(dayjs());

                                return (
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-xs">{dayjs(item.dueDate).format("MMM D, YYYY")}</span>
                                        {isCompleted ? (
                                            <Badge variant="secondary" className="w-fit bg-emerald-500/10 text-emerald-600 border-none text-[9px] px-1.5">
                                                Completed
                                            </Badge>
                                        ) : isOverdue ? (
                                            <Badge variant="destructive" className="w-fit bg-rose-500/10 text-rose-600 border-none text-[9px] px-1.5 flex items-center gap-1">
                                                <AlertCircle className="h-2 w-2" />
                                                Overdue
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">{dayjs(item.dueDate).fromNow()}</span>
                                        )}
                                    </div>
                                )
                            },
                            sortable: true,
                            className: "text-right pr-6"
                        }
                    ]}
                    data={followUpsData?.results || []}
                    isLoading={isLoading}
                    totalCount={followUpsData?.totalCount || 0}
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
                                    placeholder="Search client, ID or trigger..."
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
                                                Filter Follow-ups
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive gap-1"
                                                onClick={() => {
                                                    setDateRange("all")
                                                    setPriorityFilter("all")
                                                    setCategoryFilter("all")
                                                    setStatusFilter("all")
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
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Priorities", value: "all" },
                                                        { label: "High", value: "HIGH" },
                                                        { label: "Medium", value: "MEDIUM" },
                                                        { label: "Low", value: "LOW" },
                                                    ]}
                                                    value={priorityFilter}
                                                    onValueChange={(val) => { setPriorityFilter(val); setPage(1); }}
                                                    placeholder="Select Priority"
                                                    className="border-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Statuses", value: "all" },
                                                        { label: "Pending", value: "PENDING" },
                                                        { label: "Completed", value: "COMPLETED" },
                                                        { label: "Overdue", value: "OVERDUE" },
                                                    ]}
                                                    value={statusFilter}
                                                    onValueChange={(val) => { setStatusFilter(val); setPage(1); }}
                                                    placeholder="Select Status"
                                                    className="border-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Categories", value: "all" },
                                                        { label: "Referral Adherence", value: "REFERRAL_ADHERENCE" },
                                                        { label: "Treatment Adherence", value: "TREATMENT_ADHERENCE" },
                                                        { label: "Routine Checkup", value: "ROUTINE_CHECKUP" },
                                                    ]}
                                                    value={categoryFilter}
                                                    onValueChange={(val) => { setCategoryFilter(val); setPage(1); }}
                                                    placeholder="Select Category"
                                                    className="border-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date Range</Label>
                                                <Combobox
                                                    options={[
                                                        { label: "All Time", value: "all" },
                                                        { label: "Next 7 days", value: "7" },
                                                        { label: "Past 30 days", value: "30" },
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
