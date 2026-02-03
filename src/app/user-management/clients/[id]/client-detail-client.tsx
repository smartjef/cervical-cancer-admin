"use client"

import { useApi } from "@/hooks/use-api"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, User, Activity, AlertCircle, Phone, ArrowLeft, History } from "lucide-react"
import dayjs from "dayjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { Trash2, AlertCircle as AlertIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ClientDetailClient({ id }: { id: string }) {
    const router = useRouter()
    const { data: client, isLoading: clientLoading } = useApi<any>(`/clients/${id}`)
    const { data: screenings, isLoading: screeningsLoading } = useApi<any>(`/screenings?clientId=${id}`)

    const { toast } = useToast()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await apiRequest(`/clients/${id}`, { method: 'DELETE' })
            setIsDeleteDialogOpen(false)
            toast({
                title: "Client Deleted",
                description: `${client.firstName} ${client.lastName} has been removed.`,
                variant: "success"
            })
            router.push('/user-management')
        } catch (error) {
            console.error("Failed to delete client", error)
            toast({
                title: "Error",
                description: "Failed to delete client record.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (clientLoading) {
        return (
            <DashboardShell title="Client Detail">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardShell>
        )
    }

    if (!client) {
        return (
            <DashboardShell title="Client Detail">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                    <p>Client not found</p>
                </div>
            </DashboardShell>
        )
    }

    const riskInterpretation = client.metadata?.riskInterpretation || "NOT_SCREENED"
    const riskScore = client.metadata?.riskScore || 0

    return (
        <DashboardShell title="Client Detail" subtitle={`${client.firstName} ${client.lastName}`}>
            <div className="mb-6">
                <Link href="/user-management">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Management
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Personal Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center py-4 bg-muted/20 rounded-2xl">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <User className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-foreground">{client.firstName} {client.lastName}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">National ID: {client.nationalId}</p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Risk Status</span>
                                <Badge variant="outline" className={`
                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                    ${riskInterpretation.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                        (riskInterpretation.includes('MEDIUM') || riskInterpretation.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                            riskInterpretation === 'NOT_SCREENED' ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-600'
                                    }
                                `}>
                                    {riskInterpretation.replace('_RISK', '').replace('MODERATE', 'MEDIUM').replace('NOT_SCREENED', 'Not Screened')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Risk Score</span>
                                <span className="text-lg font-black text-primary">{riskScore}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 opacity-60" />
                                {client.phoneNumber}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 opacity-60" />
                                Born {dayjs(client.dateOfBirth).format('MMM D, YYYY')}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 opacity-60" />
                                {client.county}, {client.subcounty}, {client.ward}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Screening History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {screeningsLoading ? (
                                <div className="p-8 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
                                </div>
                            ) : screenings?.results?.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No screenings found for this client.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-6">ID</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Risk Level</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Score</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-6">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {screenings.results.map((screening: any) => (
                                            <TableRow key={screening.id} className="hover:bg-muted/30 border-border/20 transition-colors">
                                                <TableCell className="pl-6 font-mono text-[10px] font-bold text-primary">
                                                    <Link href={`/screening-data/${screening.id}`} className="hover:underline">
                                                        #{screening.id.slice(-6).toUpperCase()}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                                        font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                                        ${screening.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                            (screening.scoringResult?.interpretation?.includes('MEDIUM') || screening.scoringResult?.interpretation?.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-emerald-500/10 text-emerald-600'
                                                        }
                                                    `}>
                                                        {screening.scoringResult?.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-primary text-sm">{screening.scoringResult?.aggregateScore || 0}</TableCell>
                                                <TableCell className="text-right pr-6 font-medium text-muted-foreground">{dayjs(screening.createdAt).format('MMM D, YYYY')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Follow-up & Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">Follow-up records integration coming soon...</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-red-200 bg-red-50/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-red-600 uppercase tracking-wider">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">Deleting this client will permanently remove all their screening records and personal data.</p>
                            <Button variant="destructive" size="sm" className="w-full gap-2 font-bold" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                Delete Patient Record
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Modals */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent className="bg-background border-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Patient Record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete the records for <strong>{client.firstName} {client.lastName}</strong>? This will permanently remove all screening history and personal data. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Delete Record
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </DashboardShell>
    )
}
