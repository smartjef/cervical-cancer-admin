"use client"

import { useApi } from "@/hooks/use-api"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Loader2, Calendar, MapPin, User, AlertCircle, Phone, ArrowLeft,
    Trash2, Edit, Activity as ActivityIcon
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"

export default function ClientDetailClient({ id }: { id: string }) {
    const router = useRouter()
    const { data: client, isLoading: clientLoading, refetch: refetchClient } = useApi<any>(`/clients/${id}`)

    const { toast } = useToast()

    // State management
    const [activeTab, setActiveTab] = useState("screenings")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Edit form state
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        county: '',
        subcounty: '',
        ward: ''
    })

    // Tab data states
    const [screeningsData, setScreeningsData] = useState<any>(null)
    const [screeningsLoading, setScreeningsLoading] = useState(false)
    const [referralsData, setReferralsData] = useState<any>(null)
    const [referralsLoading, setReferralsLoading] = useState(false)
    const [followupsData, setFollowupsData] = useState<any>(null)
    const [followupsLoading, setFollowupsLoading] = useState(false)

    // Pagination states for each tab
    const [screeningsPage, setScreeningsPage] = useState(1)
    const [screeningsLimit, setScreeningsLimit] = useState(10)
    const [referralsPage, setReferralsPage] = useState(1)
    const [referralsLimit, setReferralsLimit] = useState(10)
    const [followupsPage, setFollowupsPage] = useState(1)
    const [followupsLimit, setFollowupsLimit] = useState(10)

    // Populate edit form when client data loads
    useEffect(() => {
        if (client) {
            setEditForm({
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                phoneNumber: client.phoneNumber || '',
                dateOfBirth: client.dateOfBirth ? dayjs(client.dateOfBirth).format('YYYY-MM-DD') : '',
                county: client.county || '',
                subcounty: client.subcounty || '',
                ward: client.ward || ''
            })
        }
    }, [client])

    // Fetch screenings when tab is active
    useEffect(() => {
        if (activeTab === 'screenings' && id) {
            setScreeningsLoading(true)
            apiRequest(`/screenings?clientId=${id}`)
                .then((data) => setScreeningsData(data))
                .catch((error) => {
                    console.error('Failed to fetch screenings:', error)
                    setScreeningsData(null)
                })
                .finally(() => setScreeningsLoading(false))
        }
    }, [activeTab, id])

    // Fetch referrals when tab is active
    useEffect(() => {
        if (activeTab === 'referrals' && id) {
            setReferralsLoading(true)
            apiRequest(`/referrals?clientId=${id}`)
                .then((data) => setReferralsData(data))
                .catch((error) => {
                    console.error('Failed to fetch referrals:', error)
                    setReferralsData(null)
                })
                .finally(() => setReferralsLoading(false))
        }
    }, [activeTab, id])

    // Fetch follow-ups when tab is active
    useEffect(() => {
        if (activeTab === 'followups' && id) {
            setFollowupsLoading(true)
            apiRequest(`/follow-up?clientId=${id}`)
                .then((data) => setFollowupsData(data))
                .catch((error) => {
                    console.error('Failed to fetch follow-ups:', error)
                    setFollowupsData(null)
                })
                .finally(() => setFollowupsLoading(false))
        }
    }, [activeTab, id])

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
            router.push('/users')
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

    const handleEdit = async () => {
        setIsSubmitting(true)
        try {
            await apiRequest(`/clients/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(editForm)
            })
            setIsEditDialogOpen(false)
            toast({
                title: "Client Updated",
                description: "Client information has been updated successfully.",
                variant: "success"
            })
            refetchClient()
        } catch (error) {
            console.error("Failed to update client", error)
            toast({
                title: "Error",
                description: "Failed to update client information.",
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
                <Link href="/users">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Management
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Left Sidebar: Profile Card */}
                <Card className="border border-border/50 bg-card shadow-sm lg:col-span-1 h-fit">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col items-center mb-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                                <User className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-lg font-bold text-foreground text-center">{client.firstName} {client.lastName}</CardTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">ID: {client.nationalId}</p>
                        </div>
                        <Badge variant="outline" className={`
                            font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider w-fit mx-auto
                            ${riskInterpretation.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                (riskInterpretation.includes('MEDIUM') || riskInterpretation.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                    riskInterpretation === 'NOT_SCREENED' ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-600'
                            }
                        `}>
                            {riskInterpretation.replace('_RISK', '').replace('MODERATE', 'MEDIUM').replace('NOT_SCREENED', 'Not Screened')}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center justify-between py-2 border-y border-border/50">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Risk Score</span>
                            <span className="text-lg font-black text-primary">{riskScore}</span>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-muted/50">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-foreground font-medium text-xs">{client.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-muted/50">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-foreground font-medium text-xs">{dayjs(client.dateOfBirth).format('MMM D, YYYY')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-muted/50">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-foreground font-medium text-xs truncate">{client.county}, {client.subcounty}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/50 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 font-bold rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 h-9 text-xs"
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Edit className="h-3.5 w-3.5" />
                                Edit Client
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 font-bold rounded-xl border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 h-9 text-xs"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Client
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Content: Tabs */}
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="screenings" className="gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                Screenings
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">
                                    {screeningsData?.totalCount || 0}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="referrals" className="gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                Referrals
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">
                                    {referralsData?.totalCount || 0}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="followups" className="gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                Follow-ups
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-1.5 py-0 h-4 text-[10px] min-w-[1.25rem] flex justify-center">
                                    {followupsData?.totalCount || 0}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Screenings Tab */}
                        <TabsContent value="screenings">
                            <DataTable
                                columns={[
                                    {
                                        header: "Screening ID",
                                        accessorKey: "id",
                                        cell: (item: any) => (
                                            <Link href={`/screening/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                #{item.id.slice(-6).toUpperCase()}
                                            </Link>
                                        ),
                                        sortable: true,
                                        className: "pl-6"
                                    },
                                    {
                                        header: "Risk Level",
                                        accessorKey: "scoringResult.interpretation",
                                        cell: (item: any) => (
                                            <Badge variant="outline" className={`
                                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                                    ${item.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                    (item.scoringResult?.interpretation?.includes('MEDIUM') || item.scoringResult?.interpretation?.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                                        'bg-emerald-500/10 text-emerald-600'
                                                }
                                                `}>
                                                {item.scoringResult?.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM') || 'N/A'}
                                            </Badge>
                                        ),
                                        sortable: true
                                    },
                                    {
                                        header: "Score",
                                        accessorKey: "scoringResult.aggregateScore",
                                        cell: (item: any) => <div className="font-bold text-primary text-sm">{item.scoringResult?.aggregateScore || 0}</div>,
                                        sortable: true
                                    },
                                    {
                                        header: "Date",
                                        accessorKey: "createdAt",
                                        cell: (item: any) => <div className="font-medium text-muted-foreground">{dayjs(item.createdAt).format('MMM D, YYYY')}</div>,
                                        sortable: true,
                                        className: "text-right pr-6"
                                    }
                                ]}
                                data={screeningsData?.results || []}
                                isLoading={screeningsLoading}
                                totalCount={screeningsData?.totalCount || 0}
                                page={screeningsPage}
                                setPage={setScreeningsPage}
                                limit={screeningsLimit}
                                setLimit={setScreeningsLimit}
                            />
                        </TabsContent>

                        {/* Referrals Tab */}
                        <TabsContent value="referrals">
                            <DataTable
                                columns={[
                                    {
                                        header: "Referral ID",
                                        accessorKey: "id",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <Link href={`/referrals/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                    #{item.id.slice(-6).toUpperCase()}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                            </div>
                                        ),
                                        sortable: true,
                                        className: "pl-6"
                                    },
                                    {
                                        header: "Screening",
                                        accessorKey: "screeningId",
                                        cell: (item: any) => (
                                            <Link href={`/screening/${item.screeningId}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                #{item.screeningId?.slice(-6).toUpperCase() || 'N/A'}
                                            </Link>
                                        ),
                                        sortable: false
                                    },
                                    {
                                        header: "Health Facility",
                                        accessorKey: "healthFacility.name",
                                        cell: (item: any) => (
                                            <div className="flex flex-col max-w-[200px]">
                                                {item.healthFacilityId ? (
                                                    <Link href={`/facilities/${item.healthFacilityId}`} className="font-bold text-foreground truncate hover:underline">
                                                        {item.healthFacility?.name || 'N/A'}
                                                    </Link>
                                                ) : (
                                                    <span className="font-bold text-foreground truncate italic opacity-50">
                                                        {item.healthFacility?.name || 'N/A'}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-muted-foreground truncate">
                                                    {item.healthFacility?.ward}, {item.healthFacility?.subcounty}
                                                </span>
                                            </div>
                                        ),
                                        sortable: false
                                    },
                                    {
                                        header: "Appointment",
                                        accessorKey: "appointmentTime",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{dayjs(item.appointmentTime).format('MMM D, YYYY')}</span>
                                                <span className="text-[10px] text-muted-foreground">{dayjs(item.appointmentTime).format('h:mm A')}</span>
                                            </div>
                                        ),
                                        sortable: true
                                    },
                                    {
                                        header: "Status",
                                        accessorKey: "status",
                                        cell: (item: any) => (
                                            <Badge variant="outline" className={`
                                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                                    ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                                                        item.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600' :
                                                            'bg-muted text-muted-foreground'
                                                }
                                                `}>
                                                {item.status || 'N/A'}
                                            </Badge>
                                        ),
                                        sortable: true
                                    },
                                    {
                                        header: "Risk Level",
                                        accessorKey: "screening.scoringResult.interpretation",
                                        cell: (item: any) => (
                                            <Badge variant="outline" className={`
                                                    font-bold border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                                                    ${item.screening?.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                    (item.screening?.scoringResult?.interpretation?.includes('MEDIUM') || item.screening?.scoringResult?.interpretation?.includes('MODERATE')) ? 'bg-amber-500/10 text-amber-600' :
                                                        'bg-emerald-500/10 text-emerald-600'
                                                }
                                                `}>
                                                {item.screening?.scoringResult?.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM') || 'N/A'}
                                            </Badge>
                                        ),
                                        sortable: false
                                    },
                                    {
                                        header: "Support",
                                        accessorKey: "transportNeeded",
                                        cell: (item: any) => (
                                            <div className="flex flex-col gap-1">
                                                {item.transportNeeded && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] w-fit">
                                                        Transport
                                                    </Badge>
                                                )}
                                                {item.financialSupport && (
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 text-[9px] w-fit">
                                                        Financial
                                                    </Badge>
                                                )}
                                                {!item.transportNeeded && !item.financialSupport && (
                                                    <span className="text-[10px] text-muted-foreground">None</span>
                                                )}
                                            </div>
                                        ),
                                        sortable: false,
                                        className: "text-right pr-6"
                                    }
                                ]}
                                data={referralsData?.results || []}
                                isLoading={referralsLoading}
                                totalCount={referralsData?.totalCount || 0}
                                page={referralsPage}
                                setPage={setReferralsPage}
                                limit={referralsLimit}
                                setLimit={setReferralsLimit}
                            />
                        </TabsContent>

                        {/* Follow-ups Tab */}
                        <TabsContent value="followups">
                            <DataTable
                                columns={[
                                    {
                                        header: "Follow-up ID",
                                        accessorKey: "id",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <Link href={`/follow-ups/${item.id}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                    #{item.id.slice(-6).toUpperCase()}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                            </div>
                                        ),
                                        sortable: true,
                                        className: "pl-6"
                                    },
                                    {
                                        header: "Category",
                                        accessorKey: "category",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-xs">{item.category?.replace('_', ' ') || 'N/A'}</span>
                                                <Badge variant="outline" className={`
                                                        font-bold border-none px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider w-fit mt-1
                                                        ${item.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                                                        item.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                                                            'bg-blue-500/10 text-blue-600'
                                                    }
                                                    `}>
                                                    {item.priority || 'N/A'}
                                                </Badge>
                                            </div>
                                        ),
                                        sortable: true
                                    },
                                    {
                                        header: "Trigger Screening",
                                        accessorKey: "triggerScreeningId",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <Link href={`/screening/${item.triggerScreeningId}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                    #{item.triggerScreeningId?.slice(-6).toUpperCase() || 'N/A'}
                                                </Link>
                                                {item.triggerScreening?.scoringResult && (
                                                    <Badge variant="outline" className={`
                                                            font-bold border-none px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider w-fit mt-1
                                                            ${item.triggerScreening.scoringResult.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' :
                                                            item.triggerScreening.scoringResult.interpretation?.includes('MEDIUM') ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-emerald-500/10 text-emerald-600'
                                                        }
                                                        `}>
                                                        {item.triggerScreening.scoringResult.interpretation?.replace('_RISK', '').replace('MODERATE', 'MEDIUM')}
                                                    </Badge>
                                                )}
                                            </div>
                                        ),
                                        sortable: false
                                    },
                                    {
                                        header: "Referral",
                                        accessorKey: "referralId",
                                        cell: (item: any) => (
                                            item.referralId ? (
                                                <Link href={`/referrals/${item.referralId}`} className="font-mono text-[10px] font-bold text-primary hover:underline">
                                                    #{item.referralId.slice(-6).toUpperCase()}
                                                </Link>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">N/A</span>
                                            )
                                        ),
                                        sortable: false
                                    },
                                    {
                                        header: "Due Date",
                                        accessorKey: "dueDate",
                                        cell: (item: any) => (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-xs">{dayjs(item.dueDate).format('MMM D, YYYY')}</span>
                                                {item.completedAt ? (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] w-fit mt-1">
                                                        Completed {dayjs(item.completedAt).format('MMM D')}
                                                    </Badge>
                                                ) : dayjs(item.dueDate).isBefore(dayjs()) ? (
                                                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-none text-[9px] w-fit mt-1">
                                                        Overdue
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground mt-1">
                                                        {dayjs(item.dueDate).fromNow()}
                                                    </span>
                                                )}
                                            </div>
                                        ),
                                        sortable: true,
                                        className: "text-right pr-6"
                                    }
                                ]}
                                data={followupsData?.results || []}
                                isLoading={followupsLoading}
                                totalCount={followupsData?.totalCount || 0}
                                page={followupsPage}
                                setPage={setFollowupsPage}
                                limit={followupsLimit}
                                setLimit={setFollowupsLimit}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-background border-border">
                    <DialogHeader>
                        <DialogTitle>Edit Client Information</DialogTitle>
                        <DialogDescription>
                            Update the client's personal information below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                value={editForm.phoneNumber}
                                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={editForm.dateOfBirth}
                                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="county">County</Label>
                                <Input
                                    id="county"
                                    value={editForm.county}
                                    onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subcounty">Subcounty</Label>
                                <Input
                                    id="subcounty"
                                    value={editForm.subcounty}
                                    onChange={(e) => setEditForm({ ...editForm, subcounty: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ward">Ward</Label>
                                <Input
                                    id="ward"
                                    value={editForm.ward}
                                    onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the records for <strong>{client.firstName} {client.lastName}</strong>? This will permanently remove all screening history and personal data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete Record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardShell>
    )
}
