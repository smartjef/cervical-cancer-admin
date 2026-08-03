"use client";

import React from "react";
import { Users, Activity, Target, AlertTriangle, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetric {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  colorClass?: string;
}

interface ReportSummaryBarProps {
  metrics: SummaryMetric[];
}

export function ReportSummaryBar({ metrics }: ReportSummaryBarProps) {
  return (
    <div className="bg-card border rounded-md shadow-sm divide-y md:divide-y-0 md:divide-x grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 overflow-hidden">
      {metrics.map((metric, index) => (
        <div key={index} className="p-3 flex flex-col items-start justify-center hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 mb-1 w-full text-muted-foreground">
            <metric.icon className={cn("w-3.5 h-3.5", metric.colorClass)} />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">{metric.label}</span>
          </div>
          <span className="text-base font-black tracking-tight text-foreground">{metric.value}</span>
        </div>
      ))}
    </div>
  );
}
