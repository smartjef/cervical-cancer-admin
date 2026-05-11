"use client"

import { AlertCircle } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"

interface ScreeningLocationMapProps {
  latitude: number
  longitude: number
  clientName?: string
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function ScreeningLocationMap({ latitude, longitude, clientName }: ScreeningLocationMapProps) {
  const isOffline = (latitude === 0 && longitude === 0) || (!latitude && !longitude)
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const center = useMemo(() => ({
    lat: latitude,
    lng: longitude
  }), [latitude, longitude]);

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

  if (!isLoaded) {
    return <div className="h-full w-full rounded-xl bg-muted/30 animate-pulse" />
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border bg-muted/20 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={18}
        options={{
          disableDefaultUI: false,
          clickableIcons: true,
          scrollwheel: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        }}
      >
        <MarkerF
          position={center}
          title={clientName || "Screening Location"}
        />
      </GoogleMap>
    </div>
  )
}
