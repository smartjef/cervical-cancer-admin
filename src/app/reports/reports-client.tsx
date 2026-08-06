/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { GlobalFilterBar, FilterState } from "@/components/reports/global-filter-bar";
import { ReportSummaryBar } from "@/components/reports/report-summary-bar";
import { EnterpriseTable } from "@/components/reports/enterprise-table";
import { ExpandedScreeningRow } from "@/components/reports/expanded-screening-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/hooks/use-api";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Target, AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { exportToCSV } from "@/lib/export-utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Helper for exporting
async function fetchAllRecords(baseEndpoint: string): Promise<any[]> {
  const sep = baseEndpoint.includes("?") ? "&" : "?";
  const response = await apiRequest(`${baseEndpoint}${sep}exportAll=true`);
  const results = response?.results ?? (Array.isArray(response) ? response : []);
  return results;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialTab = searchParams.get("tab") || "screenings";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filters, setFilters] = useState<FilterState | null>(null);

  // Sync tab with URL
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  // Pagination
  const [screeningPagination, setScreeningPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [chpPagination, setChpPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  // Build query string from filters
  const buildQueryParams = (pagination: PaginationState) => {
    if (!filters) return "";
    const params = new URLSearchParams();
    
    // Pagination
    params.append("page", (pagination.pageIndex + 1).toString());
    params.append("limit", pagination.pageSize.toString());

    // Date Range
    if (filters.dateRange === "custom" && filters.customDateFrom && filters.customDateTo) {
      params.append("screeningDateFrom", dayjs(filters.customDateFrom).startOf("day").toISOString());
      params.append("screeningDateTo", dayjs(filters.customDateTo).endOf("day").toISOString());
    } else if (filters.dateRange !== "custom" && filters.dateRange !== "all") {
      let fromDate = dayjs().startOf("day");
      let toDate = dayjs().endOf("day");
      
      if (filters.dateRange === "today") {
        fromDate = dayjs().startOf("day");
      } else if (filters.dateRange === "yesterday") {
        fromDate = dayjs().subtract(1, "day").startOf("day");
        toDate = dayjs().subtract(1, "day").endOf("day");
      } else if (filters.dateRange === "this_month") {
        fromDate = dayjs().startOf("month");
      } else if (filters.dateRange === "last_month") {
        fromDate = dayjs().subtract(1, "month").startOf("month");
        toDate = dayjs().subtract(1, "month").endOf("month");
      } else {
        fromDate = dayjs().subtract(parseInt(filters.dateRange), "day").startOf("day");
      }
      
      params.append("screeningDateFrom", fromDate.toISOString());
      params.append("screeningDateTo", toDate.toISOString());
    }

    if (filters.chpId && filters.chpId.length > 0 && !filters.chpId.includes("all")) params.append("providerId", filters.chpId.join(","));
    if (filters.facilityId && filters.facilityId !== "all") params.append("facilityId", filters.facilityId);
    if (filters.referralStatus && filters.referralStatus !== "all") {
      if (filters.referralStatus === "referred" || filters.referralStatus === "not_referred") {
         params.append("isReferred", filters.referralStatus === "referred" ? "true" : "false");
      } else {
         params.append("referralStatus", filters.referralStatus);
      }
    }
    if (filters.treatmentStatus && filters.treatmentStatus !== "all") params.append("treatmentStatus", filters.treatmentStatus);
    if (filters.riskLevel && filters.riskLevel.length > 0 && !filters.riskLevel.includes("all")) params.append("risk", filters.riskLevel.join(","));
    if (filters.search) params.append("search", filters.search);
    if (filters.county) params.append("county", filters.county);
    if (filters.subcounty) params.append("subcounty", filters.subcounty);
    if (filters.ward) params.append("ward", filters.ward);

    return `?${params.toString()}`;
  };

  // API Calls
  const screeningsUrl = filters ? `/screenings${buildQueryParams(screeningPagination)}` : null;
  const { data: screeningsData, isLoading: isLoadingScreenings } = useApi<any>(screeningsUrl);

  const chpUrl = filters ? `/admin/dashboard/chp-performance${buildQueryParams(chpPagination)}` : null;
  const { data: chpData, isLoading: isLoadingChp } = useApi<any>(chpUrl);

  const dashboardUrl = filters ? `/admin/dashboard/summary${buildQueryParams({ pageIndex: 0, pageSize: 1 })}` : null;
  const { data: dashboardData } = useApi<any>(dashboardUrl);

  // Columns for Screenings
  const screeningColumns: ColumnDef<any, any>[] = useMemo(() => [
    {
      id: "client",
      accessorFn: (row) => `${row.client?.firstName} ${row.client?.lastName}`,
      header: "Client",
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    },
    {
      id: "age",
      accessorFn: (row) => row.scoringResult?.clientAge,
      header: "Age",
    },
    {
      id: "gender",
      accessorFn: () => "Female",
      header: "Gender",
    },
    {
      id: "location",
      accessorFn: (row) => `${row.client?.ward || ""}, ${row.client?.subcounty || ""}`,
      header: "Location",
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    },
    {
      id: "screeningDate",
      accessorFn: (row) => dayjs(row.createdAt).format("MMM D, YYYY h:mm A"),
      header: "Screening Date",
    },
    {
      id: "chp",
      accessorFn: (row) => `${row.provider?.firstName} ${row.provider?.lastName}`,
      header: "CHP",
    },
    {
      id: "chpPhone",
      accessorFn: (row) => row.provider?.phoneNumber || "N/A",
      header: "CHP Phone",
      cell: (info) => <span className="text-muted-foreground">{info.getValue() as string}</span>,
    },
    {
      id: "riskLevel",
      accessorFn: (row) => row.scoringResult?.interpretation || "N/A",
      header: "Risk Level",
      cell: (info) => {
        const val = info.getValue() as string;
        let color = "bg-muted text-muted-foreground";
        if (val.includes("HIGH") || val.includes("CRITICAL")) color = "bg-destructive text-destructive-foreground";
        if (val.includes("MODERATE")) color = "bg-orange-500 text-white";
        if (val.includes("LOW")) color = "bg-emerald-500 text-white";
        return <Badge className={color}>{val.replace(/_/g, " ")}</Badge>;
      }
    },
    {
      id: "score",
      accessorFn: (row) => row.scoringResult?.aggregateScore || 0,
      header: "Score",
      cell: (info) => <span className="font-black text-primary">{info.getValue()}</span>,
    },
    {
      id: "referredTo",
      accessorFn: (row) => row.referrals?.map((r: any) => r.healthFacility?.name).join("; ") || "None",
      header: "Referred To",
      cell: (info) => <span className="text-xs">{info.getValue() as string}</span>,
    },
    {
      id: "referralTime",
      accessorFn: (row) => row.referrals?.map((r: any) => dayjs(r.createdAt).format("YYYY-MM-DD HH:mm")).join("; ") || "N/A",
      header: "Referral Time",
      cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue() as string}</span>,
    },
    {
      id: "tests",
      accessorFn: (row) => row.referrals?.map((r: any) => r.tests?.map((t: any) => t.testType?.replace(/_/g, " ")).join(", ") || "None").join("; ") || "N/A",
      header: "Tests",
      cell: (info) => <span className="text-xs font-medium">{info.getValue() as string}</span>,
    },
    {
      id: "testResults",
      accessorFn: (row) => row.referrals?.map((r: any) => r.tests?.map((t: any) => t.testResult?.replace(/_/g, " ")).join(", ") || "None").join("; ") || "N/A",
      header: "Test Results",
      cell: (info) => {
        const val = info.getValue() as string;
        return <span className={`text-xs ${val.includes("POSITIVE") ? "text-destructive font-bold" : ""}`}>{val}</span>;
      }
    },
    {
      id: "treatment",
      accessorFn: (row) => row.referrals?.map((r: any) => r.tests?.map((t: any) => t.actionTaken?.replace(/_/g, " ") || "Pending").join(", ") || "None").join("; ") || "N/A",
      header: "Treatment",
      cell: (info) => {
        const val = info.getValue() as string;
        return <span className={`text-xs ${val.includes("TREATED") ? "text-emerald-500 font-bold" : ""}`}>{val}</span>;
      }
    },
    {
      id: "testTime",
      accessorFn: (row) => row.referrals?.map((r: any) => r.tests?.map((t: any) => dayjs(t.createdAt).format("YYYY-MM-DD HH:mm")).join(", ") || "None").join("; ") || "N/A",
      header: "Test Time",
      cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue() as string}</span>,
    }
  ], []);

  // Columns for CHP Performance
  const chpColumns: ColumnDef<any, any>[] = useMemo(() => [
    {
      id: "name",
      accessorKey: "name",
      header: "CHP Name",
      cell: (info) => <span className="font-bold">{info.getValue() as string}</span>,
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "totalScreening",
      accessorKey: "totalScreening",
      header: "Total Screenings",
      cell: (info) => <span className="font-black">{info.getValue() as number}</span>,
    },
    {
      id: "followUpRate",
      accessorKey: "followUpRate",
      header: "Follow-up Rate",
    },
    {
      id: "overallPerformance",
      accessorKey: "overallPerformance",
      header: "Performance",
      cell: (info) => {
        const val = info.getValue() as number;
        return <span className={`font-bold ${val > 80 ? "text-emerald-500" : val > 50 ? "text-orange-500" : "text-destructive"}`}>{val}%</span>;
      }
    },
  ], []);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (!dashboardData?.stats) return [];
    return [
      { label: "Total Screenings", value: dashboardData.stats.totalScreenings || 0, icon: Activity, colorClass: "text-blue-500" },
      { label: "Total Clients", value: dashboardData.stats.totalClients || 0, icon: Users, colorClass: "text-emerald-500" },
      { label: "High Risk", value: dashboardData.stats.highRiskCount || 0, icon: AlertTriangle, colorClass: "text-orange-500" },
      { label: "Referred", value: dashboardData.stats.referredCount || 0, icon: Target, colorClass: "text-purple-500" },
      { label: "Treated", value: dashboardData.stats.treatedCount || 0, icon: CheckCircle, colorClass: "text-emerald-500" },
      { label: "Pending Treatment", value: dashboardData.stats.pendingTreatmentCount || 0, icon: Clock, colorClass: "text-yellow-500" },
      { label: "Referral Rate", value: `${dashboardData.stats.referralCompletionRate || 0}%`, icon: Target, colorClass: "text-blue-500" },
    ];
  }, [dashboardData]);

  // Export Logic
  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const endpoint = activeTab === "screenings" ? `/screenings${buildQueryParams({ pageIndex: 0, pageSize: 1 })}` : `/admin/dashboard/chp-performance${buildQueryParams({ pageIndex: 0, pageSize: 1 })}`;
      const data = await fetchAllRecords(endpoint);
      
      if (data.length === 0) {
        toast({ title: "No Data", description: "No records found.", variant: "destructive" });
        return;
      }

      let headers: string[] = [];
      let rows: any[] = [];
      let filename = "";

      if (activeTab === "screenings") {
        const mappedData = data.map((item) => ({
          Client: `${item.client?.firstName} ${item.client?.lastName}`,
          Age: item.scoringResult?.clientAge,
          Gender: "Female",
          Location: `${item.client?.ward}, ${item.client?.subcounty}`,
          Date: dayjs(item.createdAt).format("YYYY-MM-DD HH:mm"),
          CHP: `${item.provider?.firstName} ${item.provider?.lastName}`,
          "CHP Phone": item.provider?.phoneNumber || "N/A",
          Risk: item.scoringResult?.interpretation,
          Score: item.scoringResult?.aggregateScore,
          "Referred To": item.referrals?.map((r: any) => r.healthFacility?.name).join("; ") || "None",
          "Referral Time": item.referrals?.map((r: any) => dayjs(r.createdAt).format("YYYY-MM-DD HH:mm")).join("; ") || "N/A",
          "Tests": item.referrals?.map((r: any) => r.tests?.map((t: any) => t.testType?.replace(/_/g, " ")).join(", ") || "None").join("; ") || "N/A",
          "Test Results": item.referrals?.map((r: any) => r.tests?.map((t: any) => t.testResult?.replace(/_/g, " ")).join(", ") || "None").join("; ") || "N/A",
          "Treatment": item.referrals?.map((r: any) => r.tests?.map((t: any) => t.actionTaken?.replace(/_/g, " ") || "Pending").join(", ") || "None").join("; ") || "N/A",
          "Test Time": item.referrals?.map((r: any) => r.tests?.map((t: any) => dayjs(t.createdAt).format("YYYY-MM-DD HH:mm")).join(", ") || "None").join("; ") || "N/A",
        }));
        headers = Object.keys(mappedData[0] || {});
        rows = mappedData.map(obj => Object.values(obj));
        filename = `screening-report-${dayjs().format("YYYY-MM-DD")}`;
        
        if (format === "csv") {
          exportToCSV(mappedData, filename, headers.map(k => ({ key: k, label: k })));
        }
      } else {
        headers = ["Name", "Email", "Screenings", "Performance"];
        rows = data.map(item => [item.name, item.email, item.totalScreening, item.overallPerformance]);
        filename = `chp-report-${dayjs().format("YYYY-MM-DD")}`;
        
        if (format === "csv") {
          exportToCSV(data, filename, [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "totalScreening", label: "Screenings" },
            { key: "overallPerformance", label: "Performance" }
          ]);
        }
      }

      if (format === "pdf") {
        const doc = new jsPDF("landscape");
        doc.text(activeTab === "screenings" ? "Screening Report" : "CHP Performance Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${dayjs().format("YYYY-MM-DD HH:mm")}`, 14, 22);
        
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 28,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
        
        doc.save(`${filename}.pdf`);
      }

      toast({ title: "Export Successful", variant: "success" });
    } catch (e) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  return (
    <DashboardShell title="Reports" subtitle="Enterprise Reporting Center">
      <div className="flex flex-col h-[calc(100vh-100px)]">
        
        {/* Global Filter Bar */}
        <div className="mb-4">
          <GlobalFilterBar onFilterChange={setFilters} onExport={handleExport} />
        </div>

        {/* Tabs and Data */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="screenings" className="text-xs font-bold uppercase tracking-wider">Screening Reports</TabsTrigger>
              <TabsTrigger value="chp_performance" className="text-xs font-bold uppercase tracking-wider">CHP Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="screenings" className="flex-1 flex flex-col min-h-0 m-0 space-y-4">
            <ReportSummaryBar metrics={summaryMetrics} />
            <div className="flex-1 overflow-auto bg-card border rounded-md shadow-sm p-4">
              <EnterpriseTable 
                columns={screeningColumns} 
                data={screeningsData?.results || []}
                pageCount={screeningsData?.totalPages || 1}
                pagination={screeningPagination}
                onPaginationChange={setScreeningPagination}
                isLoading={isLoadingScreenings}
                getRowCanExpand={() => true}
                renderSubComponent={({ row }: { row: any }) => <ExpandedScreeningRow row={row} />}
              />
            </div>
          </TabsContent>

          <TabsContent value="chp_performance" className="flex-1 flex flex-col min-h-0 m-0">
            <div className="flex-1 overflow-auto bg-card border rounded-md shadow-sm p-4">
              <EnterpriseTable 
                columns={chpColumns} 
                data={Array.isArray(chpData) ? chpData : chpData?.results || []}
                pageCount={Array.isArray(chpData) ? 1 : chpData?.totalPages || 1}
                pagination={chpPagination}
                onPaginationChange={setChpPagination}
                isLoading={isLoadingChp}
              />
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardShell>
  );
}
