"use client"

import { AlertCircle, MapPin, ExternalLink, Layers, Navigation } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface ScreeningLocationMapProps {
  latitude: number
  longitude: number
  clientName?: string
}

export default function ScreeningLocationMap({ latitude, longitude, clientName }: ScreeningLocationMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [viewType, setViewType] = useState<'m' | 'k' | 'h'>('m') // m: map, k: satellite, h: hybrid
  const isOffline = (latitude === 0 && longitude === 0) || (!latitude && !longitude)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full rounded-xl bg-muted/30 animate-pulse" />
  }

  if (isOffline) {
    return (
      <div className="h-full w-full rounded-xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3">
        <AlertCircle className="h-10 w-10 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">Location Not Detected</p>
          <p className="text-xs">Recorded offline or GPS was disabled</p>
        </div>
      </div>
    )
  }

  // Google Maps Embed URL with view type support
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=18&t=${viewType}&output=embed`

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border bg-muted/20 relative group shadow-inner">
      {/* The Map as Background */}
      <iframe
        title="Screening Location"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={embedUrl}
        className="absolute inset-0 w-full h-full grayscale-[0.1] contrast-[1.05] brightness-[1.02]"
      ></iframe>
      
      {/* Premium Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-b from-black/20 via-transparent to-transparent">
        {/* Top Header Section */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-white/95 backdrop-blur shadow-xl border border-border/50 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-500">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-none mb-1">Screening Location</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{clientName || "Patient Site"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur shadow-xl border border-border/50 rounded-xl p-2 flex flex-col gap-1">
              <Button 
                variant={viewType === 'm' ? 'default' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewType('m')}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewType === 'k' ? 'default' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewType('k')}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="bg-white/95 backdrop-blur shadow-xl border border-border/50 rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-bottom duration-500">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-0.5">Coordinates</span>
                <span className="text-xs font-bold text-foreground tabular-nums tracking-tight">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
             </div>
          </div>

          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group/btn"
          >
            <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-70 group-hover/btn:opacity-100">Open Precise</span>
                <span className="text-xs font-black uppercase tracking-tight">Google Maps</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      {/* Glassy border effect */}
      <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none rounded-2xl"></div>
    </div>
  )
}
