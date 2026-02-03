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
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Bar,
    ComposedChart,
    Line,
    Legend,
} from "recharts"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import Link from "next/link"

export default function ScreeningDataPage() {
    const [mounted, setMounted] = useState(false)
    const [dateRange, setDateRange] = useState("all")
    const [chpFilter, setChpFilter] = useState("all")
    const [riskLevel, setRiskLevel] = useState("all")

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

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {}
        if (chpFilter !== "all") params.providerId = chpFilter
        if (riskLevel !== "all") params.risk = riskLevel.toUpperCase() + "_RISK"

        if (dateRange !== "all") {
            const days = parseInt(dateRange)
            params.screeningDateFrom = dayjs().subtract(days, 'day').toISOString()
            params.screeningDateTo = dayjs().toISOString()
        }

        return new URLSearchParams(params).toString()
    }, [chpFilter, riskLevel, dateRange])

    const { data: summary, isLoading: summaryLoading } = useApi<any>(`/admin/dashboard/summary?${queryParams}`)
    const { data: screeningsData, isLoading: screeningsLoading } = useApi<any>(`/screenings?includeForAllProviders=true&${queryParams}`)

    useEffect(() => {
        setMounted(true)
    }, [])

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
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Range</label>
                        <Combobox
                            options={[
                                { label: "All Time", value: "all" },
                                { label: "Last 7 days", value: "7" },
                                { label: "Last 30 days", value: "30" },
                                { label: "Last 90 days", value: "90" },
                            ]}
                            value={dateRange}
                            onValueChange={setDateRange}
                            placeholder="Select range"
                            className="bg-card border-border h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CHP Filter</label>
                        <Combobox
                            options={chpOptions}
                            value={chpFilter}
                            onValueChange={setChpFilter}
                            placeholder="Select CHP"
                            className="bg-card border-border h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Risk Level</label>
                        <Combobox
                            options={[
                                { label: "All Risk Levels", value: "all" },
                                { label: "Low Risk", value: "low" },
                                { label: "Medium Risk", value: "medium" },
                                { label: "High Risk", value: "high" },
                            ]}
                            value={riskLevel}
                            onValueChange={setRiskLevel}
                            placeholder="Select Risk"
                            className="bg-card border-border h-11"
                        />
                    </div>
                </div>
            </div>

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

            <Card className="border-none bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-black text-foreground uppercase tracking-tight">Recent Screening Records</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-[100px] font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-6">ID</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Client Name</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">CHP Provider</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Location</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Risk Level</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Score</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Age</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-6">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {screeningsLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-border/20">
                                            <TableCell className="pl-6"><div className="h-4 w-12 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                                            <TableCell><div className="h-4 w-8 bg-muted rounded" /></TableCell>
                                            <TableCell className="pr-6 text-right"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : screeningsData?.results?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                                            No screenings found matching the current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (screeningsData?.results || []).map((screening: any) => (
                                        <TableRow key={screening.id} className="hover:bg-muted/30 border-border/20 transition-colors">
                                            <TableCell className="pl-6 font-mono text-[10px] font-bold text-primary">
                                                <Link href={`/screening-data/${screening.id}`} className="hover:underline">
                                                    #{screening.id.slice(-6).toUpperCase()}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-bold text-foreground">
                                                <Link href={`/user-management/clients/${screening.client?.id}`} className="hover:underline">
                                                    {screening.client?.firstName} {screening.client?.lastName}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium">
                                                <Link href={`/user-management/chps/${screening.provider?.id}`} className="hover:underline">
                                                    {screening.provider?.firstName} {screening.provider?.lastName}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {screening.client?.ward || screening.client?.subcounty || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                                    ${screening.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                        (screening.scoringResult?.interpretation?.includes('MEDIUM') || screening.scoringResult?.interpretation?.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                                            'bg-emerald-500/10 text-emerald-600'
                                                    }
                                                `}>
                                                    {screening.scoringResult?.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-primary text-sm">
                                                {screening.scoringResult?.aggregateScore || 0}
                                            </TableCell>
                                            <TableCell className="font-bold text-muted-foreground">{screening.scoringResult?.clientAge || 'N/A'}</TableCell>
                                            <TableCell className="text-right pr-6 font-medium text-muted-foreground">{dayjs(screening.createdAt).format('MMM D, YYYY')}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DashboardShell>
    )
}
