"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/combobox";
import { useApi } from "@/hooks/use-api";
import { apiRequest } from "@/lib/api";
import { DataTable } from "@/components/data-table";
import { exportToCSV } from "@/lib/export-utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Search,
  Download,
  Plus,
  Building2,
  Filter,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FacilityForm from "@/components/facility-form";
import { useToast } from "@/hooks/use-toast";

export default function FacilitiesClient() {
  const { toast } = useToast();

  // Filter States
  const [search, setSearch] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [subcountyFilter, setSubcountyFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // DataTable States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Location Search States
  const [countySearch, setCountySearch] = useState("");
  const [subcountySearch, setSubcountySearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  // Debounced Search States
  const [debouncedCountySearch, setDebouncedCountySearch] = useState("");
  const [debouncedSubcountySearch, setDebouncedSubcountySearch] = useState("");
  const [debouncedWardSearch, setDebouncedWardSearch] = useState("");

  // Simple Debounce Effects
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCountySearch(countySearch), 300);
    return () => clearTimeout(timer);
  }, [countySearch]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSubcountySearch(subcountySearch),
      300,
    );
    return () => clearTimeout(timer);
  }, [subcountySearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWardSearch(wardSearch), 300);
    return () => clearTimeout(timer);
  }, [wardSearch]);

  // Fetch Facility Types
  const { data: typesData } = useApi<any>("/health-facility-types");

  // Fetch Locations Hierarchically (Generic AddressHierarchy API)
  const { data: countiesData, isLoading: isCountiesLoading } = useApi<any>(
    `/address-hierarchy?level=1&pageSize=50${debouncedCountySearch ? `&search=${debouncedCountySearch}` : ""}`,
  );
  const { data: subcountiesData, isLoading: isSubcountiesLoading } =
    useApi<any>(
      countyFilter !== "all"
        ? `/address-hierarchy?level=2&parentId=${countyFilter}&pageSize=50${debouncedSubcountySearch ? `&search=${debouncedSubcountySearch}` : ""}`
        : null,
    );
  const { data: wardsData, isLoading: isWardsLoading } = useApi<any>(
    subcountyFilter !== "all"
      ? `/address-hierarchy?level=3&parentId=${subcountyFilter}&pageSize=100${debouncedWardSearch ? `&search=${debouncedWardSearch}` : ""}`
      : null,
  );

  // Facility Type Options
  const typeOptions = useMemo(() => {
    const options = [{ label: "All Types", value: "all" }];
    if (typesData?.results) {
      typesData.results.forEach((t: any) => {
        options.push({ label: t.name, value: t.id });
      });
    }
    return options;
  }, [typesData]);

  // Location Options (Map ID as value for hierarchy, but keep Name as label)
  const countyOptions = useMemo(() => {
    const results = countiesData?.results || [];
    const mapped = results.map((c: any) => ({
      label: c.name,
      value: c.id,
    }));
    return [{ label: "All Counties", value: "all" }, ...mapped];
  }, [countiesData]);

  const subcountyOptions = useMemo(() => {
    const results = subcountiesData?.results || [];
    const mapped = results.map((s: any) => ({
      label: s.name,
      value: s.id,
    }));
    return [{ label: "All Subcounties", value: "all" }, ...mapped];
  }, [subcountiesData]);

  const wardOptions = useMemo(() => {
    const results = wardsData?.results || [];
    const mapped = results.map((w: any) => ({
      label: w.name,
      value: w.id,
    }));
    return [{ label: "All Wards", value: "all" }, ...mapped];
  }, [wardsData]);

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
    };

    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder.toUpperCase();

    // Resolve IDs back to names for HealthFacility query
    if (countyFilter !== "all") {
      const county = countyOptions.find((o) => o.value === countyFilter);
      if (county) params.county = county.label;
    }
    if (subcountyFilter !== "all") {
      const subcounty = subcountyOptions.find(
        (o) => o.value === subcountyFilter,
      );
      if (subcounty) params.subcounty = subcounty.label;
    }
    if (wardFilter !== "all") {
      const ward = wardOptions.find((o) => o.value === wardFilter);
      if (ward) params.ward = ward.label;
    }
    if (typeFilter !== "all") params.typeId = typeFilter;

    return new URLSearchParams(params).toString();
  }, [
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    countyFilter,
    subcountyFilter,
    wardFilter,
    typeFilter,
    countyOptions,
    subcountyOptions,
    wardOptions,
  ]);

  // Fetch Facilities
  const {
    data: facilitiesData,
    isLoading,
    refetch,
  } = useApi<any>(`/health-facilities?${queryParams}`);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  // Handle Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportParams = new URLSearchParams(queryParams);
      exportParams.delete("page");
      exportParams.delete("limit");
      exportParams.set("exportAll", "true");

      const res = await apiRequest(`/health-facilities?${exportParams.toString()}`);
      const results = res?.results || [];
      if (!results.length) return;

      const exportData = results.map((item: any) => ({
      Name: item.name,
      Code: item.kmflCode,
      Type: item.type?.name || "N/A",
      County: item.county,
      Subcounty: item.subcounty,
      Ward: item.ward || "N/A",
      Owner: item.owner || "N/A",
      Phone: item.phoneNumber || "N/A",
      Email: item.email || "N/A",
    }));

    exportToCSV(exportData, "facilities-export", [
      { key: "Name", label: "Facility Name" },
      { key: "Code", label: "KMFL Code" },
      { key: "Type", label: "Type" },
      { key: "County", label: "County" },
      { key: "Subcounty", label: "Subcounty" },
      { key: "Ward", label: "Ward" },
      { key: "Owner", label: "Owner" },
      { key: "Phone", label: "Phone" },
      { key: "Email", label: "Email" },
    ]);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardShell
      title="Health Facilities"
      subtitle="Manage registered health facilities"
    >
      <DataTable
        columns={[
          {
            header: "Facility Name",
            accessorKey: "name",
            cell: (item: any) => (
              <div className="flex flex-col">
                <Link
                  href={`/facilities/${item.id}`}
                  className="font-bold text-foreground hover:underline flex items-center gap-2"
                >
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  {item.name}
                </Link>
                <span className="text-[10px] text-muted-foreground">
                  {item.owner || "Unknown Owner"}
                </span>
              </div>
            ),
            sortable: true,
          },
          {
            header: "KMFL Code",
            accessorKey: "kmflCode",
            cell: (item: any) => (
              <div className="font-mono text-xs font-bold text-primary">
                {item.kmflCode}
              </div>
            ),
            sortable: true,
          },
          {
            header: "Type",
            accessorKey: "type.name",
            cell: (item: any) => (
              <Badge
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary font-bold text-[10px] uppercase"
              >
                {item.type?.name || "N/A"}
              </Badge>
            ),
            sortable: true,
          },
          {
            header: "Location",
            accessorKey: "county",
            cell: (item: any) => (
              <div className="flex flex-col">
                <span className="text-xs font-bold">{item.county}</span>
                <span className="text-[10px] text-muted-foreground">
                  {item.subcounty}, {item.ward}
                </span>
              </div>
            ),
            sortable: true,
          },
          {
            header: "Contact",
            accessorKey: "phoneNumber",
            cell: (item: any) => (
              <div className="flex flex-col">
                <span className="text-xs">{item.phoneNumber || "-"}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                  {item.email || "-"}
                </span>
              </div>
            ),
            sortable: false,
          },
        ]}
        data={facilitiesData?.results || []}
        isLoading={isLoading}
        totalCount={facilitiesData?.totalCount || 0}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        controls={
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            {/* Search Area */}
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search by name, code..."
                className="h-11 pl-9 font-bold border-2 w-full transition-all focus:border-primary/50"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 px-4 gap-2 border-2 font-bold text-[10px] uppercase tracking-wider bg-background hover:bg-muted/50 transition-colors"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                    {(typeFilter !== "all" ||
                      countyFilter !== "all" ||
                      subcountyFilter !== "all" ||
                      wardFilter !== "all") && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 min-w-[20px] px-1 font-black bg-primary text-primary-foreground"
                      >
                        {
                          [
                            typeFilter,
                            countyFilter,
                            subcountyFilter,
                            wardFilter,
                          ].filter((f) => f !== "all").length
                        }
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-5 space-y-5" align="end">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Filter className="h-3 w-3" />
                      Filter Facilities
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive gap-1"
                      onClick={() => {
                        setTypeFilter("all");
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Facility Type
                      </Label>
                      <Combobox
                        options={typeOptions}
                        value={typeFilter}
                        onValueChange={(val) => {
                          setTypeFilter(val);
                          setPage(1);
                        }}
                        placeholder="Select Type"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        County
                      </Label>
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
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Subcounty
                        </Label>
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

                    {countyFilter !== "all" && subcountyFilter !== "all" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Ward
                        </Label>
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
                disabled={isExporting}
                className="h-11 px-4 gap-2 bg-background font-bold text-[10px] uppercase tracking-wider shrink-0 border-2 hover:bg-muted/50 transition-colors"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 px-6 gap-2 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <PlusCircle className="h-4 w-4" />
                    Add Facility
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-background">
                  <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        Register New Facility
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                    <FacilityForm
                      onSuccess={() => {
                        setIsCreateOpen(false);
                        refetch();
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />
    </DashboardShell>
  );
}
