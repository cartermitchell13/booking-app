'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { Location } from '@/types'
import { useTenantSupabase } from '@/lib/tenant-context'

interface LocationSelectProps {
  value?: string
  onChange: (locationId: string) => void
  placeholder?: string
  excludeId?: string
}

export function LocationSelect({ 
  value, 
  onChange, 
  placeholder = "Select location",
  excludeId 
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { getLocations } = useTenantSupabase()

  // Load locations from database
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true)
        const locationData = await getLocations()
        
        // Validate location data
        if (!locationData || locationData.length === 0) {
          console.warn('No locations found')
          setLocations([])
          return
        }
        
        // Filter out invalid locations
        const validLocations = locationData.filter(location => 
          location && location.name && location.name.trim() !== ''
        )
        
        setLocations(validLocations)
      } catch (error) {
        console.error('Error loading locations:', error)
        setLocations([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    loadLocations()
  }, [getLocations])

  const selectedLocation = locations.find(loc => loc.id === value)

  const filteredLocations = locations.filter(location => {
    if (location.id === excludeId) return false
    if (!searchTerm) return true
    return location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           location.city.toLowerCase().includes(searchTerm.toLowerCase())
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (location: Location) => {
    onChange(location.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between text-sm sm:text-base"
      >
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <span className={selectedLocation ? 'text-gray-900' : 'text-gray-500'}>
            {selectedLocation ? selectedLocation.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search locations..."
                className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Locations List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <div className="mt-2 text-sm sm:text-base">Loading locations...</div>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                {searchTerm ? 'No locations found' : 'No locations available'}
              </div>
            ) : (
              <div className="py-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => handleSelect(location)}
                    className="w-full px-4 py-3 min-h-[44px] text-left hover:bg-gray-50 focus:bg-gray-50 flex items-center space-x-3"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">{location.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{location.city}, {location.province}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 