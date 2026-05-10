"use client"

import DashboardShell from "@/components/dashboard-shell"
import { useApi } from "@/hooks/use-api"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, RefreshCcw, User, Users, Hospital, X, Activity } from "lucide-react"
import { Combobox } from "@/components/combobox"
import dynamic from "next/dynamic"

const GlobalScreeningMap = dynamic(() => import("@/components/global-screening-map"), {
    ssr: false,
    loading: () => <div className="h-[calc(100vh-250px)] w-full rounded-3xl bg-muted/30 animate-pulse flex items-center justify-center">
        <MapIcon className="h-10 w-10 text-muted-foreground/20 animate-bounce" />
    </div>
})

export default function MapsClient() {
    const [providerId, setProviderId] = useState<string>("all")
    const [clientId, setClientId] = useState<string>("all")
    
    // Fetch all data for the map
    const { data: screeningData, isLoading: screeningsLoading, refetch: refetchScreenings } = useApi<any>(
        `/screenings?limit=1000&includeForAllProviders=true` +
        `${providerId !== 'all' ? `&providerId=${providerId}` : ""}` +
        `${clientId !== 'all' ? `&clientId=${clientId}` : ""}`
    )
    
    const { data: facilitiesData } = useApi<any>("/health-facilities?limit=100")
    const { data: chpsData } = useApi<any>("/chps?limit=100")
    const { data: clientsData } = useApi<any>("/clients?limit=100")

    const resetFilters = () => {
        setProviderId("all")
        setClientId("all")
    }

    const screenings = screeningData?.results || []
    const facilities = facilitiesData?.results || []

    // Map data to options
    const chpOptions = [
        { label: "All CHPs", value: "all" },
        ...(chpsData?.results || []).map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))
    ]
    const clientOptions = [
        { label: "All Clients", value: "all" },
        ...(clientsData?.results || []).map((c: any) => ({ label: `${c.firstName} ${c.lastName}`, value: c.id }))
    ]

    return (
        <DashboardShell 
            title="Geographic Insights" 
            subtitle="Real-time monitoring of screening activity and referral networks"
        >
            <div className="flex flex-col gap-6">
                {/* Filters Row */}
                <Card className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm shadow-none rounded-none">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-[240px]">
                            <Combobox 
                                options={chpOptions}
                                value={providerId}
                                onValueChange={setProviderId}
                                placeholder="Filter by CHP..."
                                className="rounded-none border-2 bg-muted/50"
                            />
                        </div>

                        <div className="w-[240px]">
                            <Combobox 
                                options={clientOptions}
                                value={clientId}
                                onValueChange={setClientId}
                                placeholder="Filter by Client..."
                                className="rounded-none border-2 bg-muted/50"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-11 w-11 rounded-none"
                                onClick={() => refetchScreenings()}
                            >
                                <RefreshCcw className={`h-4 w-4 ${screeningsLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            {(providerId !== 'all' || clientId !== 'all') && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={resetFilters}
                                    className="gap-2 font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-none"
                                >
                                    <X className="h-4 w-4" /> Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Map Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <GlobalScreeningMap 
                            screenings={screenings} 
                            facilities={facilities}
                            isLoading={screeningsLoading}
                        />
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 border border-border/50 bg-card rounded-none shadow-none">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Map Insights
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-none bg-emerald-50 text-emerald-600">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Total Points</span>
                                    </div>
                                    <span className="text-xl font-black tabular-nums">{screenings.length}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-none bg-primary/5 text-primary">
                                            <Hospital className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Facilities</span>
                                    </div>
                                    <span className="text-xl font-black tabular-nums">{facilities.length}</span>
                                </div>

                                <div className="pt-4 border-t border-border/50 space-y-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk Distribution</p>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'High Risk', count: screenings.filter((s: any) => s.scoringResult?.interpretation?.includes('HIGH')).length, color: 'bg-rose-500' },
                                            { label: 'Medium Risk', count: screenings.filter((s: any) => s.scoringResult?.interpretation?.includes('MEDIUM')).length, color: 'bg-amber-500' },
                                            { label: 'Low Risk', count: screenings.filter((s: any) => s.scoringResult?.interpretation?.includes('LOW')).length, color: 'bg-emerald-500' },
                                        ].map((item) => (
                                            <div key={item.label} className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black uppercase">
                                                    <span>{item.label}</span>
                                                    <span>{item.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
                                                    <div 
                                                        className={`h-full ${item.color} transition-all duration-1000`} 
                                                        style={{ width: `${screenings.length > 0 ? (item.count / screenings.length) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="p-6 border border-border/50 bg-primary/5 border-primary/10 rounded-none shadow-none">
                             <div className="flex flex-col gap-2">
                                <div className="w-8 h-8 rounded-none bg-primary text-white flex items-center justify-center">
                                    <MapIcon className="h-4 w-4" />
                                </div>
                                <h4 className="text-xs font-bold text-foreground">Spatial Monitoring</h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                    This view visualizes screening coverage and clinical risk clusters across the operational area.
                                </p>
                             </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
