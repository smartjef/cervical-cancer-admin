"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Mail, 
    Building2, 
    Calendar, 
    Activity, 
    Edit, 
    Trash2 
} from "lucide-react"
import dayjs from "dayjs"
import Link from "next/link"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import FacilityForm from "@/components/facility-form"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"

interface FacilityDetailClientProps {
    id: string
}

export default function FacilityDetailClient({ id }: FacilityDetailClientProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("referrals")
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Pagination states for Referrals tab
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // Fetch Facility Details
    const { data: facility, isLoading: facilityLoading } = useApi<any>(`/health-facilities/${id}`)

    // Fetch Referrals for this Facility
    const { data: referralsData, isLoading: referralsLoading } = useApi<any>(
        activeTab === "referrals" ? `/referrals?healthFacilityId=${id}&page=${page}&limit=${limit}&includeRelations=true` : null
    )

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await apiRequest(`/health-facilities/${id}`, {
                method: 'DELETE'
            })
            toast({
                title: "Facility Deleted",
                description: "The health facility has been permanently removed.",
                variant: "success"
            })
            router.push('/facilities')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete facility",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
        }
    }

    if (facilityLoading) {
        return (
            <DashboardShell title="Loading Facility...">
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

    if (!facility) {
        return (
            <DashboardShell title="Facility Not Found">
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <h2 className="text-xl font-bold">Facility not found</h2>
                    <Button onClick={() => router.push('/facilities')}>Return to Facilities</Button>
                </div>
            </DashboardShell>
        )
    }

    return (
        <DashboardShell title="Facility Detail" subtitle={facility.name}>
            <div className="flex items-center gap-4 mb-6">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push('/facilities')}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        {facility.name}
                        <Badge variant="outline" className="font-mono text-xs border-primary/20 text-primary">
                            {facility.kmflCode}
                        </Badge>
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{facility.ward}, {facility.subcounty}, {facility.county}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none bg-card sticky top-6">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                    {facility.logo ? (
                                        <img src={facility.logo} alt={facility.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-primary" />
                                    )}
                                </div>
                                <Badge className="bg-primary hover:bg-primary/90">Active</Badge>
                            </div>
                            <CardTitle className="mt-4 text-lg font-black">{facility.name}</CardTitle>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                {facility.type?.name || 'Uncategorized'}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Address</span>
                                        <span className="font-bold">{facility.address || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Owner</span>
                                        <span className="font-bold">{facility.owner || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Contact</span>
                                        <span className="font-bold">{facility.phoneNumber || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Email</span>
                                        <span className="font-bold break-all">{facility.email || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Registered</span>
                                        <span className="font-bold">{dayjs(facility.createdAt).format("MMM D, YYYY")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 gap-2 border-2 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors">
                                            <Edit className="h-4 w-4" />
                                            Edit Facility
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-background ">
                                        <div className="bg-primary/5 p-6 border-b border-primary/10">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm">
                                                        <Building2 className="h-6 w-6 text-white" />
                                                    </div>
                                                    Edit Facility Details
                                                </DialogTitle>
                                            </DialogHeader>
                                        </div>
                                        <div className="p-8 max-h-[80vh] overflow-y-auto">
                                            <FacilityForm 
                                                initialData={facility} 
                                                onSuccess={() => { setIsEditOpen(false); window.location.reload(); }} 
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 gap-2 border-2 border-destructive/20 text-destructive font-black text-[10px] uppercase tracking-widest hover:bg-destructive hover:text-white transition-all">
                                            <Trash2 className="h-4 w-4" />
                                            Delete Facility
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="border-none ">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-sm font-medium">
                                                This action cannot be undone. This will permanently delete <strong>{facility.name}</strong> and all associated referrals.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-3 pt-4">
                                            <AlertDialogCancel className="h-12 border-2 font-bold uppercase tracking-widest">Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleDelete} 
                                                disabled={isDeleting}
                                                className="h-12 bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Facility"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Referral Table */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-primary rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Patient Referrals</h3>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            {referralsData?.totalCount || 0} TOTAL REFERRALS
                        </div>
                    </div>

                    <DataTable
                        columns={[
                            {
                                header: "Referral ID",
                                accessorKey: "id",
                                cell: (item: any) => (
                                    <div className="flex flex-col gap-1">
                                        <Link href={`/referrals/${item.id}`} className="font-mono text-[10px] font-black text-primary hover:underline">
                                            #{item.id.slice(-6).toUpperCase()}
                                        </Link>
                                        <span className="text-[10px] text-muted-foreground font-bold">{dayjs(item.createdAt).format('MMM D, YYYY')}</span>
                                    </div>
                                ),
                                sortable: true,
                                className: "pl-6"
                            },
                            {
                                header: "Client",
                                accessorKey: "client",
                                cell: (item: any) => (
                                    <Link 
                                        href={`/users/clients/${item.screening?.clientId}`} 
                                        className="font-black text-xs hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        View Client Details
                                        <Activity className="h-3 w-3" />
                                    </Link>
                                ),
                                sortable: false
                            },
                            {
                                header: "Appointment",
                                accessorKey: "appointmentTime",
                                cell: (item: any) => (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black">{dayjs(item.appointmentTime).format("MMM D, YYYY")}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{dayjs(item.appointmentTime).format("h:mm A")}</span>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: "Status",
                                accessorKey: "status",
                                cell: (item: any) => (
                                    <Badge variant="outline" className={`
                                        font-black border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-widest
                                        ${item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 
                                          item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 
                                          'bg-rose-500/10 text-rose-600'}
                                    `}>
                                        {item.status}
                                    </Badge>
                                ),
                                sortable: true
                            },
                            {
                                header: "Support",
                                accessorKey: "transportNeeded",
                                cell: (item: any) => (
                                    <div className="flex gap-1">
                                        {item.transportNeeded && <Badge variant="secondary" className="text-[9px] font-black bg-sky-500/10 text-sky-600 border-none uppercase tracking-tighter">Transport</Badge>}
                                        {item.financialSupport && <Badge variant="secondary" className="text-[9px] font-black bg-purple-500/10 text-purple-600 border-none uppercase tracking-tighter">Financial</Badge>}
                                        {!item.transportNeeded && !item.financialSupport && <span className="text-[10px] text-muted-foreground font-bold">-</span>}
                                    </div>
                                ),
                                sortable: false
                            }
                        ]}
                        data={referralsData?.results || []}
                        isLoading={referralsLoading}
                        totalCount={referralsData?.totalCount || 0}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                        setLimit={setLimit}
                    />
                </div>
            </div>
        </DashboardShell>
    )
}
