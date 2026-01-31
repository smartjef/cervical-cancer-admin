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
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        title: "Active CHPs",
        value: "2/2",
        change: "Active in last 7 days",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
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
    { text: "Jane Wanjiku completed screening for Mary Njeri", time: "2 hours ago", color: "bg-emerald-500" },
    { text: "High-risk client referral generated", time: "4 hours ago", color: "bg-amber-500" },
    { text: "New CHP training session scheduled", time: "1 day ago", color: "bg-blue-500" },
]

import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function DashboardPage() {
    const { data: activityData, isLoading: activitiesLoading } = useApi<any>("/activities")
    const { data: screeningData, isLoading: screeningsLoading } = useApi<any>("/screenings")

    const recentActivities = activityData?.data?.map((activity: any) => ({
        text: activity.description || `Activity by ${activity.user?.name || 'User'}`,
        time: dayjs(activity.createdAt).fromNow(),
        color: activity.type === 'error' ? 'bg-red-500' : activity.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
    })) || recentActivity

    const totalScreenings = screeningData?.total || 456

    return (
        <DashboardShell title="Analytics Dashboard" subtitle="Pearl Hospital">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-4xl font-bold text-gray-800">
                                    {stat.title === "Total Screenings" ? totalScreenings : stat.value}
                                </span>
                                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-gray-700 font-semibold mb-1">{stat.title}</p>
                            <p className="text-xs text-gray-500 font-medium">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card className="border-none h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-700">Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            {riskDistribution.map((item) => (
                                <div key={item.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Priority Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3.5 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-r-md">
                            <p className="text-sm font-bold">High Risk</p>
                            <p className="text-xs mt-0.5">Urgent follow-up required for Patient ID #8845</p>
                        </div>
                        <div className="p-3.5 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-md">
                            <p className="text-sm font-bold">Moderate Risk</p>
                            <p className="text-xs mt-0.5">Screening referral pending for 3 clients</p>
                        </div>
                        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 rounded-r-md">
                            <p className="text-sm font-bold">System Alert</p>
                            <p className="text-xs mt-0.5">Quarterly report generation is available</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-700">CHP Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {chpPerformance.map((chp) => (
                            <div key={chp.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                        {chp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{chp.name}</p>
                                        <p className="text-xs text-gray-500">{chp.subcounty}</p>
                                        <div className="flex gap-3 mt-1.5">
                                            <span className="text-[10px] text-gray-400"><span className="font-bold text-gray-600">{chp.clients}</span> clients</span>
                                            <span className="text-[10px] text-gray-400"><span className="font-bold text-gray-600">{chp.screenings}</span> screenings</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">{chp.performance}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Performance</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-700">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {activitiesLoading ? (
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
                        ) : (
                            recentActivities.slice(0, 5).map((activity: any, i: number) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0 mt-1.5`}></div>
                                        {i !== recentActivities.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1"></div>}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-medium text-gray-700">{activity.text}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
