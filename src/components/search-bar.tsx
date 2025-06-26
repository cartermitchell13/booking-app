'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/lib/search-context'
import { CalendarDays, MapPin, Users, ArrowLeftRight, Search } from 'lucide-react'
import { LocationSelect } from './location-select'
import { DatePicker } from './date-picker'
import { PassengerSelector } from './passenger-selector'
import { TripTypeToggle } from './trip-type-toggle'

export function SearchBar() {
  const router = useRouter()
  const search = useSearch()
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    
    try {
      // Build search URL with parameters
      const params = new URLSearchParams()
      
      if (search.destinationId) {
        params.set('destination', search.destinationId)
      }
      if (search.outboundDate) {
        params.set('date_from', search.outboundDate)
      }
      if (search.inboundDate && search.tripType === 'round-trip') {
        params.set('date_to', search.inboundDate)
      }
      
      const totalPassengers = search.passengers.adults + search.passengers.children + search.passengers.students
      if (totalPassengers > 0) {
        params.set('passengers', totalPassengers.toString())
      }
      
      // Navigate to search page with parameters
      router.push(`/search?${params.toString()}`)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSearchDisabled = false // Allow searching with any parameters

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Trip Type Toggle */}
      <div className="mb-4">
        <TripTypeToggle 
          value={search.tripType}
          onChange={search.setTripType}
        />
      </div>

      {/* Main Search Bar */}
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#faf6e1', border: '3px solid #637752' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Origin Selection */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium mb-2" style={{ color: '#21452e' }}>
              <MapPin className="inline w-4 h-4 mr-1" />
              From
            </label>
            <LocationSelect
              value={search.originId}
              onChange={search.setOriginId}
              placeholder="Select departure city"
              excludeId={search.destinationId}
            />
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const temp = search.originId
                if (search.destinationId) search.setOriginId(search.destinationId)
                if (temp) search.setDestinationId(temp)
              }}
              className="p-2 rounded-full transition-colors"
              style={{ 
                border: '1px solid #637752',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#faf9f6'
                e.currentTarget.style.borderColor = '#21452e'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = '#637752'
              }}
              disabled={!search.originId || !search.destinationId}
            >
              <ArrowLeftRight className="w-4 h-4" style={{ color: '#637752' }} />
            </button>
          </div>

          {/* Destination Selection */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium mb-2" style={{ color: '#21452e' }}>
              <MapPin className="inline w-4 h-4 mr-1" />
              To
            </label>
            <LocationSelect
              value={search.destinationId}
              onChange={search.setDestinationId}
              placeholder="Select destination"
              excludeId={search.originId}
            />
          </div>

          {/* Outbound Date */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: '#21452e' }}>
              <CalendarDays className="inline w-4 h-4 mr-1" />
              Departure
            </label>
            <DatePicker
              value={search.outboundDate}
              onChange={search.setOutboundDate}
              placeholder="Select date"
              minDate={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Return Date (if round trip) */}
          {search.tripType === 'round-trip' && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#21452e' }}>
                <CalendarDays className="inline w-4 h-4 mr-1" />
                Return
              </label>
              <DatePicker
                value={search.inboundDate || ''}
                onChange={(date: string) => search.setInboundDate(date || undefined)}
                placeholder="Select date"
                minDate={search.outboundDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Passengers */}
          <div className={search.tripType === 'round-trip' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#21452e' }}>
              <Users className="inline w-4 h-4 mr-1" />
              Passengers
            </label>
            <PassengerSelector
              value={search.passengers}
              onChange={search.setPassengers}
            />
          </div>

          {/* Search Button */}
          <div className={search.tripType === 'round-trip' ? 'lg:col-span-1' : 'lg:col-span-1'}>
            <button
              onClick={handleSearch}
              disabled={isSearchDisabled || isLoading}
              className="w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              style={{
                backgroundColor: isSearchDisabled || isLoading ? '#e8e5de' : '#21452e',
                color: isSearchDisabled || isLoading ? '#637752' : '#faf6e1',
                cursor: isSearchDisabled || isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSearchDisabled && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#637752'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSearchDisabled && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#21452e'
                }
              }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#faf6e1' }}></div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 