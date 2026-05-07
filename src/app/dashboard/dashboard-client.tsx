"use client"

import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Heart,
    Users,
    Target,
    AlertTriangle,
    BarChart3,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react"
import RecentActivityFeed from "@/components/recent-activity-feed"
import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Badge } from "@/components/ui/badge"

dayjs.extend(relativeTime)

export default function DashboardPage() {
    const { data: dashboardData, isLoading: dashboardLoading } = useApi<any>("/admin/dashboard/summary")
    const { data: alertData } = useApi<any>("/screenings?risk=HIGH_RISK&limit=5&includeForAllProviders=true")

    const stats = [
        {
            title: "Total Screenings",
            value: dashboardData?.stats?.totalScreenings ?? "—",
            sub: "All time",
            icon: Heart,
            color: "text-primary",
            bg: "bg-primary/10",
            ring: "ring-primary/20",
        },
        {
            title: "Active CHPs",
            value: dashboardData?.stats?.activeChps ?? "—",
            sub: "Last 7 days",
            icon: Users,
            color: "text-secondary",
            bg: "bg-secondary/10",
            ring: "ring-secondary/20",
        },
        {
            title: "Total Clients",
            value: dashboardData?.stats?.totalClients ?? "—",
            sub: "Registered",
            icon: BarChart3,
            color: "text-cyan-600",
            bg: "bg-cyan-500/10",
            ring: "ring-cyan-500/20",
        },
        {
            title: "Follow-up Rate",
            value: dashboardData?.stats?.followUpRate ?? "—",
            sub: "Target: 90%",
            icon: Target,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            ring: "ring-amber-500/20",
        },
    ]

    const riskDistribution = dashboardData?.riskDistribution || [
        { name: "Low Risk", value: 0, color: "oklch(0.58 0.15 165)" },
        { name: "Medium Risk", value: 0, color: "oklch(0.72 0.17 80)" },
        { name: "High Risk", value: 0, color: "oklch(0.58 0.22 25)" },
    ]

    const chpPerformance = dashboardData?.chpPerformance || []

    const priorityAlerts = alertData?.results?.map((s: any) => ({
        name: `${s.client.firstName} ${s.client.lastName}`,
        id: s.client.id,
        screeningId: s.id,
    })) || []

    return (
        <DashboardShell title="Dashboard" subtitle="Overview">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl ring-4 ${stat.ring}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
                                {dashboardLoading ? <span className="animate-pulse text-muted-foreground/30">···</span> : stat.value}
                            </p>
                            <p className="text-xs font-semibold text-foreground mt-0.5">{stat.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
                {/* Risk Distribution */}
                <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Risk Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {riskDistribution.map((item: any) => (
                            <div key={item.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-foreground tabular-nums">{item.value}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Priority Alerts */}
                <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            High-Risk Alerts
                            {priorityAlerts.length > 0 && (
                                <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold">
                                    {priorityAlerts.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {priorityAlerts.length > 0 ? (
                            <div className="space-y-2">
                                {priorityAlerts.map((alert: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/15 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">{alert.name}</p>
                                            <p className="text-[10px] text-muted-foreground">Urgent follow-up required</p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-rose-600 border-rose-200 shrink-0">
                                            HIGH
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                                    <Heart className="h-5 w-5 text-emerald-500" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">No priority alerts</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* CHP Performance */}
                <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            CHP Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {chpPerformance.length > 0 ? (
                            chpPerformance.map((chp: any) => (
                                <div key={chp.name} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold shrink-0">
                                        {chp.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">{chp.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {chp.clients} clients · {chp.screenings} screenings
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-primary shrink-0">{chp.performance}</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                <p className="text-xs text-muted-foreground">No performance data yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <RecentActivityFeed limit={5} />
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
