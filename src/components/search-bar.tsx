'use client'

import { useState, useEffect } from 'react'
import { useTenant, useTenantBranding, useTenantSupabase } from '@/lib/tenant-context'
import { MapPin, Search } from 'lucide-react'
import { LocationSelect } from './location-select'
import { DateRangePicker } from './date-range-picker'
import { ButtonLoading } from '@/components/ui'

interface SearchBarProps {
  destination?: string
  dateFrom?: string
  dateTo?: string
  onSearch: (destination: string, dateFrom?: string, dateTo?: string) => void
}

export function SearchBar({ 
  destination = '',
  dateFrom = '',
  dateTo = '',
  onSearch 
}: SearchBarProps) {
  const branding = useTenantBranding()
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<any[]>([])
  const [localDestination, setLocalDestination] = useState(destination)
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom)
  const [localDateTo, setLocalDateTo] = useState(dateTo)
  const { getLocations } = useTenantSupabase()
  
  // Sync with external values
  useEffect(() => {
    setLocalDestination(destination)
    setLocalDateFrom(dateFrom)
    setLocalDateTo(dateTo)
  }, [destination, dateFrom, dateTo])
  
  // Load locations for ID to name mapping
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationData = await getLocations()
        setLocations(locationData)
      } catch (error) {
        console.error('Error loading locations:', error)
      }
    }
    
    loadLocations()
  }, [getLocations])
  
  // Get optimal text color for foreground background
  const textColor = branding.textOnForeground

  const handleSearch = async () => {
    setIsLoading(true)
    
    try {
      // Validate search inputs
      if (localDateFrom && localDateTo) {
        const dateFromObj = new Date(localDateFrom)
        const dateToObj = new Date(localDateTo)
        
        if (dateToObj < dateFromObj) {
          console.error('End date cannot be before start date')
          // You could show a toast notification here
          return
        }
      }
      
      // Validate dates are not in the past
      if (localDateFrom) {
        const dateFromObj = new Date(localDateFrom)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (dateFromObj < today) {
          console.error('Start date cannot be in the past')
          // You could show a toast notification here
          return
        }
      }
      
      // Get destination name from location ID if needed
      let destinationName = localDestination
      if (localDestination && locations.length > 0) {
        const destinationLocation = locations.find(loc => loc.id === localDestination)
        if (destinationLocation) {
          destinationName = destinationLocation.name
        }
      }
      
      // Call the search function
      onSearch(destinationName, localDateFrom || undefined, localDateTo || undefined)
    } catch (error) {
      console.error('Search error:', error)
      // You could show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  const handleDestinationChange = (destinationId: string) => {
    setLocalDestination(destinationId)
    // Optionally trigger search immediately on destination change
    // onSearch(destinationId, localDateFrom || undefined, localDateTo || undefined)
  }

  const handleDateRangeChange = (dateFrom: string | undefined, dateTo: string | undefined) => {
    setLocalDateFrom(dateFrom || '')
    setLocalDateTo(dateTo || '')
    // Optionally trigger search immediately on date range change
    // onSearch(localDestination, dateFrom, dateTo)
  }

  return (
    <div className="w-full">
      {/* Main Search Bar */}
      <div 
        className="rounded-2xl shadow-lg p-4 sm:p-6" 
        data-search-bar-container
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          border: `3px solid ${branding.primary_color || '#21452e'}` 
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          
          {/* Destination Selection */}
          <div className="flex-1 min-w-0">
            <label 
              className="block text-sm md:text-base font-medium mb-2"
              style={{ color: textColor }}
            >
              <MapPin className="inline w-4 h-4 mr-1" />
              Location
            </label>
            <LocationSelect
              value={localDestination}
              onChange={handleDestinationChange}
              placeholder="Select location"
            />
          </div>

          {/* Date Range Selection */}
          <div className="flex-1 min-w-0">
            <label 
              className="block text-sm md:text-base font-medium mb-2"
              style={{ color: textColor }}
            >
              Dates
            </label>
            <DateRangePicker
              dateFrom={localDateFrom}
              dateTo={localDateTo}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Search Button */}
          <div className="w-full sm:w-auto">
            <ButtonLoading
              loading={isLoading}
              onClick={handleSearch}
              disabled={false}
              size="md"
              variant="primary"
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 text-sm font-semibold whitespace-nowrap"
            >
              <div className="flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                <span>Search</span>
              </div>
            </ButtonLoading>
          </div>
        </div>
      </div>
    </div>
  )
} 