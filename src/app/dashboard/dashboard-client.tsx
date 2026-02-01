"use client"

import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Heart,
    Users,
    Calendar,
    Target,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    BarChart3
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

const stats = [
    {
        title: "Total Screenings",
        value: "456",
        change: "+12% from last month",
        icon: Heart,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Active CHPs",
        value: "2/2",
        change: "Active in last 7 days",
        icon: Users,
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
    {
        title: "This Month",
        value: "89",
        change: "Target: 100 screenings",
        icon: BarChart3,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
    },
    {
        title: "Follow-up Rate",
        value: "87%",
        change: "Target: 90%",
        icon: Target,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
]

const riskDistribution = [
    { name: "Low Risk", value: 65, color: "oklch(0.5 0.1 190)" },
    { name: "Moderate Risk", value: 25, color: "oklch(0.7 0.15 80)" },
    { name: "High Risk", value: 10, color: "oklch(0.6 0.2 25)" },
]

const chpPerformance = [
    { name: "Jane Wanjiku", subcounty: "Kibera Sub-county", performance: "92%", clients: 45, screenings: 23 },
    { name: "Peter Ochieng", subcounty: "Mathare Sub-county", performance: "88%", clients: 38, screenings: 19 },
]

const recentActivity = [
    { text: "Jane Wanjiku completed screening for Mary Njeri", time: "2 hours ago", color: "bg-primary" },
    { text: "High-risk client referral generated", time: "4 hours ago", color: "bg-amber-500" },
    { text: "New CHP training session scheduled", time: "1 day ago", color: "bg-secondary" },
]

import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function DashboardPage() {
    const { data: dashboardData, isLoading: dashboardLoading } = useApi<any>("/admin/dashboard/summary")
    const { data: activityData, isLoading: activityLoading } = useApi<any>("/activities?limit=5")
    const { data: alertData, isLoading: alertLoading } = useApi<any>("/screenings?risk=HIGH_RISK&limit=3&includeForAllProviders=true")

    const stats = [
        {
            title: "Total Screenings",
            value: dashboardData?.stats?.totalScreenings || "0",
            change: "+12% from last month",
            icon: Heart,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            title: "Active CHPs",
            value: `${dashboardData?.stats?.activeChps || 0}`,
            change: "Active in last 7 days",
            icon: Users,
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
        {
            title: "Total Clients",
            value: `${dashboardData?.stats?.totalClients || 0}`,
            change: "Target: 100 screenings",
            icon: BarChart3,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
        },
        {
            title: "Follow-up Rate",
            value: dashboardData?.stats?.followUpRate || "0%",
            change: "Target: 90%",
            icon: Target,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ]

    const riskDistribution = dashboardData?.riskDistribution || [
        { name: "Low Risk", value: 0, color: "oklch(0.5 0.1 190)" },
        { name: "Moderate Risk", value: 0, color: "oklch(0.7 0.15 80)" },
        { name: "High Risk", value: 0, color: "oklch(0.6 0.2 25)" },
    ]

    const chpPerformance = dashboardData?.chpPerformance || []

    const recentActivities = activityData?.results?.map((activity: any) => ({
        text: activity.description,
        time: dayjs(activity.createdAt).fromNow(),
        color: activity.type === 'error' ? 'bg-red-500' : 'bg-primary'
    })) || []

    const priorityAlerts = alertData?.results?.map((s: any) => ({
        title: 'High Risk',
        message: `Urgent follow-up required for ${s.client.firstName} ${s.client.lastName} (ID: ${s.client.id})`,
        type: 'high',
    })) || []

    return (
        <DashboardShell title="Analytics Dashboard" subtitle="Pearl Hospital">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none transition-shadow bg-card shadow-sm hover:shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-4xl font-bold text-foreground">
                                    {stat.value}
                                </span>
                                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-foreground font-semibold mb-1">{stat.title}</p>
                            <p className="text-xs text-muted-foreground font-medium">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card className="border-none h-full bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground">Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            {riskDistribution.map((item: any) => (
                                <div key={item.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none h-full bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Priority Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {priorityAlerts.length > 0 ? (
                            priorityAlerts.map((alert: any, i: number) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`flex-1 p-4 ${alert.type === 'high' ? 'bg-red-500/10 border-red-500' : 'bg-primary/10 border-primary'} border-l-4 rounded-none transition-colors`}>
                                        <h4 className={`text-xs font-bold ${alert.type === 'high' ? 'text-red-500' : 'text-primary'} mb-1`}>{alert.title}</h4>
                                        <p className={`text-[10px] ${alert.type === 'high' ? 'text-red-500/80' : 'text-primary/80'} font-medium`}>{alert.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg">
                                <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-xs text-muted-foreground font-medium">No priority alerts at this time</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none h-full bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground">CHP Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {chpPerformance.length > 0 ? (
                            chpPerformance.map((chp: any) => (
                                <div key={chp.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                            {chp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{chp.name}</p>
                                            <p className="text-xs text-muted-foreground">{chp.subcounty || "Unassigned"}</p>
                                            <div className="flex gap-3 mt-1.5">
                                                <span className="text-[10px] text-muted-foreground/60"><span className="font-bold text-muted-foreground">{chp.clients}</span> clients</span>
                                                <span className="text-[10px] text-muted-foreground/60"><span className="font-bold text-muted-foreground">{chp.screenings}</span> screenings</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-primary">{chp.performance}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Performance</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No CHP performance data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none h-full bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {dashboardLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-200 w-3/4"></div>
                                            <div className="h-2 bg-gray-100 w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.slice(0, 5).map((activity: any, i: number) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0 mt-1.5`}></div>
                                        {i !== recentActivities.length - 1 && <div className="w-0.5 h-full bg-muted my-1"></div>}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-medium text-foreground">{activity.text}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Calendar className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">No recent activity recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
