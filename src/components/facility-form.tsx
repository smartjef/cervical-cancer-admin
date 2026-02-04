"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/combobox"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Building2 } from "lucide-react"

interface FacilityFormProps {
    initialData?: any
    onSuccess: () => void
}

export default function FacilityForm({ initialData, onSuccess }: FacilityFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        kmflCode: initialData?.kmflCode || "",
        name: initialData?.name || "",
        owner: initialData?.owner || "",
        typeId: initialData?.typeId || "",
        county: initialData?.county || "",
        subcounty: initialData?.subcounty || "",
        ward: initialData?.ward || "",
        phoneNumber: initialData?.phoneNumber || "",
        email: initialData?.email || "",
        logo: initialData?.logo || "",
        latitude: initialData?.coordinates?.latitude || 0,
        longitude: initialData?.coordinates?.longitude || 0,
    })

    const selectedCounty = formData.county
    const selectedSubcounty = formData.subcounty

    // Fetch types and locations
    const { data: typesData } = useApi<any>("/health-facility-types")
    const { data: countiesData } = useApi<any>("/health-facilities/counties")
    const { data: subcountiesData } = useApi<any>(
        selectedCounty ? `/health-facilities/subcounties?county=${selectedCounty}` : null
    )
    const { data: wardsData } = useApi<any>(
        selectedSubcounty ? `/health-facilities/wards?subcounty=${selectedSubcounty}` : null
    )

    const typeOptions = useMemo(() => typesData?.results?.map((t: any) => ({ label: t.name, value: t.id })) || [], [typesData])
    const countyOptions = useMemo(() => countiesData || [], [countiesData])
    const subcountyOptions = useMemo(() => subcountiesData || [], [subcountiesData])
    const wardOptions = useMemo(() => wardsData || [], [wardsData])

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.kmflCode) newErrors.kmflCode = "KMFL Code is required"
        if (!formData.name) newErrors.name = "Facility Name is required"
        if (!formData.typeId) newErrors.typeId = "Facility Type is required"
        if (!formData.county) newErrors.county = "County is required"
        if (!formData.subcounty) newErrors.subcounty = "Subcounty is required"

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email address"
        }

        if (formData.latitude < -90 || formData.latitude > 90) newErrors.latitude = "Invalid latitude"
        if (formData.longitude < -180 || formData.longitude > 180) newErrors.longitude = "Invalid longitude"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                coordinates: {
                    latitude: Number(formData.latitude),
                    longitude: Number(formData.longitude)
                }
            }
            // Remove flat lat/lng from payload
            const { latitude, longitude, ...finalPayload } = payload as any

            const method = initialData ? "PUT" : "POST"
            const url = initialData
                ? `${process.env.NEXT_PUBLIC_API_URL}/health-facilities/${initialData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/health-facilities`

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalPayload),
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.message || "Failed to save facility")
            }

            toast({
                title: initialData ? "Facility Updated" : "Facility Registered",
                description: `Successfully ${initialData ? "updated" : "registered"} ${formData.name}.`,
                variant: "success"
            })
            onSuccess()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => {
                const newErrs = { ...prev }
                delete newErrs[name]
                return newErrs
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        KMFL Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        value={formData.kmflCode}
                        onChange={e => handleChange("kmflCode", e.target.value)}
                        className={cn("h-11 border-2 font-bold focus:ring-primary", errors.kmflCode && "border-destructive")}
                        placeholder="e.g. 12345"
                    />
                    {errors.kmflCode && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.kmflCode}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Facility Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        value={formData.name}
                        onChange={e => handleChange("name", e.target.value)}
                        className={cn("h-11 border-2 font-bold focus:ring-primary", errors.name && "border-destructive")}
                        placeholder="Patient Care Center"
                    />
                    {errors.name && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner / Corporate</Label>
                    <Input
                        value={formData.owner}
                        onChange={e => handleChange("owner", e.target.value)}
                        className="h-11 border-2 font-bold focus:ring-primary"
                        placeholder="Ministry of Health"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Facility Type <span className="text-destructive">*</span>
                    </Label>
                    <Combobox
                        options={typeOptions}
                        value={formData.typeId}
                        onValueChange={val => handleChange("typeId", val)}
                        placeholder="Select Type"
                        className={cn("h-11 border-2", errors.typeId && "border-destructive")}
                    />
                    {errors.typeId && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.typeId}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        County <span className="text-destructive">*</span>
                    </Label>
                    <Combobox
                        options={countyOptions}
                        value={formData.county}
                        onValueChange={val => {
                            handleChange("county", val)
                            handleChange("subcounty", "")
                            handleChange("ward", "")
                        }}
                        placeholder="Select County"
                        className={cn("h-11 border-2", errors.county && "border-destructive")}
                    />
                    {errors.county && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.county}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Subcounty <span className="text-destructive">*</span>
                    </Label>
                    <Combobox
                        options={subcountyOptions}
                        value={formData.subcounty}
                        onValueChange={val => {
                            handleChange("subcounty", val)
                            handleChange("ward", "")
                        }}
                        placeholder="Select Sub"
                        disabled={!selectedCounty}
                        className={cn("h-11 border-2", errors.subcounty && "border-destructive")}
                    />
                    {errors.subcounty && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.subcounty}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ward</Label>
                    <Combobox
                        options={wardOptions}
                        value={formData.ward}
                        onValueChange={val => handleChange("ward", val)}
                        placeholder="Select Ward"
                        disabled={!selectedSubcounty}
                        className="h-11 border-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                    <Input
                        value={formData.phoneNumber}
                        onChange={e => handleChange("phoneNumber", e.target.value)}
                        className="h-11 border-2 font-bold focus:ring-primary"
                        placeholder="+254..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                    <Input
                        value={formData.email}
                        onChange={e => handleChange("email", e.target.value)}
                        className={cn("h-11 border-2 font-bold focus:ring-primary", errors.email && "border-destructive")}
                        placeholder="hospital@email.com"
                    />
                    {errors.email && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.email}</p>}
                </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-xl border-2 border-dashed space-y-6">
                <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Geolocation Coordinates</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                            Latitude
                        </Label>
                        <Input
                            type="number"
                            step="0.000001"
                            value={formData.latitude}
                            onChange={e => handleChange("latitude", e.target.value)}
                            className={cn("h-11 border-2 bg-background font-mono font-bold", errors.latitude && "border-destructive")}
                        />
                        {errors.latitude && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.latitude}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                            Longitude
                        </Label>
                        <Input
                            type="number"
                            step="0.000001"
                            value={formData.longitude}
                            onChange={e => handleChange("longitude", e.target.value)}
                            className={cn("h-11 border-2 bg-background font-mono font-bold", errors.longitude && "border-destructive")}
                        />
                        {errors.longitude && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.longitude}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        initialData ? "Update Health Facility" : "Register Health Facility"
                    )}
                </Button>
            </div>
        </form>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ")
}
