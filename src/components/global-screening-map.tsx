"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, CircleMarker, Polyline, Polygon, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { AlertCircle, Map as MapIcon, Filter, Info, User, Activity, Hospital, Ruler, Square, MousePointer2, X } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import dayjs from "dayjs"
import { Badge } from "./ui/badge"
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
        <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
            <Button 
                variant={mode === 'none' ? "default" : "secondary"}
                size="icon"
                className="shadow-md rounded-none h-10 w-10 border border-border/50"
                onClick={() => onModeToggle('none')}
                title="Pan Mode"
            >
                <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button 
                variant={mode === 'distance' ? "default" : "secondary"}
                size="icon"
                className="shadow-md rounded-none h-10 w-10 border border-border/50"
                onClick={() => onModeToggle('distance')}
                title="Measure Distance"
            >
                <Ruler className="h-4 w-4" />
            </Button>
            <Button 
                variant={mode === 'area' ? "default" : "secondary"}
                size="icon"
                className="shadow-md rounded-none h-10 w-10 border border-border/50"
                onClick={() => onModeToggle('area')}
                title="Measure Area"
            >
                <Square className="h-4 w-4" />
            </Button>
            
            {mode !== 'none' && (
                <div className="bg-white/95 backdrop-blur border border-border p-2 text-[10px] font-black uppercase shadow-lg rounded-none min-w-[150px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground">{mode === 'distance' ? 'Linear Dist' : 'Surface Area'}</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => onModeToggle(mode)}>
                            <X className="h-2 w-2" />
                        </Button>
                    </div>
                    <div className="text-sm">
                        {mode === 'distance' ? (
                            distance > 0 ? `${distance.toFixed(2)} km` : "Click points..."
                        ) : (
                            area > 0 ? `${area.toFixed(2)} km\u00b2` : "Click 3+ points..."
                        )}
                    </div>
                </div>
            )}
            
            <div className="bg-black/60 backdrop-blur text-white p-2 text-[9px] font-mono shadow-lg rounded-none pointer-events-none">
                {mouseCoords.lat.toFixed(6)}, {mouseCoords.lng.toFixed(6)}
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

function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])
  return null
}

interface GlobalScreeningMapProps {
  screenings: any[]
  facilities?: any[]
  isLoading?: boolean
}

export default function GlobalScreeningMap({ screenings, facilities = [], isLoading }: GlobalScreeningMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  
  // GIS States
  const [mode, setMode] = useState<'none' | 'distance' | 'area'>('none')
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([])
  const [mouseCoords, setMouseCoords] = useState({ lat: 0, lng: 0 })
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalArea, setTotalArea] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Memoize icons to ensure they are created on client side
  const icons = useMemo(() => {
    if (typeof window === 'undefined' || !isMounted) return null;
    return {
        default: L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        }),
        facility: L.divIcon({
            html: '<div class="bg-primary text-white p-1 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>',
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        })
    }
  }, [isMounted])

  useEffect(() => {
    if (screenings.length > 0) {
      const coords = screenings
        .filter(s => s.coordinates?.latitude && s.coordinates?.longitude)
        .map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number])
      
      if (coords.length > 0) {
        setMapBounds(L.latLngBounds(coords))
      }
    }
  }, [screenings])

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

  if (!isMounted || !icons) {
    return <div className="h-[calc(100vh-250px)] w-full bg-muted/30 animate-pulse" />
  }

  const getRiskColor = (interpretation: string) => {
    if (interpretation?.includes('HIGH')) return "#ef4444" // Red-500
    if (interpretation?.includes('MEDIUM') || interpretation?.includes('MODERATE')) return "#f59e0b" // Amber-500
    return "#10b981" // Emerald-500
  }

  return (
    <div className="h-[calc(100vh-250px)] w-full overflow-hidden border border-border bg-background relative group">
      <MapContainer 
        center={[-1.286389, 36.817223]} // Default to Nairobi
        zoom={7} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <MapEvents 
            onMouseMove={setMouseCoords} 
            onClick={handleMapClick}
        />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Modern Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Imagery">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {mapBounds && <ChangeView bounds={mapBounds} />}

        {/* GIS Polyline/Polygon */}
        {mode === 'distance' && measurePoints.length > 0 && (
            <Polyline 
                positions={measurePoints} 
                pathOptions={{ color: 'black', weight: 3, dashArray: '5, 10' }} 
            />
        )}
        {mode === 'area' && measurePoints.length > 0 && (
            <Polygon 
                positions={measurePoints} 
                pathOptions={{ color: 'primary', fillColor: 'primary', fillOpacity: 0.2, weight: 2 }} 
            />
        )}

        {/* Screening Points */}
        {screenings.map((s) => {
          if (!s.coordinates?.latitude || !s.coordinates?.longitude) return null
          const interpretation = s.scoringResult?.interpretation || "LOW_RISK"
          const color = getRiskColor(interpretation)

          return (
            <CircleMarker
              key={s.id}
              center={[s.coordinates.latitude, s.coordinates.longitude]}
              radius={8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.8,
                color: "white",
                weight: 2
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`font-black uppercase text-[9px] border-none px-2 rounded-full ${
                      interpretation.includes('HIGH') ? 'bg-rose-500/10 text-rose-600' : 
                      interpretation.includes('MEDIUM') ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {interpretation.replace('_', ' ')}
                    </Badge>
                    <span className="text-[9px] font-mono text-muted-foreground">{dayjs(s.createdAt).format('DD/MM/YY')}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-muted">
                            <User className="h-3 w-3 text-foreground" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-0.5">Patient</p>
                            <p className="text-xs font-bold text-foreground">{s.client?.firstName} {s.client?.lastName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-muted">
                            <Activity className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-0.5">Provider</p>
                            <p className="text-xs font-bold text-foreground">{s.provider?.firstName} {s.provider?.lastName}</p>
                        </div>
                    </div>

                    {s.referrals && s.referrals.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                             <div className="flex items-center gap-2 text-primary">
                                <Hospital className="h-3 w-3" />
                                <p className="text-[10px] font-black uppercase tracking-tight">Referred to {s.referrals[0].healthFacility?.name}</p>
                             </div>
                        </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Health Facilities */}
        {facilities.map((f) => {
          if (!f.coordinates?.latitude || !f.coordinates?.longitude) return null
          return (
            <Marker 
                key={f.id} 
                position={[f.coordinates.latitude, f.coordinates.longitude]} 
                icon={icons.facility}
            >
              <Popup>
                <div className="p-1">
                  <p className="text-[9px] font-black text-primary uppercase mb-0.5">Health Facility</p>
                  <p className="text-sm font-bold text-foreground">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.county}, {f.subcounty}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur border border-border p-4 space-y-3 pointer-events-auto rounded-none shadow-none">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="h-3 w-3" /> Map Legend
              </h4>
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-none" />
                      <span className="text-xs font-bold text-foreground/80">High Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-none" />
                      <span className="text-xs font-bold text-foreground/80">Moderate Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-none" />
                      <span className="text-xs font-bold text-foreground/80">Low Risk Patient</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-none flex items-center justify-center">
                         <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-foreground/80">Health Facility</span>
                  </div>
              </div>
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
