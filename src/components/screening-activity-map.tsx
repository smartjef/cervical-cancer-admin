"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Polyline, Polygon, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { AlertCircle, History, Ruler, Square, MousePointer2, X } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import dayjs from "dayjs"
import { Button } from "./ui/button"

// GIS Utils
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const calculateArea = (points: L.LatLng[]) => {
    if (points.length < 3) return 0;
    let area = 0;
    const R = 6371; // km
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const p1 = points[i];
        const p2 = points[j];
        const x1 = R * p1.lng * Math.PI / 180 * Math.cos(p1.lat * Math.PI / 180);
        const y1 = R * p1.lat * Math.PI / 180;
        const x2 = R * p2.lng * Math.PI / 180 * Math.cos(p2.lat * Math.PI / 180);
        const y2 = R * p2.lat * Math.PI / 180;
        area += (x1 * y2 - x2 * y1);
    }
    return Math.abs(area) / 2;
}

function GISControls({ onModeToggle, mode, distance, area, mouseCoords }: any) {
    return (
        <div className="absolute top-4 right-12 z-[1000] flex flex-col gap-2">
            <div className="flex gap-1">
                <Button 
                    variant={mode === 'none' ? "default" : "secondary"}
                    size="icon"
                    className="shadow-none rounded-none h-8 w-8 border border-border/50"
                    onClick={() => onModeToggle('none')}
                >
                    <MousePointer2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                    variant={mode === 'distance' ? "default" : "secondary"}
                    size="icon"
                    className="shadow-none rounded-none h-8 w-8 border border-border/50"
                    onClick={() => onModeToggle('distance')}
                >
                    <Ruler className="h-3.5 w-3.5" />
                </Button>
                <Button 
                    variant={mode === 'area' ? "default" : "secondary"}
                    size="icon"
                    className="shadow-none rounded-none h-8 w-8 border border-border/50"
                    onClick={() => onModeToggle('area')}
                >
                    <Square className="h-3.5 w-3.5" />
                </Button>
            </div>
            <div className="bg-black/60 backdrop-blur text-white p-1.5 text-[8px] font-mono shadow-none rounded-none pointer-events-none">
                {mouseCoords.lat.toFixed(4)}, {mouseCoords.lng.toFixed(4)}
                {mode === 'distance' && distance > 0 && <div className="mt-1 text-primary border-t border-white/20 pt-1">Dist: {distance.toFixed(2)}km</div>}
                {mode === 'area' && area > 0 && <div className="mt-1 text-primary border-t border-white/20 pt-1">Area: {area.toFixed(2)}km\u00b2</div>}
            </div>
        </div>
    )
}

function MapEvents({ onMouseMove, onClick }: any) {
    useMapEvents({
        mousemove: (e) => onMouseMove(e.latlng),
        click: (e) => onClick(e.latlng)
    })
    return null
}

function ChangeView({ markers }: { markers: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers, map])
  return null
}

interface ScreeningActivityMapProps {
  screenings: any[]
  providerName?: string
}

export default function ScreeningActivityMap({ screenings, providerName }: ScreeningActivityMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Memoize icon to ensure it's created on client side
  const customIcon = useMemo(() => {
    if (typeof window === 'undefined' || !isMounted) return null;
    return L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    })
  }, [isMounted])

  // GIS States
  const [mode, setMode] = useState<'none' | 'distance' | 'area'>('none')
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([])
  const [mouseCoords, setMouseCoords] = useState({ lat: 0, lng: 0 })
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalArea, setTotalArea] = useState(0)

  // Filter out 0,0 coordinates and get the last 10
  const validScreenings = (screenings || [])
    .filter(s => s.coordinates?.latitude !== 0 && s.coordinates?.longitude !== 0 && s.coordinates?.latitude && s.coordinates?.longitude)
    .slice(0, 10)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMapClick = (latlng: L.LatLng) => {
    if (mode === 'none') return;
    
    const newPoints = [...measurePoints, latlng]
    setMeasurePoints(newPoints)
    
    if (mode === 'distance' && newPoints.length > 1) {
      let dist = 0
      for (let i = 0; i < newPoints.length - 1; i++) {
        dist += calculateDistance(
          newPoints[i].lat, newPoints[i].lng,
          newPoints[i+1].lat, newPoints[i+1].lng
        )
      }
      setTotalDistance(dist)
    } else if (mode === 'area' && newPoints.length > 2) {
      setTotalArea(calculateArea(newPoints))
    }
  }

  const handleModeToggle = (newMode: 'none' | 'distance' | 'area') => {
    if (mode === newMode) {
        setMode('none')
        setMeasurePoints([])
        setTotalDistance(0)
        setTotalArea(0)
    } else {
        setMode(newMode)
        setMeasurePoints([])
        setTotalDistance(0)
        setTotalArea(0)
    }
  }

  if (!isMounted || !customIcon) {
    return <div className="h-[400px] w-full bg-muted/30 animate-pulse" />
  }

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

  const markerCoords: [number, number][] = validScreenings.map(s => [s.coordinates.latitude, s.coordinates.longitude])

  return (
    <div className="h-[400px] w-full overflow-hidden border border-border bg-background relative group">
      <MapContainer 
        center={markerCoords[0]} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <MapEvents 
            onMouseMove={setMouseCoords} 
            onClick={handleMapClick}
        />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Map View">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <ChangeView markers={markerCoords} />
        
        {/* GIS Polyline/Polygon */}
        {mode === 'distance' && measurePoints.length > 0 && (
            <Polyline 
                positions={measurePoints} 
                pathOptions={{ color: 'black', weight: 2, dashArray: '4, 8' }} 
            />
        )}
        {mode === 'area' && measurePoints.length > 0 && (
            <Polygon 
                positions={measurePoints} 
                pathOptions={{ color: 'primary', fillColor: 'primary', fillOpacity: 0.1, weight: 1.5 }} 
            />
        )}

        {validScreenings.map((s, idx) => (
          <Marker key={s.id} position={[s.coordinates.latitude, s.coordinates.longitude]} icon={customIcon}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <p className="text-[10px] font-black text-primary uppercase mb-1 flex items-center justify-between">
                    <span>{idx === 0 ? "Latest Activity" : `Screening Activity`}</span>
                    <span className="text-muted-foreground/50">#{validScreenings.length - idx}</span>
                </p>
                <p className="text-sm font-bold text-foreground">
                    {s.client?.firstName} {s.client?.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                    {dayjs(s.createdAt).format("MMM D, YYYY \u00b7 HH:mm")}
                </p>
                <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{s.coordinates.latitude.toFixed(4)}, {s.coordinates.longitude.toFixed(4)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Premium Overlay UI */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur border border-border p-4 flex items-center gap-4 animate-in slide-in-from-top duration-500 pointer-events-auto rounded-none shadow-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">Tracking last 10 points for {providerName}</p>
        </div>
      </div>

      <GISControls 
            mode={mode}
            onModeToggle={handleModeToggle}
            distance={totalDistance}
            area={totalArea}
            mouseCoords={mouseCoords}
        />
    </div>
  )
}
