"use client"

import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    FileText,
    Download,
    PieChart,
    Users,
    Activity,
    ShieldCheck,
    Calendar,
    Paperclip,
    ExternalLink,
    TrendingUp,
    Target
} from "lucide-react"
import { useMemo } from "react"
import { useApi } from "@/hooks/use-api"
import StatisticsCards from "@/components/statistics-cards"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

const reportTypes = [
    {
        title: "Screening Summary Report",
        desc: "Comprehensive overview of all screening activities",
        icon: Activity,
        schedule: "Monthly",
        lastGenerated: "2025-01-28"
    },
    {
        title: "CHP Performance Report",
        desc: "Individual and comparative CHP performance metrics",
        icon: Users,
        schedule: "Monthly",
        lastGenerated: "2025-01-27"
    },
    {
        title: "Risk Stratification Analysis",
        desc: "AI risk assessment patterns and outcomes",
        icon: PieChart,
        schedule: "Monthly",
        lastGenerated: "2025-01-25"
    },
    {
        title: "Compliance & Quality Report",
        desc: "Regulatory compliance and quality assurance metrics",
        icon: ShieldCheck,
        schedule: "Monthly",
        lastGenerated: "2025-01-20"
    }
]


export default function ReportsPage() {
    const { data: dashboardData, isLoading } = useApi<any>("/admin/dashboard/summary")

    const stats = useMemo(() => {
        if (!dashboardData?.stats) return []
        const { totalScreenings, activeChps, totalClients, referralCompletionRate, followUpRate } = dashboardData.stats

        return [
            { label: "Total Screenings", value: totalScreenings, icon: Activity, description: "All-time screenings", color: "oklch(0.6 0.2 250)" },
            { label: "Active CHPs", value: activeChps, icon: Users, description: "Registered providers", color: "oklch(0.7 0.15 150)" },
            { label: "Referral Rate", value: referralCompletionRate, icon: Target, description: "Compliance rate", color: "oklch(0.6 0.2 30)" },
        ]
    }, [dashboardData])

    const trends = dashboardData?.analytics?.trends || []

    return (
        <DashboardShell title="Reports & Export" subtitle="Pearl Hospital">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-foreground mb-1 tracking-tighter uppercase">Analytics & Reports</h2>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider opacity-70">Deep insights and data management for Pearl Hospital.</p>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="mb-12 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Live Statistics Overview</h3>
                </div>

                <StatisticsCards stats={stats} />

                {/* Trend Chart */}
                <Card className="border-none bg-card shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Screening Trends</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Monthly screening activity overview</CardDescription>
                        </div>
                        <TrendingUp className="h-5 w-5 text-primary opacity-50" />
                    </CardHeader>
                    <CardContent className="h-[300px] w-full p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0 0 / 0.1)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: 'oklch(0.5 0 0)' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '12px',
                                        border: '2px solid oklch(0.9 0 0 / 0.1)',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: 800,
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--primary)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-primary rounded-full opacity-30" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Standardized Reports</h3>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Generate New Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportTypes.map((type) => (
                                    <div key={type.title} className="p-4 border border-border bg-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 border border-border bg-card flex items-center justify-center text-muted-foreground group-hover:text-primary">
                                                <type.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-foreground mb-1">{type.title}</h4>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{type.desc}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {type.schedule}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Paperclip className="h-3 w-3" />
                                                        Last: {type.lastGenerated}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Date Range</label>
                                    <Select defaultValue="7">
                                        <SelectTrigger className="h-12 bg-muted/50 border-none text-foreground">
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">Last 7 days</SelectItem>
                                            <SelectItem value="30">Last 30 days</SelectItem>
                                            <SelectItem value="90">Last 90 days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Format</label>
                                    <Select defaultValue="pdf">
                                        <SelectTrigger className="h-12 bg-muted/50 border-none text-foreground">
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF Report</SelectItem>
                                            <SelectItem value="excel">Excel Sheet</SelectItem>
                                            <SelectItem value="csv">CSV Data</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                                <Paperclip className="h-5 w-5 rotate-45" />
                                Generate Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">

                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Data Export</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-between h-11 border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export All Screening Data
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-between h-11 border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export CHP Performance
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-between h-11 border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export Client Database
                                </div>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
