"use client"

import { useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/combobox"
import {
    Download,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Activity
} from "lucide-react"

const stats = [
    {
        title: "Total Screenings",
        value: "456",
        change: "+12% from last month",
        icon: Activity,
        color: "text-primary",
    },
    {
        title: "Referral Completion",
        value: "92%",
        change: "Target: 95%",
        icon: AlertTriangle,
        color: "text-amber-500",
    },
    {
        title: "This Month",
        value: "89",
        change: "Target: 100 screenings",
        icon: TrendingUp,
        color: "text-secondary",
    },
    {
        title: "Follow-up Rate",
        value: "87%",
        change: "Target: 90%",
        icon: CheckCircle2,
        color: "text-primary",
    },
]

export default function ScreeningDataPage() {
    const [dateRange, setDateRange] = useState("30")
    const [chpFilter, setChpFilter] = useState("all")
    const [riskLevel, setRiskLevel] = useState("all")

    return (
        <DashboardShell title="Screening Analytics" subtitle="Pearl Hospital">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Range</label>
                        <Combobox
                            options={[
                                { label: "Last 7 days", value: "7" },
                                { label: "Last 30 days", value: "30" },
                                { label: "Last 90 days", value: "90" },
                            ]}
                            value={dateRange}
                            onValueChange={setDateRange}
                            placeholder="Select range"
                            className="bg-card border-border"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CHP Filter</label>
                        <Combobox
                            options={[
                                { label: "All CHPs", value: "all" },
                                { label: "Jane Wanjiku", value: "jane" },
                                { label: "Peter Ochieng", value: "peter" },
                            ]}
                            value={chpFilter}
                            onValueChange={setChpFilter}
                            placeholder="Select CHP"
                            className="bg-card border-border"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Risk Level</label>
                        <Combobox
                            options={[
                                { label: "All Risk Levels", value: "all" },
                                { label: "Low Risk", value: "low" },
                                { label: "Moderate Risk", value: "moderate" },
                                { label: "High Risk", value: "high" },
                            ]}
                            value={riskLevel}
                            onValueChange={setRiskLevel}
                            placeholder="Select Risk"
                            className="bg-card border-border"
                        />
                    </div>
                </div>
                <div className="flex items-end">
                    <Button variant="outline" className="h-11 border-border bg-card text-foreground gap-2 font-bold px-6">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none bg-card shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <p className="text-sm font-bold text-foreground mb-1">{stat.title}</p>
                            <p className="text-xs text-muted-foreground font-medium">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none mb-8 bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground">Screening Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center bg-muted/30 m-6 mt-0 border border-dashed text-muted-foreground font-medium">
                    <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chart Visualization (Recharts Trendline)</p>
                        <p className="text-xs mt-1">Data points for Jan - Sep 2025</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { month: "May", target: 60, value: 58 },
                    { month: "Jun", target: 60, value: 67 },
                    { month: "Jul", target: 70, value: 73 },
                    { month: "Aug", target: 80, value: 89 }
                ].map((item) => (
                    <Card key={item.month} className="border-none text-center bg-card shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-2xl font-bold text-foreground mb-2">{item.value}</p>
                            <p className="text-sm font-bold text-muted-foreground">{item.month}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">Target: {item.target}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DashboardShell>
    )
}
