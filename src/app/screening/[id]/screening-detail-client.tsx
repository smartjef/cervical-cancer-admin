"use client";

import { useApi } from "@/hooks/use-api";
import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  MapPin,
  User,
  Activity,
  AlertCircle,
  Phone,
  ArrowLeft,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ScreeningLocationMap = dynamic(() => import("@/components/screening-location-map"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-xl bg-muted/30 animate-pulse" />
});

export default function ScreeningDetailClient({ id }: { id: string }) {
  const { data: screening, isLoading } = useApi<any>(`/screenings/${id}`);

  if (isLoading) {
    return (
      <DashboardShell title="Screening Detail">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  if (!screening) {
    return (
      <DashboardShell title="Screening Detail">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
          <p>Screening not found</p>
        </div>
      </DashboardShell>
    );
  }

  const interpretation = screening.scoringResult?.interpretation || "N/A";
  const score = screening.scoringResult?.aggregateScore || 0;

  return (
    <DashboardShell
      title="Screening Detail"
      subtitle={`ID: #${id.slice(-6).toUpperCase()}`}
    >
      <div className="mb-6">
        <Link href="/screening">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Screenings
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none bg-card ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                Screening Information
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                <Calendar className="h-3 w-3" />
                {dayjs(screening.createdAt).format("MMMM D, YYYY")}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Risk Level
                  </p>
                  <Badge
                    variant="outline"
                    className={` font-bold border-none px-3 py-1 rounded-full text-xs uppercase tracking-wider ${interpretation.includes("HIGH") ? "bg-rose-500/10 text-rose-600" : interpretation.includes("MEDIUM") || interpretation.includes("MODERATE") ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}
                  >
                    {interpretation
                      .replace("_RISK", "")
                      .replace("MODERATE", "MEDIUM")}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Aggregate Score
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {score}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    First Intercourse
                  </p>
                  <p className="text-sm font-medium">
                    {screening.firstIntercourseAge} years
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Lifetime Partners
                  </p>
                  <p className="text-sm font-medium">
                    {screening.lifeTimePatners}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Total Births
                  </p>
                  <p className="text-sm font-medium">
                    {screening.totalBirths}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    HIV Status
                  </p>
                  <p className="text-sm font-medium">
                    {screening.everDiagnosedWithHIV}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    HPV History
                  </p>
                  <p className="text-sm font-medium">
                    {screening.everDiagnosedWithHPV}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    STI History
                  </p>
                  <p className="text-sm font-medium">
                    {screening.everDiagnosedWithSTI}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Family History
                  </p>
                  <p className="text-sm font-medium">
                    {screening.familyMemberDiagnosedWithCervicalCancer}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Smoking
                  </p>
                  <p className="text-sm font-medium capitalize">
                    {screening.smoking?.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Contraceptives
                  </p>
                  <p className="text-sm font-medium">
                    {screening.usedOralContraceptivesForMoreThan5Years === "YES"
                      ? "> 5 years"
                      : "No long-term use"}
                  </p>
                </div>
              </div>

              {screening.scoringResult?.breakdown && (
                <div className="pt-6 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Risk Factor Breakdown
                  </p>
                  <div className="space-y-3">
                    {screening.scoringResult.breakdown.map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">
                              {item.factor.split("_").join(" ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground lowercase">
                              {item.reason}
                            </span>
                          </div>
                          <span className={`font-black ${item.score > 0 ? "text-primary" : "text-muted-foreground"}`}>
                            +{item.score}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-transparent shadow-none overflow-hidden h-[400px]">
            <CardContent className="p-0 h-full">
              <ScreeningLocationMap 
                latitude={screening.coordinates?.latitude} 
                longitude={screening.coordinates?.longitude} 
                clientName={`${screening.client?.firstName} ${screening.client?.lastName}`}
              />
            </CardContent>
          </Card>

          <Card className="border-none bg-card ">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/users/clients/${screening.client?.id}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
                    {screening.client?.firstName} {screening.client?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {screening.client?.nationalId || "N/A"}
                  </p>
                </div>
              </Link>
              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 opacity-60" />
                  {screening.client?.phoneNumber}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 opacity-60" />
                  {screening.client?.subcounty}, {screening.client?.ward}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card ">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/users/${screening.provider?.userId}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-secondary transition-colors underline-offset-4 group-hover:underline">
                    {screening.provider?.firstName} {screening.provider?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CHP Provider
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <FollowUpsSection screeningId={id} />
          <ReferralsSection screeningId={id} />
        </div>
      </div>
    </DashboardShell>
  );
}

function FollowUpsSection({ screeningId }: { screeningId: string }) {
  const { data, isLoading } = useApi<any>(`/follow-up?triggerScreeningId=${screeningId}`);
  const followUps = data?.results || [];

  if (isLoading)
    return (
      <div className="h-20 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  if (followUps.length === 0) return null;

  return (
    <Card className="border-none bg-card ">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Related Follow-ups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followUps.map((fu: any) => (
            <div
              key={fu.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    {fu.category?.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Due {dayjs(fu.dueDate).format("MMM D, YYYY")}
                  </span>
                </div>
                <p className="text-sm font-bold">
                  Status:{" "}
                  <span
                    className={
                      fu.completedAt
                        ? "text-emerald-600"
                        : fu.canceledAt
                          ? "text-rose-600"
                          : "text-amber-600"
                    }
                  >
                    {fu.completedAt
                      ? "Completed"
                      : fu.canceledAt
                        ? "Canceled"
                        : "Pending"}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-primary/10 hover:text-primary"
              >
                <Link href={`/follow-ups/${fu.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralsSection({ screeningId }: { screeningId: string }) {
  const { data, isLoading } = useApi<any>(`/referrals?screeningId=${screeningId}`);
  const referrals = data?.results || [];

  if (isLoading)
    return (
      <div className="h-20 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  if (referrals.length === 0) return null;

  return (
    <Card className="border-none bg-card ">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" /> Related Referrals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referrals.map((ref: any) => (
            <div
              key={ref.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    Referral
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Appt: {dayjs(ref.appointmentTime).format("MMM D, YYYY")}
                  </span>
                </div>
                <p className="text-sm font-bold">
                  Status:{" "}
                  <span
                    className={
                      ref.status === "COMPLETED"
                        ? "text-emerald-600"
                        : ref.status === "REFUSED"
                          ? "text-rose-600"
                          : "text-amber-600"
                    }
                  >
                    {ref.status}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-secondary/10 hover:text-secondary"
              >
                <Link href={`/referrals/${ref.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
