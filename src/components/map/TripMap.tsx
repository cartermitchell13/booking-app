'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { TenantTrip } from '@/types'
import { useTenantBranding } from '@/lib/tenant-context'
import Link from 'next/link'
import { MapPin, Clock, Users, Star } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface TripMapProps {
  trips: TenantTrip[]
  selectedTripId?: string
  onTripSelect?: (tripId: string) => void
  className?: string
}

// Custom marker icon with brand colors
const createCustomIcon = (color: string, isSelected: boolean = false) => {
  const iconSize: [number, number] = isSelected ? [30, 50] : [25, 41]
  const iconAnchor: [number, number] = isSelected ? [15, 50] : [12, 41]
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize[0]}" height="${iconSize[1]}">
        <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>
    `)}`,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: [1, -34]
  })
}

// Component to fit map bounds to markers
function MapBounds({ trips }: { trips: TenantTrip[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (trips.length === 0) return
    
    const validTrips = trips.filter(trip => 
      trip.destination_lat && trip.destination_lng
    )
    
    if (validTrips.length === 0) return
    
    if (validTrips.length === 1) {
      // If only one trip, center on it
      const trip = validTrips[0]
      map.setView([trip.destination_lat!, trip.destination_lng!], 10)
    } else {
      // If multiple trips, fit bounds to show all
      const bounds = new LatLngBounds(
        validTrips.map(trip => [trip.destination_lat!, trip.destination_lng!])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [trips, map])
  
  return null
}

export function TripMap({ trips, selectedTripId, onTripSelect, className }: TripMapProps) {
  const branding = useTenantBranding()
  const mapRef = useRef<L.Map>(null)
  
  // Filter trips that have coordinates
  const tripsWithCoords = trips.filter(trip => 
    trip.destination_lat && trip.destination_lng
  )
  
  // Default center (Calgary, Alberta - good for Western Canada tours)
  const defaultCenter: [number, number] = [51.0447, -114.0719]
  const defaultZoom = 6
  
  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Format duration for display
  const formatDuration = (departure: string, returnTime?: string) => {
    if (!returnTime) return 'Day Trip'
    
    const startDate = new Date(departure)
    const endDate = new Date(returnTime)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Day Trip'
    return `${diffDays} Days`
  }
  
  return (
    <div className={className || "h-96 w-full rounded-lg overflow-hidden border border-gray-200"}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Automatically fit bounds to show all trips */}
        <MapBounds trips={tripsWithCoords} />
        
        {/* Trip markers */}
        {tripsWithCoords.map((trip) => {
          const isSelected = selectedTripId === trip.id
          const markerIcon = createCustomIcon(
            branding.primary_color || '#10B981',
            isSelected
          )
          
          return (
            <Marker
              key={trip.id}
              position={[trip.destination_lat!, trip.destination_lng!]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onTripSelect?.(trip.id)
              }}
            >
              <Popup
                closeButton={false}
                className="custom-popup"
              >
                <div 
                  className="min-w-[280px] max-w-[320px] bg-white rounded-xl shadow-2xl border-0 overflow-hidden"
                  style={{ 
                    backgroundColor: branding.foreground_color || '#FFFFFF',
                    color: branding.textOnForeground || '#111827'
                  }}
                >
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] w-full bg-gray-100">
                    {trip.image_url ? (
                      <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    <div 
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: branding.primary_color || '#10B981' }}
                    >
                      {formatPrice(trip.price_adult)}
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(trip.departure_time, trip.return_time)}
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                      {trip.title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3 text-sm opacity-75">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    
                    {/* Trip Details */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-1.5 opacity-75">
                        <Users className="w-4 h-4" />
                        <span>{trip.available_seats} spots left</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs opacity-60">(124)</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/trip/${trip.id}`}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-center border-2 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{ 
                          borderColor: branding.primary_color || '#10B981',
                          color: branding.primary_color || '#10B981'
                        }}
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/booking/${trip.id}`}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        style={{ 
                          backgroundColor: branding.primary_color || '#10B981',
                          color: branding.textOnPrimary || '#FFFFFF'
                        }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border-radius: 12px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          padding: 0 !important;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: ${branding.foreground_color || '#FFFFFF'} !important;
          border: none !important;
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1) !important;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default TripMap 