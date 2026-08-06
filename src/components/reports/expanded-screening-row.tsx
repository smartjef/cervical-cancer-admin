/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Activity, User, Phone, MapPin, Calendar, FileText, Clock } from "lucide-react";

interface ExpandedScreeningRowProps {
  row: any;
}

export function ExpandedScreeningRow({ row }: ExpandedScreeningRowProps) {
  const data = row.original;
  
  return (
    <div className="p-4 bg-muted/10 border-t space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patient Information */}
        <Card className="shadow-none border-border/50 bg-background/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
              <User className="w-4 h-4" /> Patient Information
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">{data.client?.firstName} {data.client?.lastName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="w-3 h-3" /> {data.client?.phoneNumber || "N/A"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2"><MapPin className="w-3 h-3" /> {data.client?.ward}, {data.client?.subcounty}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> {data.scoringResult?.clientAge} Years Old</p>
            </div>
          </CardContent>
        </Card>

        {/* Screening Details */}
        <Card className="shadow-none border-border/50 bg-background/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
              <Activity className="w-4 h-4" /> Screening Details
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Screening Date</span>
                <span className="font-bold">{dayjs(data.createdAt).format("MMM D, YYYY")}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-bold">{data.provider?.firstName} {data.provider?.lastName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge variant="outline" className="text-[10px]">{data.scoringResult?.interpretation || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Score</span>
                <span className="font-black text-primary">{data.scoringResult?.aggregateScore || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses & Medical History */}
        <Card className="shadow-none border-border/50 bg-background/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
              <FileText className="w-4 h-4" /> Medical History
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">HIV Diagnosed</span>
                <span className="font-bold">{data.everDiagnosedWithHIV}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">HPV Diagnosed</span>
                <span className="font-bold">{data.everDiagnosedWithHPV}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lifetime Partners</span>
                <span className="font-bold">{data.lifeTimePatners}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Smoking</span>
                <span className="font-bold">{data.smoking}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals & Treatments */}
        <Card className="shadow-none border-border/50 bg-background/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
              <Clock className="w-4 h-4" /> Referral & Treatment Timeline
            </div>
            <div className="space-y-3">
              {data.referrals && data.referrals.length > 0 ? (
                data.referrals.map((ref: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-3 relative">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />
                    <p className="text-[10px] font-bold text-muted-foreground">{dayjs(ref.createdAt).format("MMM D, YYYY h:mm A")}</p>
                    <p className="text-xs font-semibold">Referred to {ref.healthFacility?.name}</p>
                    <Badge variant="secondary" className="mt-1 text-[9px]">{ref.status}</Badge>
                    
                    {ref.tests && ref.tests.map((test: any, j: number) => (
                      <div key={j} className="mt-3 text-xs bg-background/50 p-2 rounded border border-border/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{test.testType?.replace(/_/g, " ") || "Unknown Test"}</span>
                          <span className="text-[10px] text-muted-foreground">{dayjs(test.createdAt).format("MMM D, YYYY h:mm A")}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Result:</span>
                            <span className="font-semibold">{test.testResult?.replace(/_/g, " ") || "Pending"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Action Taken:</span>
                            <span className="font-semibold">{test.actionTaken?.replace(/_/g, " ") || "Pending"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">No referral records.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
