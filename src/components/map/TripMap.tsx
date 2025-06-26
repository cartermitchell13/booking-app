'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { TenantTrip } from '@/types'
import { useTenantBranding } from '@/lib/tenant-context'
import Link from 'next/link'
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
              <Popup>
                <div className="min-w-[200px] p-2">
                  <div className="aspect-video relative mb-3 rounded-lg overflow-hidden bg-gray-100">
                    {trip.image_url ? (
                      <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {trip.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {trip.destination}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg" style={{ color: branding.primary_color || '#10B981' }}>
                      {formatPrice(trip.price_adult)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {trip.available_seats} spots left
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/trip/${trip.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/booking/${trip.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: branding.primary_color || '#10B981' }}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default TripMap 