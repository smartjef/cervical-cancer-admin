"use client"

import { useState, useMemo, useEffect } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/combobox"
import { useApi } from "@/hooks/use-api"
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Activity,
    Loader2,
    Search,
    Download,
    Filter,
    RotateCcw
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Line,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import Link from "next/link"
import { DataTable } from "@/components/data-table"
import { exportToCSV } from "@/lib/export-utils"

export default function ScreeningDataPage() {
    const [mounted, setMounted] = useState(false)

    // Filter States
    const [dateRange, setDateRange] = useState("all")
    const [chpFilter, setChpFilter] = useState("all")
    const [riskLevel, setRiskLevel] = useState("all")
    const [countyFilter, setCountyFilter] = useState("all")
    const [subcountyFilter, setSubcountyFilter] = useState("all")
    const [wardFilter, setWardFilter] = useState("all")

    // Location Search States
    const [countySearch, setCountySearch] = useState("")
    const [subcountySearch, setSubcountySearch] = useState("")
    const [wardSearch, setWardSearch] = useState("")

    // Debounced Search States
    const [debouncedCountySearch, setDebouncedCountySearch] = useState("")
    const [debouncedSubcountySearch, setDebouncedSubcountySearch] = useState("")
    const [debouncedWardSearch, setDebouncedWardSearch] = useState("")

    // Simple Debounce Effects
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedCountySearch(countySearch), 300)
        return () => clearTimeout(timer)
    }, [countySearch])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSubcountySearch(subcountySearch), 300)
        return () => clearTimeout(timer)
    }, [subcountySearch])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedWardSearch(wardSearch), 300)
        return () => clearTimeout(timer)
    }, [wardSearch])

    // DataTable States
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    // Fetch CHPs for filter
    const { data: chpsData } = useApi<any>("/chps?limit=100")
    const chpOptions = useMemo(() => {
        const options = [{ label: "All CHPs", value: "all" }]
        if (chpsData?.results) {
            chpsData.results.forEach((c: any) => {
                options.push({ label: `${c.firstName} ${c.lastName}`, value: c.id })
            })
        }
        return options
    }, [chpsData])

    // Fetch Locations Hierarchically (Generic AddressHierarchy API)
    const { data: countiesData, isLoading: isCountiesLoading } = useApi<any>(
        `/address-hierarchy?level=1&pageSize=50${debouncedCountySearch ? `&search=${debouncedCountySearch}` : ""}`
    )
    const { data: subcountiesData, isLoading: isSubcountiesLoading } = useApi<any>(
        countyFilter !== "all" ? `/address-hierarchy?level=2&parentId=${countyFilter}&pageSize=50${debouncedSubcountySearch ? `&search=${debouncedSubcountySearch}` : ""}` : null
    )
    const { data: wardsData, isLoading: isWardsLoading } = useApi<any>(
        subcountyFilter !== "all" ? `/address-hierarchy?level=3&parentId=${subcountyFilter}&pageSize=100${debouncedWardSearch ? `&search=${debouncedWardSearch}` : ""}` : null
    )

    // Location Options (Map ID as value for hierarchy, but keep Name as label)
    const countyOptions = useMemo(() => {
        const results = countiesData?.results || []
        const mapped = results.map((c: any) => ({
            label: c.name,
            value: c.id
        }))
        return [{ label: "All Counties", value: "all" }, ...mapped]
    }, [countiesData])

    const subcountyOptions = useMemo(() => {
        const results = subcountiesData?.results || []
        const mapped = results.map((s: any) => ({
            label: s.name,
            value: s.id
        }))
        return [{ label: "All Subcounties", value: "all" }, ...mapped]
    }, [subcountiesData])

    const wardOptions = useMemo(() => {
        const results = wardsData?.results || []
        const mapped = results.map((w: any) => ({
            label: w.name,
            value: w.id
        }))
        return [{ label: "All Wards", value: "all" }, ...mapped]
    }, [wardsData])

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {
            page,
            limit,
            includeForAllProviders: "true"
        }

        if (search) params.search = search
        if (sortBy) params.sortBy = sortBy
        if (sortOrder) params.sortOrder = sortOrder.toUpperCase()

        if (chpFilter !== "all") params.providerId = chpFilter
        if (riskLevel !== "all") params.risk = riskLevel.toUpperCase() + "_RISK"

        // Resolve IDs back to names for screenings query
        if (countyFilter !== "all") {
            const county = countyOptions.find(o => o.value === countyFilter)
            if (county) params.county = county.label
        }
        if (subcountyFilter !== "all") {
            const subcounty = subcountyOptions.find(o => o.value === subcountyFilter)
            if (subcounty) params.subcounty = subcounty.label
        }
        if (wardFilter !== "all") {
            const ward = wardOptions.find(o => o.value === wardFilter)
            if (ward) params.ward = ward.label
        }

        if (dateRange !== "all") {
            const days = parseInt(dateRange)
            params.screeningDateFrom = dayjs().subtract(days, 'day').toISOString()
            params.screeningDateTo = dayjs().toISOString()
        }

        return new URLSearchParams(params).toString()
    }, [page, limit, search, sortBy, sortOrder, chpFilter, riskLevel, dateRange, countyFilter, subcountyFilter, wardFilter, countyOptions, subcountyOptions, wardOptions])

    // Fetch Data
    const { data: summary, isLoading: summaryLoading } = useApi<any>(`/admin/dashboard/summary?${queryParams}`)
    const { data: screeningsData, isLoading: screeningsLoading } = useApi<any>(`/screenings?${queryParams}`)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Handle Export
    const handleExport = () => {
        if (!screeningsData?.results) return;

        const exportData = screeningsData.results.map((item: any) => ({
            ID: item.id.slice(-6).toUpperCase(),
            Client: `${item.client?.firstName} ${item.client?.lastName}`,
            Provider: `${item.provider?.firstName} ${item.provider?.lastName}`,
            Location: `${item.client?.ward || ''}, ${item.client?.subcounty || ''}`,
            RiskLevel: item.scoringResult?.interpretation?.replace('_RISK', '') || 'N/A',
            Score: item.scoringResult?.aggregateScore || 0,
            Age: item.scoringResult?.clientAge || 'N/A',
            Date: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
        }));

        exportToCSV(exportData, 'screenings-export', [
            { key: 'ID', label: 'Screening ID' },
            { key: 'Client', label: 'Client Name' },
            { key: 'Provider', label: 'Provider' },
            { key: 'Location', label: 'Location' },
            { key: 'RiskLevel', label: 'Risk Level' },
            { key: 'Score', label: 'Score' },
            { key: 'Age', label: 'Client Age' },
            { key: 'Date', label: 'Screening Date' },
        ]);
    };

    const stats = useMemo(() => {
        if (!summary) return []
        return [
            {
                title: "Total Screenings",
                value: summary.stats.totalScreenings,
                change: "Actual count",
                icon: Activity,
                color: "text-primary",
            },
            {
                title: "Referral Completion",
                value: summary.stats.referralCompletionRate,
                change: "Target: 95%",
                icon: AlertTriangle,
                color: "text-amber-500",
            },
            {
                title: "This Month",
                value: summary.stats.screeningsThisMonth,
                change: `Target: 100`,
                icon: TrendingUp,
                color: "text-secondary",
            },
            {
                title: "Overall Success",
                value: summary.stats.followUpRate,
                change: "Target: 90%",
                icon: CheckCircle2,
                color: "text-primary",
            },
        ]
    }, [summary])

    if (!mounted) return null

    return (
        <DashboardShell title="Screening Analytics" subtitle="Live Performance Tracking">
            {/* Filters consolidated into unified dropdown within DataTable */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 md:gap-6 mb-8 overflow-hidden rounded-2xl border border-border/50 md:border-none md:rounded-none bg-card md:bg-transparent shadow-sm md:shadow-none">
                {summaryLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-5 md:p-6 md:bg-card md:rounded-2xl border-border/50 animate-pulse flex flex-col gap-4">
                            <div className="flex justify-between">
                                <div className="h-8 w-16 bg-muted rounded"></div>
                                <div className="h-8 w-8 bg-muted rounded-full"></div>
                            </div>
                            <div className="h-4 w-24 bg-muted rounded"></div>
                        </div>
                    ))
                ) : stats.map((stat, index) => (
                    <div
                        key={stat.title}
                        className={`p-5 md:p-6 md:bg-card md:rounded-2xl md:shadow-sm transition-all hover:shadow-md border-border/50 
                            ${index % 2 === 0 ? "border-r" : ""} 
                            ${index < 2 ? "border-b" : ""} 
                            md:border-none`}
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <span className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</span>
                            <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                        </div>
                        <p className="text-xs md:text-sm font-bold text-foreground mb-1">{stat.title}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.change}</p>
                    </div>
                ))}
            </div>

            <Card className="border-none mb-8 bg-card shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">Screening Performance Trends</CardTitle>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-20" /> Actual</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 bg-primary border-t-2 border-dashed" /> Target</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 bg-emerald-500" /> Follow-up Rate %</div>
                    </div>
                </CardHeader>
                <CardContent className="h-[400px] p-6 pt-0">
                    {summaryLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={summary?.analytics?.trends || []}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="oklch(var(--p))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="oklch(var(--p))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'oklch(var(--bc))', fontSize: 12, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'oklch(var(--bc))', fontSize: 12, fontWeight: 500 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'oklch(var(--bc))', fontSize: 10, fontWeight: 500 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'oklch(var(--b3))', strokeWidth: 2 }}
                                    contentStyle={{
                                        backgroundColor: 'oklch(var(--b1))',
                                        border: '1px solid oklch(var(--b3))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="value"
                                    name="Actual Screenings"
                                    stroke="oklch(var(--p))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorActual)"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="target"
                                    name="Target"
                                    stroke="oklch(var(--p))"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="rate"
                                    name="Follow-up Rate %"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#10b981' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <DataTable
                columns={[
                    {
                        header: "Screening ID",
                        accessorKey: "id",
                        cell: (item: any) => (
                            <Link href={`/screening/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                #{item.id.slice(-6).toUpperCase()}
                            </Link>
                        ),
                        sortable: true,
                        className: "pl-6"
                    },
                    {
                        header: "Client Name",
                        accessorKey: "client.firstName",
                        cell: (item: any) => (
                            <Link href={`/users/clients/${item.client?.id}`} className="font-bold text-foreground hover:underline">
                                {item.client?.firstName} {item.client?.lastName}
                            </Link>
                        ),
                        sortable: true
                    },
                    {
                        header: "Provider",
                        accessorKey: "provider.firstName",
                        cell: (item: any) => (
                            <Link href={`/users/${item.provider?.id}`} className="text-muted-foreground font-medium hover:underline">
                                {item.provider?.firstName} {item.provider?.lastName}
                            </Link>
                        ),
                        sortable: true
                    },
                    {
                        header: "Location",
                        accessorKey: "client.ward",
                        cell: (item: any) => <div className="text-xs text-muted-foreground">{item.client?.ward || item.client?.subcounty || "N/A"}</div>,
                        sortable: false
                    },
                    {
                        header: "Risk Level",
                        accessorKey: "scoringResult.interpretation",
                        cell: (item: any) => (
                            <Badge variant="outline" className={`
                                font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                ${item.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                    (item.scoringResult?.interpretation?.includes('MEDIUM') || item.scoringResult?.interpretation?.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                        'bg-emerald-500/10 text-emerald-600'
                                }
                            `}>
                                {item.scoringResult?.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM') || 'N/A'}
                            </Badge>
                        ),
                        sortable: true
                    },
                    {
                        header: "Score",
                        accessorKey: "scoringResult.aggregateScore",
                        cell: (item: any) => <div className="font-bold text-primary text-sm">{item.scoringResult?.aggregateScore || 0}</div>,
                        sortable: true
                    },
                    {
                        header: "Age",
                        accessorKey: "scoringResult.clientAge",
                        cell: (item: any) => <div className="font-bold text-muted-foreground">{item.scoringResult?.clientAge || 'N/A'}</div>,
                        sortable: true
                    },
                    {
                        header: "Date",
                        accessorKey: "createdAt",
                        cell: (item: any) => <div className="font-medium text-muted-foreground">{dayjs(item.createdAt).format('MMM D, YYYY')}</div>,
                        sortable: true,
                        className: "text-right pr-6"
                    }
                ]}
                data={screeningsData?.results || []}
                isLoading={screeningsLoading}
                totalCount={screeningsData?.totalCount || 0}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                controls={
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                        {/* Search Area */}
                        <div className="flex-1 w-full md:max-w-md relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Search by client, provider..."
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
                                        {(dateRange !== "all" || chpFilter !== "all" || riskLevel !== "all" || countyFilter !== "all" || subcountyFilter !== "all" || wardFilter !== "all") && (
                                            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 font-black bg-primary text-primary-foreground">
                                                {[dateRange, chpFilter, riskLevel, countyFilter, subcountyFilter, wardFilter].filter(f => f !== "all").length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-5 space-y-5" align="end">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                            <Filter className="h-3 w-3" />
                                            Filter Screenings
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive gap-1"
                                            onClick={() => {
                                                setDateRange("all");
                                                setChpFilter("all");
                                                setRiskLevel("all");
                                                setCountyFilter("all");
                                                setSubcountyFilter("all");
                                                setWardFilter("all");
                                                setPage(1);
                                            }}
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Reset
                                        </Button>
                                    </div>

                                    <Separator className="opacity-50" />

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Range</Label>
                                            <Combobox
                                                options={[
                                                    { label: "All Time", value: "all" },
                                                    { label: "Last 7 days", value: "7" },
                                                    { label: "Last 30 days", value: "30" },
                                                    { label: "Last 90 days", value: "90" },
                                                ]}
                                                value={dateRange}
                                                onValueChange={(val) => { setDateRange(val); setPage(1); }}
                                                placeholder="Select Range"
                                                className="border-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CHP Filter</Label>
                                            <Combobox
                                                options={chpOptions}
                                                value={chpFilter}
                                                onValueChange={(val) => { setChpFilter(val); setPage(1); }}
                                                placeholder="Select CHP"
                                                className="border-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk Level</Label>
                                            <Combobox
                                                options={[
                                                    { label: "All Risk Levels", value: "all" },
                                                    { label: "Low Risk", value: "low" },
                                                    { label: "Medium Risk", value: "medium" },
                                                    { label: "High Risk", value: "high" },
                                                ]}
                                                value={riskLevel}
                                                onValueChange={(val) => { setRiskLevel(val); setPage(1); }}
                                                placeholder="Select Risk"
                                                className="border-2"
                                            />
                                        </div>

                                        <Separator className="opacity-50 my-2" />

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">County</Label>
                                            <Combobox
                                                options={countyOptions}
                                                value={countyFilter}
                                                onValueChange={(val) => {
                                                    setCountyFilter(val);
                                                    setSubcountyFilter("all");
                                                    setWardFilter("all");
                                                    setPage(1);
                                                }}
                                                onSearchChange={setCountySearch}
                                                isLoading={isCountiesLoading}
                                                placeholder="Select County"
                                                className="border-2"
                                            />
                                        </div>

                                        {countyFilter !== "all" && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subcounty</Label>
                                                <Combobox
                                                    options={subcountyOptions}
                                                    value={subcountyFilter}
                                                    onValueChange={(val) => {
                                                        setSubcountyFilter(val);
                                                        setWardFilter("all");
                                                        setPage(1);
                                                    }}
                                                    onSearchChange={setSubcountySearch}
                                                    isLoading={isSubcountiesLoading}
                                                    placeholder="Select Subcounty"
                                                    className="border-2"
                                                />
                                            </div>
                                        )}

                                        {(countyFilter !== "all" && subcountyFilter !== "all") && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ward</Label>
                                                <Combobox
                                                    options={wardOptions}
                                                    value={wardFilter}
                                                    onValueChange={(val) => {
                                                        setWardFilter(val);
                                                        setPage(1);
                                                    }}
                                                    onSearchChange={setWardSearch}
                                                    isLoading={isWardsLoading}
                                                    placeholder="Select Ward"
                                                    className="border-2"
                                                />
                                            </div>
                                        )}
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
        </DashboardShell>
    )
}
