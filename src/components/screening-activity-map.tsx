"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api"
import dayjs from "dayjs"
import { AlertCircle } from "lucide-react"

interface ScreeningActivityMapProps {
  screenings: any[]
  providerName?: string
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

export default function ScreeningActivityMap({ screenings, providerName }: ScreeningActivityMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedScreening, setSelectedScreening] = useState<any>(null)

  // Filter out 0,0 coordinates and get the last 10
  const validScreenings = useMemo(() => (screenings || [])
    .filter(s => s.coordinates?.latitude !== 0 && s.coordinates?.longitude !== 0 && s.coordinates?.latitude && s.coordinates?.longitude)
    .slice(0, 10), [screenings])

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  // Auto-fit bounds
  useEffect(() => {
    if (map && validScreenings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validScreenings.forEach(s => {
        bounds.extend({
          lat: s.coordinates.latitude,
          lng: s.coordinates.longitude
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, validScreenings]);

  if (validScreenings.length === 0) {
    return (
      <div className="h-[400px] w-full bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
        <AlertCircle className="h-10 w-10 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-bold text-foreground uppercase tracking-tight">No Location Data Available</p>
          <p className="text-xs">No screenings with valid GPS coordinates found for this provider.</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="h-[400px] w-full bg-muted/30 animate-pulse rounded-xl" />
  }

  return (
    <div className="h-[400px] w-full overflow-hidden border border-border bg-background relative rounded-xl">
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={13}
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
        {validScreenings.map((s, idx) => (
          <MarkerF
            key={s.id}
            position={{ lat: s.coordinates.latitude, lng: s.coordinates.longitude }}
            onClick={() => setSelectedScreening(s)}
            label={{
                text: (validScreenings.length - idx).toString(),
                color: "white",
                fontSize: "10px",
                fontWeight: "bold"
            }}
          />
        ))}

        {selectedScreening && (
          <InfoWindowF
            position={{ 
              lat: selectedScreening.coordinates.latitude, 
              lng: selectedScreening.coordinates.longitude 
            }}
            onCloseClick={() => setSelectedScreening(null)}
          >
            <div className="p-1 min-w-[150px]">
              <p className="text-[10px] font-black text-primary uppercase mb-1">
                Screening Activity
              </p>
              <p className="text-sm font-bold text-foreground">
                {selectedScreening.client?.firstName} {selectedScreening.client?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                {dayjs(selectedScreening.createdAt).format("MMM D, YYYY \u00b7 HH:mm")}
              </p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
      
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur border border-border p-3 flex items-center gap-4 pointer-events-auto rounded-none shadow-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">Tracking last 10 points for {providerName}</p>
        </div>
      </div>
    </div>
  )
}
