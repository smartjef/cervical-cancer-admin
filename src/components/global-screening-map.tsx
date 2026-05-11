"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api"
import dayjs from "dayjs"
import { Badge } from "./ui/badge"
import { User, Activity, Hospital, Info } from "lucide-react"

interface GlobalScreeningMapProps {
  screenings: any[]
  facilities?: any[]
  isLoading?: boolean
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -1.286389,
  lng: 36.817223 // Nairobi
};

export default function GlobalScreeningMap({ screenings, facilities = [], isLoading }: GlobalScreeningMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedScreening, setSelectedScreening] = useState<any>(null)
  const [selectedFacility, setSelectedFacility] = useState<any>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  // Auto-fit bounds when screenings change
  useEffect(() => {
    if (map && screenings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      screenings.forEach(s => {
        if (s.coordinates?.latitude && s.coordinates?.longitude) {
          bounds.extend({
            lat: s.coordinates.latitude,
            lng: s.coordinates.longitude
          });
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, screenings]);

  const getRiskColor = (interpretation: string) => {
    if (interpretation?.includes('HIGH')) return "#ef4444"
    if (interpretation?.includes('MEDIUM') || interpretation?.includes('MODERATE')) return "#f59e0b"
    return "#10b981"
  }

  if (!isLoaded) {
    return <div className="h-[calc(100vh-250px)] w-full rounded-3xl bg-muted/30 animate-pulse" />
  }

  return (
    <div className="h-[calc(100vh-250px)] w-full overflow-hidden border border-border bg-background relative group">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {/* Screening Markers */}
        {screenings.map((s) => {
          if (!s.coordinates?.latitude || !s.coordinates?.longitude) return null
          const interpretation = s.scoringResult?.interpretation || "LOW_RISK"
          const color = getRiskColor(interpretation)

          return (
            <MarkerF
              key={s.id}
              position={{ lat: s.coordinates.latitude, lng: s.coordinates.longitude }}
              onClick={() => {
                setSelectedScreening(s)
                setSelectedFacility(null)
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 8,
              }}
            />
          )
        })}

        {/* Facility Markers */}
        {facilities.map((f) => {
          if (!f.coordinates?.latitude || !f.coordinates?.longitude) return null
          return (
            <MarkerF
              key={f.id}
              position={{ lat: f.coordinates.latitude, lng: f.coordinates.longitude }}
              onClick={() => {
                setSelectedFacility(f)
                setSelectedScreening(null)
              }}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              }}
            />
          )
        })}

        {/* Screening Info Window */}
        {selectedScreening && (
          <InfoWindowF
            position={{ 
              lat: selectedScreening.coordinates.latitude, 
              lng: selectedScreening.coordinates.longitude 
            }}
            onCloseClick={() => setSelectedScreening(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={`font-black uppercase text-[9px] border-none px-2 rounded-full ${
                  selectedScreening.scoringResult?.interpretation?.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' : 
                  selectedScreening.scoringResult?.interpretation?.includes('MEDIUM') ? 'bg-amber-500/10 text-amber-600' : 
                  'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {selectedScreening.scoringResult?.interpretation?.replace('_', ' ') || 'LOW RISK'}
                </Badge>
                <span className="text-[9px] font-mono text-muted-foreground">{dayjs(selectedScreening.createdAt).format('DD/MM/YY')}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <div>
                        <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">Patient</p>
                        <p className="text-xs font-bold text-foreground">{selectedScreening.client?.firstName} {selectedScreening.client?.lastName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary" />
                    <div>
                        <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">Provider</p>
                        <p className="text-xs font-bold text-foreground">{selectedScreening.provider?.firstName} {selectedScreening.provider?.lastName}</p>
                    </div>
                </div>
              </div>
            </div>
          </InfoWindowF>
        )}

        {/* Facility Info Window */}
        {selectedFacility && (
          <InfoWindowF
            position={{ 
              lat: selectedFacility.coordinates.latitude, 
              lng: selectedFacility.coordinates.longitude 
            }}
            onCloseClick={() => setSelectedFacility(null)}
          >
            <div className="p-1">
              <p className="text-[9px] font-black text-primary uppercase mb-0.5">Health Facility</p>
              <p className="text-sm font-bold text-foreground">{selectedFacility.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedFacility.county}, {selectedFacility.subcounty}</p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Legend Overlay - Keeping it for clarity but simplified */}
      <div className="absolute bottom-10 left-4 z-10 pointer-events-none">
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur border border-border p-4 space-y-3 pointer-events-auto rounded-none shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="h-3 w-3" /> Map Legend
              </h4>
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-foreground/80">High Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-foreground/80">Moderate Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-foreground/80">Low Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <img src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" className="w-4 h-4" alt="facility" />
                      <span className="text-xs font-bold text-foreground/80">Health Facility</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}
