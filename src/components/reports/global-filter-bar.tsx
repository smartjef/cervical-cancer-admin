/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCcw, Download, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useApi } from "@/hooks/use-api";

export interface FilterState {
  dateRange: string;
  customDateFrom?: string;
  customDateTo?: string;
  chpId: string[];
  facilityId: string;
  referralStatus: string;
  treatmentStatus: string;
  riskLevel: string[];
  search: string;
  county: string;
  subcounty: string;
  ward: string;
}

interface GlobalFilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: "csv" | "pdf") => void;
}

export function GlobalFilterBar({ onFilterChange, onExport }: GlobalFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "30",
    chpId: ["all"],
    facilityId: "all",
    referralStatus: "all",
    treatmentStatus: "all",
    riskLevel: ["all"],
    search: "",
    county: "",
    subcounty: "",
    ward: "",
  });

  const { data: chpsData } = useApi<any>("/chps?limit=100");
  const chps = chpsData?.results || [];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: "chpId" | "riskLevel", value: string) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      if (value === "all") {
        return { ...prev, [key]: ["all"] };
      }
      let next = current.includes(value) ? current.filter((v) => v !== value) : [...current.filter((v) => v !== "all"), value];
      if (next.length === 0) next = ["all"];
      return { ...prev, [key]: next };
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetState: FilterState = {
      dateRange: "30",
      chpId: ["all"],
      facilityId: "all",
      referralStatus: "all",
      treatmentStatus: "all",
      riskLevel: ["all"],
      search: "",
      county: "",
      subcounty: "",
      ward: "",
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  // Trigger initial filter load
  useEffect(() => {
    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card border-b sticky top-0 z-10 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Global Filters
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs font-bold">
            <RefreshCcw className="w-3 h-3 mr-2" /> Reset
          </Button>
          <Button size="sm" onClick={handleApply} className="h-8 text-xs font-bold">
            Apply Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 text-xs font-bold bg-primary text-white hover:bg-primary/90">
                <Download className="w-3 h-3 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")} className="cursor-pointer text-xs">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")} className="cursor-pointer text-xs">
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-row flex-nowrap overflow-x-auto items-center gap-3 pb-2 w-full">
        {/* Search */}
        <div className="min-w-[200px] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client name, phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9 h-9 text-xs font-medium bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="min-w-[140px] flex-shrink-0">
          <Select value={filters.dateRange} onValueChange={(val) => handleFilterChange("dateRange", val)}>
            <SelectTrigger className="h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Ranges if selected */}
        {filters.dateRange === "custom" && (
          <div className="flex gap-2 min-w-[260px] flex-shrink-0">
            <Input
              type="date"
              value={filters.customDateFrom || ""}
              onChange={(e) => handleFilterChange("customDateFrom", e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              type="date"
              value={filters.customDateTo || ""}
              onChange={(e) => handleFilterChange("customDateTo", e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        )}

        {/* CHP Filter */}
        <div className="min-w-[180px] flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-9 justify-between text-xs font-medium bg-background">
                {filters.chpId.includes("all") ? "All CHPs" : `${filters.chpId.length} Selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search CHPs..." className="h-9 text-xs" />
                <CommandList>
                  <CommandEmpty>No CHPs found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => toggleMultiSelect("chpId", "all")}
                      className="text-xs"
                    >
                      <Check className={cn("mr-2 h-4 w-4", filters.chpId.includes("all") ? "opacity-100" : "opacity-0")} />
                      All CHPs
                    </CommandItem>
                    {chps.map((chp: any) => (
                      <CommandItem
                        key={chp.id}
                        onSelect={() => toggleMultiSelect("chpId", chp.id)}
                        className="text-xs"
                      >
                        <Check className={cn("mr-2 h-4 w-4", filters.chpId.includes(chp.id) ? "opacity-100" : "opacity-0")} />
                        {chp.firstName} {chp.lastName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Referral Status */}
        <div className="min-w-[140px] flex-shrink-0">
          <Select value={filters.referralStatus} onValueChange={(val) => handleFilterChange("referralStatus", val)}>
            <SelectTrigger className="h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="Referral Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Referrals</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
              <SelectItem value="not_referred">Not Referred</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Treatment Status */}
        <div className="min-w-[140px] flex-shrink-0">
          <Select value={filters.treatmentStatus} onValueChange={(val) => handleFilterChange("treatmentStatus", val)}>
            <SelectTrigger className="h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="Treatment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Treatments</SelectItem>
              <SelectItem value="TREATED">Treated</SelectItem>
              <SelectItem value="NOT_TREATED">Not Treated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level */}
        <div className="min-w-[180px] flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-9 justify-between text-xs font-medium bg-background">
                {filters.riskLevel.includes("all") ? "All Risks" : `${filters.riskLevel.length} Selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => toggleMultiSelect("riskLevel", "all")} className="text-xs">
                      <Check className={cn("mr-2 h-4 w-4", filters.riskLevel.includes("all") ? "opacity-100" : "opacity-0")} />
                      All Risks
                    </CommandItem>
                    <CommandItem onSelect={() => toggleMultiSelect("riskLevel", "LOW_RISK")} className="text-xs">
                      <Check className={cn("mr-2 h-4 w-4", filters.riskLevel.includes("LOW_RISK") ? "opacity-100" : "opacity-0")} />
                      Low Risk
                    </CommandItem>
                    <CommandItem onSelect={() => toggleMultiSelect("riskLevel", "MODERATE_RISK")} className="text-xs">
                      <Check className={cn("mr-2 h-4 w-4", filters.riskLevel.includes("MODERATE_RISK") ? "opacity-100" : "opacity-0")} />
                      Medium Risk
                    </CommandItem>
                    <CommandItem onSelect={() => toggleMultiSelect("riskLevel", "HIGH_RISK")} className="text-xs">
                      <Check className={cn("mr-2 h-4 w-4", filters.riskLevel.includes("HIGH_RISK") ? "opacity-100" : "opacity-0")} />
                      High Risk
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
