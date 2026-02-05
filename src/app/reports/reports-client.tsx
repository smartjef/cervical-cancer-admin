"use client"

import React, { useMemo, useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"
import { exportToCSV } from "@/lib/export-utils"
import StatisticsCards from "@/components/statistics-cards"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const reportTypes = [
    {
        id: "screening_summary",
        title: "Screening Summary Report",
        desc: "Comprehensive overview of all screening activities",
        icon: Activity,
    },
    {
        id: "chp_performance",
        title: "CHP Performance Report",
        desc: "Individual and comparative CHP performance metrics",
        icon: Users,
    },
    {
        id: "client_report",
        title: "Client Report",
        desc: "Detailed demographic and registration data for all clients",
        icon: Users,
    },
    {
        id: "compliance_quality",
        title: "Referral Report",
        desc: "Track referral status and appointment adherence",
        icon: ShieldCheck,
    }
]


export default function ReportsPage() {
    const [selectedType, setSelectedType] = useState("screening_summary")
    const [isGenerating, setIsGenerating] = useState(false)
    const [dateRange, setDateRange] = useState("7")
    const [format, setFormat] = useState("pdf") // pdf, excel, csv
    const { toast } = useToast()
    const { data: dashboardData, isLoading: isDashboardLoading } = useApi<any>("/admin/dashboard/summary")

    const handleGenerateReport = async () => {
        setIsGenerating(true)
        try {
            let endpoint = ""
            let filename = ""
            let columns: { key: string; label: string }[] = []

            const dateTo = dayjs().toISOString()
            const dateFrom = dayjs().subtract(parseInt(dateRange), 'day').toISOString()
            const queryParams = `?screeningDateFrom=${dateFrom}&screeningDateTo=${dateTo}&limit=1000`

            switch (selectedType) {
                case "screening_summary":
                    endpoint = `/screenings${queryParams}`
                    filename = `screening-summary-${dayjs().format("YYYY-MM-DD")}`
                    columns = [
                        { key: format === 'pdf' ? "idShort" : "id", label: "SCREENING ID" },
                        { key: "clientName", label: "CLIENT NAME" },
                        { key: "providerName", label: "PROVIDER" },
                        { key: "location", label: "LOCATION" },
                        { key: "riskLevel", label: "RISK LEVEL" },
                        { key: "score", label: "SCORE" },
                        { key: "age", label: "AGE" },
                        { key: "createdAt", label: "DATE" }
                    ]
                    break
                case "client_report":
                    endpoint = `/clients${queryParams}`
                    filename = `client-database-${dayjs().format("YYYY-MM-DD")}`
                    columns = [
                        { key: "fullName", label: "Name" },
                        { key: "phoneNumber", label: "Phone" },
                        { key: "nationalId", label: "National ID" },
                        { key: "locationInfo", label: "Location" },
                        { key: "createdAt", label: "Registration Date" }
                    ]
                    break
                case "chp_performance":
                    endpoint = `/admin/dashboard/chp-performance${queryParams}`
                    filename = `chp-performance-${dayjs().format("YYYY-MM-DD")}`
                    columns = [
                        { key: "name", label: "Name" },
                        { key: "email", label: "Email" },
                        { key: "totalClients", label: "Total Clients" },
                        { key: "totalScreening", label: "Total Screenings" },
                        { key: "followUpRate", label: "Follow-up Rate" },
                        { key: "overallPerformance", label: "Overall Perf." }
                    ]
                    break
                case "compliance_quality":
                    endpoint = `/referrals${queryParams}`
                    filename = `referral-report-${dayjs().format("YYYY-MM-DD")}`
                    columns = [
                        { key: format === 'pdf' ? "idShort" : "id", label: "ID" },
                        { key: "clientName", label: "Client" },
                        { key: "healthFacility.name", label: "Facility" },
                        { key: "appointmentTime", label: "Appt Date" },
                        { key: "status", label: "Status" },
                        { key: "riskInfo", label: "Risk (Score, Lv)" }
                    ]
                    break
                default:
                    toast({ title: "Coming Soon", description: "This report type is currently under development.", variant: "default" })
                    setIsGenerating(false)
                    return
            }

            const response = await apiRequest(endpoint)
            const data = response.results || response || []
            const finalDataRaw = Array.isArray(data) ? data : (data.results || [])

            if (finalDataRaw.length === 0) {
                toast({ title: "No Data", description: "No records found for the selected criteria.", variant: "destructive" })
                return
            }

            // Data Transformation
            const finalData = finalDataRaw.map((item: any) => {
                const mapped: any = { ...item }

                if (selectedType === "compliance_quality") {
                    mapped.idShort = (item.id || '').substring(0, 5).toUpperCase()
                    mapped.clientName = item.screening?.client ? `${item.screening.client.firstName} ${item.screening.client.lastName}` : 'N/A'
                    const res = item.screening?.scoringResult || {}
                    mapped.riskInfo = `${res.score || 0} (${res.interpretation || 'N/A'})`
                    mapped.appointmentTime = item.appointmentTime ? dayjs(item.appointmentTime).format("YYYY-MM-DD HH:mm") : 'N/A'
                }

                if (selectedType === "client_report") {
                    mapped.fullName = `${item.firstName} ${item.lastName}`
                    mapped.locationInfo = `${item.county}, ${item.subcounty}`
                    mapped.createdAt = dayjs(item.createdAt).format("YYYY-MM-DD")
                }

                if (selectedType === "screening_summary") {
                    mapped.idShort = (item.id || '').substring(0, 5).toUpperCase()
                    mapped.clientName = item.client ? `${item.client.firstName} ${item.client.lastName}` : 'N/A'
                    mapped.providerName = item.provider ? `${item.provider.firstName} ${item.provider.lastName}` : 'N/A'
                    mapped.location = item.client ? `${item.client.subcounty}` : 'N/A'
                    mapped.riskLevel = item.scoringResult?.interpretation || 'N/A'
                    mapped.score = item.scoringResult?.aggregateScore || 0
                    mapped.age = item.scoringResult?.clientAge || 'N/A'
                    mapped.createdAt = dayjs(item.createdAt).format("MMM D, YYYY")
                }

                return mapped
            })

            if (format === "csv" || format === "excel") {
                exportToCSV(finalData, filename, columns)
            } else if (format === "pdf") {
                const doc = new jsPDF()

                // Professional Header Setup
                const addHeader = (doc: jsPDF) => {
                    doc.setFillColor(248, 250, 252) // slate-50
                    doc.rect(0, 0, 210, 40, 'F')

                    // Logo integration
                    try {
                        doc.addImage('/logo.jpeg', 'JPEG', 14, 8, 24, 24)
                    } catch (e) {
                        console.error("Logo failed to load", e)
                    }

                    doc.setFontSize(24)
                    doc.setTextColor(0, 150, 160) // Primary color
                    doc.setFont("helvetica", "bold")
                    doc.text("SCREEN-IT", 42, 22)

                    doc.setFontSize(10)
                    doc.setTextColor(100, 116, 139) // slate-500
                    doc.setFont("helvetica", "normal")
                    doc.text("CERVICAL CANCER SCREENING PROGRAM", 42, 28)

                    doc.setTextColor(30, 41, 59) // slate-800
                    doc.setFont("helvetica", "bold")
                    doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 38)

                    // Generation Metadata
                    doc.setFontSize(8)
                    doc.setFont("helvetica", "normal")
                    doc.text(`DATE GENERATED: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 150, 15)
                    doc.text(`REPORT PERIOD: LAST ${dateRange} DAYS`, 150, 20)
                }

                const tableData = finalData.map((row: any) => {
                    return columns.map(col => {
                        const val = col.key.split('.').reduce((o, i) => (o ? o[i] : ''), row)
                        return val || '-'
                    })
                })

                autoTable(doc, {
                    head: [columns.map(c => c.label)],
                    body: tableData,
                    startY: 45,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [0, 120, 130],
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 8,
                        textColor: 51
                    },
                    alternateRowStyles: {
                        fillColor: [249, 250, 251]
                    },
                    margin: { top: 45, bottom: 20 },
                    didDrawPage: (data) => {
                        // Header only on first page? No, professional reports usually have it or at least a title
                        // But startY handles it for the first page.
                        if (data.pageNumber === 1) {
                            addHeader(doc)
                        }

                        // Footer with pagination
                        const str = "Page " + data.pageNumber + " of " + (doc as any).internal.getNumberOfPages()
                        doc.setFontSize(8)
                        doc.setTextColor(100, 116, 139)
                        const pageSize = doc.internal.pageSize
                        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
                        doc.text(str, data.settings.margin.left, pageHeight - 10)
                        doc.text(`© ${dayjs().format('YYYY')} SCREEN-IT - CONFIDENTIAL MEDICAL DATA`, (pageSize.width / 2) - 40, pageHeight - 10)
                    }
                })

                doc.save(`${filename}.pdf`)
            }

            toast({ title: "Success", description: `${filename}.${format === 'pdf' ? 'pdf' : 'csv'} has been generated.`, variant: "success" })
        } catch (error) {
            console.error("Report generation failed", error)
            toast({ title: "Error", description: "Failed to generate report. Please try again.", variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

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
        <DashboardShell title="Reports" subtitle="SCREEN-IT Comprehensive Reporting System">
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
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={cn(
                                            "p-4 border-2 transition-all cursor-pointer group relative",
                                            selectedType === type.id
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5"
                                        )}
                                    >
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "w-10 h-10 border flex items-center justify-center transition-colors",
                                                selectedType === type.id
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-card text-muted-foreground border-border group-hover:text-primary"
                                            )}>
                                                <type.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <h4 className="text-sm font-bold text-foreground mb-1">{type.title}</h4>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">{type.desc}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "absolute top-4 right-4 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                            selectedType === type.id ? "border-primary" : "border-muted-foreground/30"
                                        )}>
                                            {selectedType === type.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Date Range</label>
                                    <Select value={dateRange} onValueChange={setDateRange}>
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
                                    <Select value={format} onValueChange={setFormat}>
                                        <SelectTrigger className="h-12 bg-muted/50 border-none text-foreground">
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF Report</SelectItem>
                                            <SelectItem value="csv">CSV Data</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                disabled={isGenerating}
                                onClick={handleGenerateReport}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Paperclip className="h-5 w-5 rotate-45" />
                                )}
                                {isGenerating ? "Generating..." : "Generate Report"}
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
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedType("screening_summary")
                                    handleGenerateReport()
                                }}
                                className="w-full justify-between h-11 border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export All Screening Data
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedType("chp_performance")
                                    handleGenerateReport()
                                }}
                                className="h-11 justify-between w-full border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    Export CHP Performance
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Clients export logic
                                    const triggerClientsExport = async () => {
                                        setIsGenerating(true)
                                        try {
                                            const res = await apiRequest("/clients?limit=1000")
                                            const data = res.results || []
                                            exportToCSV(data, `clients-db-${dayjs().format("YYYY-MM-DD")}`, [
                                                { key: "firstName", label: "First Name" },
                                                { key: "lastName", label: "Last Name" },
                                                { key: "phoneNumber", label: "Phone" },
                                                { key: "nationalId", label: "National ID" },
                                                { key: "createdAt", label: "Joined" }
                                            ])
                                            toast({ title: "Success", description: "Clients database exported.", variant: "success" })
                                        } catch (e) {
                                            toast({ title: "Error", description: "Export failed", variant: "destructive" })
                                        } finally {
                                            setIsGenerating(false)
                                        }
                                    }
                                    triggerClientsExport()
                                }}
                                className="w-full justify-between h-11 border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground group px-4"
                            >
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
