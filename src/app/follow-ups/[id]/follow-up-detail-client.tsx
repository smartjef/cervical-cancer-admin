"use client"

import { useRouter } from "next/navigation"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Activity,
    FileText,
    History,
    ClipboardCheck,
    Stethoscope
} from "lucide-react"
import dayjs from "dayjs"
import Link from "next/link"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

interface FollowUpDetailClientProps {
    id: string
}

export default function FollowUpDetailClient({ id }: FollowUpDetailClientProps) {
    const router = useRouter()

    // Fetch Follow-up Details
    const { data: followUp, isLoading } = useApi<any>(`/follow-up/${id}?includeRelations=true`)

    if (isLoading) {
        return (
            <DashboardShell title="Loading Follow-up..." subtitle="Please wait while we fetch the details">
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
        )
    }

    if (!followUp) {
        return (
            <DashboardShell title="Follow-up Not Found" subtitle="The requested follow-up could not be located">
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <h2 className="text-xl font-bold">Follow-up not found</h2>
                    <Button onClick={() => router.push('/follow-ups')}>Return to Follow-ups</Button>
                </div>
            </DashboardShell>
        )
    }

    const isCompleted = !!followUp.completedAt;
    const isOverdue = !isCompleted && dayjs(followUp.dueDate).isBefore(dayjs());
    const isCancelled = followUp.status === 'CANCELLED' || !!followUp.cancelledAt;

    return (
        <DashboardShell title="Follow-up Details" subtitle={`Viewing details for follow-up #${followUp.id.slice(-6).toUpperCase()}`}>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        Follow-up Details
                        <span className="font-mono text-lg text-muted-foreground">#{followUp.id.slice(-6).toUpperCase()}</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Priority & Status Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none bg-card shadow-sm sticky top-6">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center
                                    ${followUp.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                                        followUp.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-sky-500/10 text-sky-600'}
                                `}>
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className={`
                                        font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                        ${followUp.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                                            followUp.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-sky-500/10 text-sky-600'}
                                    `}>
                                        {followUp.priority} Priority
                                    </Badge>
                                    <Badge variant="outline" className={`
                                        font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                        ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' :
                                            isOverdue ? 'bg-rose-500/10 text-rose-600' :
                                                isCancelled ? 'bg-slate-500/10 text-slate-600' :
                                                    'bg-amber-500/10 text-amber-600'}
                                    `}>
                                        {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : isCancelled ? 'Cancelled' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-xs font-bold uppercase text-muted-foreground">Follow-up Category</CardTitle>
                            <div className="text-lg font-bold leading-tight uppercase tracking-tight">
                                {followUp.category?.replace(/_/g, " ") || "No Category"}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Link href={`/user-management/clients/${followUp.clientId}`} className="flex items-center gap-3 text-sm group p-2 -mx-2 hover:bg-muted/50 rounded-lg transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Patient</span>
                                        <span className="font-medium group-hover:underline">{followUp.client?.firstName} {followUp.client?.lastName}</span>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3 text-sm px-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Due Date</span>
                                        <span className={`font-medium ${isOverdue ? 'text-rose-600' : ''}`}>{dayjs(followUp.dueDate).format("MMM D, YYYY")}</span>
                                        <span className="text-[10px] text-muted-foreground">{dayjs(followUp.dueDate).fromNow()}</span>
                                    </div>
                                </div>

                                {followUp.completedAt && (
                                    <div className="flex items-center gap-3 text-sm px-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-emerald-600 uppercase">Completed At</span>
                                            <span className="font-medium">{dayjs(followUp.completedAt).format("MMM D, YYYY")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isCompleted && !isCancelled && (
                                <div className="pt-4 border-t border-border/50">
                                    <Button className="w-full font-bold uppercase tracking-wider text-xs" size="sm">
                                        Mark as Completed
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details, Related Records, Outcome */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Follow-up Details */}
                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-primary" />
                                Follow-up Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Started On</h4>
                                    <p className="font-medium text-sm">{followUp.startDate ? dayjs(followUp.startDate).format("MMM D, YYYY, h:mm A") : "Not started"}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Provider</h4>
                                    <p className="font-medium text-sm">
                                        {followUp.provider ? `${followUp.provider.firstName} ${followUp.provider.lastName}` : "System Assigned"}
                                    </p>
                                </div>
                                <div className="col-span-full space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Outcome Notes</h4>
                                    <div className="p-4 bg-muted/30 rounded-lg min-h-[80px]">
                                        {followUp.outcomeNotes ? (
                                            <p className="text-sm text-foreground">{followUp.outcomeNotes}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No outcome notes recorded yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Records */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-primary" />
                                    Trigger Screening
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold">Screening #{followUp.triggerScreeningId?.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-muted-foreground">{dayjs(followUp.triggerScreening?.createdAt).format("MMM D, YYYY")}</p>
                                        <Badge variant="outline" className={`
                                            mt-2 font-bold border-none px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider
                                            ${followUp.triggerScreening?.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-emerald-500/10 text-emerald-600'}
                                        `}>
                                            {followUp.triggerScreening?.scoringResult?.interpretation?.replace('_RISK', '') || 'N/A'}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs uppercase">
                                        <Link href={`/screening/${followUp.triggerScreeningId}`}>View</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Associated Referral
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {followUp.referralId ? (
                                    <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">Referral #{followUp.referralId.slice(-6).toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">{dayjs(followUp.referral?.createdAt).format("MMM D, YYYY")}</p>
                                            <Badge variant="outline" className="mt-2 font-bold bg-amber-500/10 text-amber-600 border-none px-2 py-0.5 rounded-full text-[9px] uppercase">
                                                {followUp.referral?.status || 'PENDING'}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs uppercase">
                                            <Link href={`/referrals/${followUp.referralId}`}>View</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-muted/10 rounded-lg border border-dashed border-border flex items-center justify-center min-h-[92px]">
                                        <p className="text-xs text-muted-foreground italic">No referral associated with this follow-up.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline / History */}
                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <History className="h-4 w-4 text-primary" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                                <div className="relative flex items-center gap-6 group">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">{dayjs(followUp.createdAt).format("MMM D, YYYY, h:mm A")}</span>
                                        <span className="text-sm font-bold">Follow-up Created</span>
                                    </div>
                                </div>

                                {followUp.startDate && (
                                    <div className="relative flex items-center gap-6 group">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-4 ring-background">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">{dayjs(followUp.startDate).format("MMM D, YYYY, h:mm A")}</span>
                                            <span className="text-sm font-bold">Follow-up Started</span>
                                        </div>
                                    </div>
                                )}

                                {isCompleted && (
                                    <div className="relative flex items-center gap-6 group">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-4 ring-background">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">{dayjs(followUp.completedAt).format("MMM D, YYYY, h:mm A")}</span>
                                            <span className="text-sm font-bold">Follow-up Completed</span>
                                        </div>
                                    </div>
                                )}

                                {isCancelled && (
                                    <div className="relative flex items-center gap-6 group">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 ring-4 ring-background">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">{dayjs(followUp.cancelledAt || followUp.updatedAt).format("MMM D, YYYY, h:mm A")}</span>
                                            <span className="text-sm font-bold">Follow-up Cancelled</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
