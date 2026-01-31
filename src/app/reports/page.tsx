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
    ExternalLink
} from "lucide-react"

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

const recentReports = [
    { title: "January 2025 Screening Summary", type: "Screening Summary", date: "2025-01-28", size: "2.4 MB" },
    { title: "Week 4 CHP Performance", type: "CHP Performance", date: "2025-01-27", size: "1.8 MB" },
    { title: "Q4 2024 Compliance Report", type: "Compliance", date: "2025-01-20", size: "3.2 MB" },
]

export default function ReportsPage() {
    return (
        <DashboardShell title="Reports & Export" subtitle="Pearl Hospital">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Reports & Export</h2>
                <p className="text-sm text-gray-500 font-medium">Generate and download comprehensive reports for analysis and compliance.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-700">Generate New Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportTypes.map((type) => (
                                    <div key={type.title} className="p-4 border-2 border-transparent bg-gray-50 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 border bg-white flex items-center justify-center text-gray-600 group-hover:text-emerald-600">
                                                <type.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800 mb-1">{type.title}</h4>
                                                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{type.desc}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {type.schedule}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
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
                                    <label className="text-sm font-bold text-gray-600">Date Range</label>
                                    <Select defaultValue="7">
                                        <SelectTrigger className="h-12 bg-gray-50 border-none">
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
                                    <label className="text-sm font-bold text-gray-600">Format</label>
                                    <Select defaultValue="pdf">
                                        <SelectTrigger className="h-12 bg-gray-50 border-none">
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

                            <Button className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-2">
                                <Paperclip className="h-5 w-5 rotate-45" />
                                Generate Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-700">Recent Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report.title} className="p-4 bg-gray-50 flex items-center justify-between group">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-gray-800 mb-1 line-clamp-1">{report.title}</h4>
                                        <p className="text-[10px] text-gray-500 mb-1">Type: {report.type}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Generated: {report.date}</p>
                                        <p className="text-[10px] text-gray-400">Size: {report.size}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ready</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-bold text-gray-500 mt-2">
                                View All Reports
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-700">Data Export</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-between h-11 border-none text-sm font-bold text-gray-600 group px-4">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export All Screening Data
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-between h-11 border-none text-sm font-bold text-gray-600 group px-4">
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export CHP Performance
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-between h-11 border-none text-sm font-bold text-gray-600 group px-4">
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
