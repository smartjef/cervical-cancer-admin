"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/combobox"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Building2 } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface FacilityFormProps {
  initialData?: any
  onSuccess: () => void
}

export default function FacilityForm({
  initialData,
  onSuccess,
}: FacilityFormProps) {
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
    address: initialData?.address || "",
    phoneNumber: initialData?.phoneNumber || "",
    email: initialData?.email || "",
    logo: initialData?.logo || "",
    latitude: initialData?.coordinates?.latitude || 0,
    longitude: initialData?.coordinates?.longitude || 0,
  })

  // ID Tracking for Hierarchy
  const [countyId, setCountyId] = useState<string>("")
  const [subcountyId, setSubcountyId] = useState<string>("")

  // Search states
  const [countySearch, setCountySearch] = useState("")
  const [subcountySearch, setSubcountySearch] = useState("")
  const [wardSearch, setWardSearch] = useState("")

  // Debounced search
  const [debouncedCountySearch, setDebouncedCountySearch] = useState("")
  const [debouncedSubcountySearch, setDebouncedSubcountySearch] = useState("")
  const [debouncedWardSearch, setDebouncedWardSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCountySearch(countySearch), 300)
    return () => clearTimeout(timer)
  }, [countySearch])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSubcountySearch(subcountySearch), 300)
    return () => clearTimeout(timer)
  }, [subcountySearch])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWardSearch(wardSearch), 300)
    return () => clearTimeout(timer)
  }, [wardSearch])

  // Fetch types
  const { data: typesData } = useApi<any>("/health-facility-types")

  // Fetch Locations (Generic AddressHierarchy API)
  const { data: countiesData, isLoading: isCountiesLoading } = useApi<any>(
    `/address-hierarchy?level=1&pageSize=50${
      debouncedCountySearch ? `&search=${debouncedCountySearch}` : ""
    }`
  )
  const { data: subcountiesData, isLoading: isSubcountiesLoading } = useApi<any>(
    countyId
      ? `/address-hierarchy?level=2&parentId=${countyId}&pageSize=50${
          debouncedSubcountySearch ? `&search=${debouncedSubcountySearch}` : ""
        }`
      : null
  )
  const { data: wardsData, isLoading: isWardsLoading } = useApi<any>(
    subcountyId
      ? `/address-hierarchy?level=3&parentId=${subcountyId}&pageSize=100${
          debouncedWardSearch ? `&search=${debouncedWardSearch}` : ""
        }`
      : null
  )

  const typeOptions = useMemo(
    () =>
      typesData?.results?.map((t: any) => ({ label: t.name, value: t.id })) ||
      [],
    [typesData]
  )
  const countyOptions = useMemo(
    () =>
      countiesData?.results?.map((c: any) => ({ label: c.name, value: c.id })) ||
      [],
    [countiesData]
  )
  const subcountyOptions = useMemo(
    () =>
      subcountiesData?.results?.map((s: any) => ({
        label: s.name,
        value: s.id,
      })) || [],
    [subcountiesData]
  )
  const wardOptions = useMemo(
    () =>
      wardsData?.results?.map((w: any) => ({ label: w.name, value: w.name })) ||
      [],
    [wardsData]
  )

  // Initialization of IDs for editing
  useEffect(() => {
    if (initialData?.county && countiesData?.results) {
      const county = countiesData.results.find(
        (c: any) => c.name === initialData.county
      )
      if (county) setCountyId(county.id)
    }
  }, [initialData, countiesData])

  useEffect(() => {
    if (initialData?.subcounty && subcountiesData?.results) {
      const sub = subcountiesData.results.find(
        (s: any) => s.name === initialData.subcounty
      )
      if (sub) setSubcountyId(sub.id)
    }
  }, [initialData, subcountiesData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.kmflCode) newErrors.kmflCode = "KMFL Code is required"
    if (!formData.name) newErrors.name = "Facility Name is required"
    if (!formData.typeId) newErrors.typeId = "Facility Type is required"
    if (!formData.county) newErrors.county = "County is required"
    if (!formData.subcounty) newErrors.subcounty = "Subcounty is required"
    if (!formData.address) newErrors.address = "Street Address is required"
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required"
    if (!formData.email) newErrors.email = "Email Address is required"
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address"
    }
    if (formData.latitude < -90 || formData.latitude > 90)
      newErrors.latitude = "Invalid latitude"
    if (formData.longitude < -180 || formData.longitude > 180)
      newErrors.longitude = "Invalid longitude"
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
          longitude: Number(formData.longitude),
        },
      }
      const { latitude, longitude, ...finalPayload } = payload as any
      const method = initialData ? "PUT" : "POST"
      const path = initialData
        ? `/health-facilities/${initialData.id}`
        : `/health-facilities`
      await apiRequest(path, {
        method,
        body: JSON.stringify(finalPayload),
      })
      toast({
        title: initialData ? "Facility Updated" : "Facility Registered",
        description: `Successfully ${initialData ? "updated" : "registered"} ${
          formData.name
        }.`,
        variant: "success",
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
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
            onChange={(e) => handleChange("kmflCode", e.target.value)}
            className={cn(
              "h-11 border-2 font-bold focus:ring-primary",
              errors.kmflCode && "border-destructive"
            )}
            placeholder="e.g. 12345"
          />
          {errors.kmflCode && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.kmflCode}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Facility Name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={cn(
              "h-11 border-2 font-bold focus:ring-primary",
              errors.name && "border-destructive"
            )}
            placeholder="Patient Care Center"
          />
          {errors.name && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.name}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Owner / Corporate
          </Label>
          <Input
            value={formData.owner}
            onChange={(e) => handleChange("owner", e.target.value)}
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
            onValueChange={(val) => handleChange("typeId", val)}
            placeholder="Select Type"
            className={cn("h-11 border-2", errors.typeId && "border-destructive")}
          />
          {errors.typeId && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.typeId}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            County <span className="text-destructive">*</span>
          </Label>
          <Combobox
            options={countyOptions}
            value={countyId}
            onValueChange={(val) => {
              setCountyId(val)
              const name =
                countyOptions.find((o: any) => o.value === val)?.label || ""
              handleChange("county", name)
              setSubcountyId("")
              handleChange("subcounty", "")
              handleChange("ward", "")
            }}
            onSearchChange={setCountySearch}
            isLoading={isCountiesLoading}
            placeholder="Select County"
            className={cn("h-11 border-2", errors.county && "border-destructive")}
          />
          {errors.county && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.county}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Subcounty <span className="text-destructive">*</span>
          </Label>
          <Combobox
            options={subcountyOptions}
            value={subcountyId}
            onValueChange={(val) => {
              setSubcountyId(val)
              const name =
                subcountyOptions.find((o: any) => o.value === val)?.label || ""
              handleChange("subcounty", name)
              handleChange("ward", "")
            }}
            onSearchChange={setSubcountySearch}
            isLoading={isSubcountiesLoading}
            placeholder="Select Sub"
            disabled={!countyId}
            className={cn(
              "h-11 border-2",
              errors.subcounty && "border-destructive"
            )}
          />
          {errors.subcounty && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.subcounty}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Ward
          </Label>
          <Combobox
            options={wardOptions}
            value={formData.ward}
            onValueChange={(val) => handleChange("ward", val)}
            onSearchChange={setWardSearch}
            isLoading={isWardsLoading}
            placeholder="Select Ward"
            disabled={!subcountyId}
            className="h-11 border-2"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className={cn(
            "h-11 border-2 font-bold focus:ring-primary",
            errors.address && "border-destructive"
          )}
          placeholder="e.g. Hospital Road, Near City Plaza"
        />
        {errors.address && (
          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
            {errors.address}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className={cn(
              "h-11 border-2 font-bold focus:ring-primary",
              errors.phoneNumber && "border-destructive"
            )}
            placeholder="+254..."
          />
          {errors.phoneNumber && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.phoneNumber}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={cn(
              "h-11 border-2 font-bold focus:ring-primary",
              errors.email && "border-destructive"
            )}
            placeholder="hospital@email.com"
          />
          {errors.email && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Logo URL
        </Label>
        <Input
          value={formData.logo}
          onChange={(e) => handleChange("logo", e.target.value)}
          className="h-11 border-2 font-bold focus:ring-primary"
          placeholder="https://example.com/logo.png"
        />
      </div>
      <div className="p-6 bg-muted/30 rounded-xl border-2 border-dashed space-y-6">
        <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
              Geolocation Coordinates
            </span>
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
              onChange={(e) => handleChange("latitude", e.target.value)}
              className={cn(
                "h-11 border-2 bg-background font-mono font-bold",
                errors.latitude && "border-destructive"
              )}
            />
            {errors.latitude && (
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                {errors.latitude}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
              Longitude
            </Label>
            <Input
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => handleChange("longitude", e.target.value)}
              className={cn(
                "h-11 border-2 bg-background font-mono font-bold",
                errors.longitude && "border-destructive"
              )}
            />
            {errors.longitude && (
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                {errors.longitude}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
            </>
          ) : initialData ? (
            "Update Health Facility"
          ) : (
            "Register Health Facility"
          )}
        </Button>
      </div>
    </form>
  )
}
