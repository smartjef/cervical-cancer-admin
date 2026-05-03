"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/hooks/use-api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  StickyNote,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";

interface ReferralDetailClientProps {
  id: string;
}

export default function ReferralDetailClient({
  id,
}: ReferralDetailClientProps) {
  const router = useRouter();
  
  // Fetch Referral Details
  const { data: referral, isLoading } = useApi<any>(`/referrals/${id}`);

  if (isLoading) {
    return (
      <DashboardShell title="Referral Details">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-[400px] animate-pulse bg-muted/20" />
          </div>
          <div className="lg:col-span-3">
            <Card className="h-[600px] animate-pulse bg-muted/20" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!referral) {
    return (
      <DashboardShell title="Referral Details">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <h2 className="text-xl font-bold">Referral not found</h2>
          <Button onClick={() => router.push("/referrals")}>
            Return to Referrals
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Referral Details">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            Referral Details
            <span className="font-mono text-lg text-muted-foreground">
              #{referral.id.slice(-6).toUpperCase()}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none bg-card sticky top-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${referral.status === "PENDING" ? "bg-amber-500/10 text-amber-600" : referral.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className={` font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${referral.status === "PENDING" ? "bg-amber-500/10 text-amber-600" : referral.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                >
                  {referral.status}
                </Badge>
              </div>
              <CardTitle className="mt-4 text-xs font-bold uppercase text-muted-foreground">
                Referred To
              </CardTitle>
              {referral.healthFacilityId ? (
                <Link
                  href={`/facilities/${referral.healthFacilityId}`}
                  className="text-lg font-bold hover:underline line-clamp-2"
                >
                  {referral.healthFacility?.name || "Unknown Facility"}
                </Link>
              ) : (
                <span className="text-lg font-bold line-clamp-2 italic opacity-50">
                  {referral.healthFacility?.name || "Unknown Facility"}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Link
                  href={`/users/clients/${referral.screening?.clientId}`}
                  className="flex items-center gap-3 text-sm group p-2 -mx-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Patient
                    </span>
                    <span className="font-medium group-hover:underline">
                      {referral.screening?.client?.firstName} {referral.screening?.client?.lastName}
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-3 text-sm px-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Appointment Date
                    </span>
                    <span className="font-medium">
                      {dayjs(referral.appointmentTime).format("MMM D, YYYY")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm px-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Appointment Time
                    </span>
                    <span className="font-medium">
                      {dayjs(referral.appointmentTime).format("h:mm A")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  Support Needs
                </div>
                <div className="flex flex-wrap gap-2">
                  {referral.transportNeeded ? (
                    <Badge
                      variant="secondary"
                      className="bg-sky-500/10 text-sky-600 border-none"
                    >
                      Transport Required
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground opacity-50"
                    >
                      No Transport
                    </Badge>
                  )}
                  {referral.financialSupport ? (
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-600 border-none"
                    >
                      Financial Support
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground opacity-50"
                    >
                      No Financial Support
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none bg-card ">
            <CardHeader>
              <CardTitle>Referral Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase">
                    Referral Notes
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg min-h-[80px]">
                    {referral.additionalNotes ? (
                      <p className="text-sm text-foreground">
                        {referral.additionalNotes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No additional notes provided.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase">
                    Related Screening
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        Screening #{referral.screening?.id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(referral.screening?.createdAt).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Link href={`/screening/${referral.screeningId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {referral.status === "COMPLETED" && (
            <Card className="border-none bg-card border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" /> Outcome Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">
                      Visited Date
                    </h4>
                    <p className="font-bold">
                      {referral.visitedDate
                        ? dayjs(referral.visitedDate).format("MMM D, YYYY")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">
                      Test Result
                    </h4>
                    <Badge variant="outline" className="font-bold">
                      {referral.testResult || "N/A"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">
                      Final Diagnosis
                    </h4>
                    <p className="font-medium">
                      {referral.finalDiagnosis || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">
                    Outcome Notes
                  </h4>
                  <p className="text-sm">
                    {referral.outcomeNotes || "No outcome notes recorded."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {referral.followUp && referral.followUp.outreachActions?.length > 0 && (
            <Card className="border-none bg-card ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Outreach History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {referral.followUp.outreachActions.map(
                    (action: any, index: number) => (
                      <div
                        key={action.id}
                        className="relative pl-6 pb-6 last:pb-0 border-l border-border/50 last:border-l-0"
                      >
                        <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider"
                              >
                                {action.actionType?.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {dayjs(action.actionDate).format("MMM D, YYYY • h:mm A")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-foreground mt-1">
                              Outcome:{" "}
                              <span className="text-primary">
                                {action.outcome?.replace("_", " ")}
                              </span>
                            </p>
                            {action.notes && (
                              <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                                {action.notes}
                              </p>
                            )}
                            {action.barriers && (
                              <div className="flex items-start gap-2 mt-2">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-rose-600 font-medium">
                                  Barrier: {action.barriers}
                                </p>
                              </div>
                            )}
                          </div>
                          {action.nextPlannedDate && (
                            <div className="shrink-0 text-right">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                                Next Planned
                              </span>
                              <span className="text-xs font-bold text-foreground">
                                {dayjs(action.nextPlannedDate).format("MMM D, YYYY")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
