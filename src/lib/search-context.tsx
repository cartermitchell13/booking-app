'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SearchContextType, SearchParams, PassengerCounts } from '@/types'

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const defaultPassengers: PassengerCounts = {
  adults: 1,
  students: 0,
  children: 0,
}

const defaultSearchParams: SearchParams = {
  originId: undefined,
  destinationId: undefined,
  outboundDate: '',
  inboundDate: undefined,
  passengers: defaultPassengers,
  tripType: 'one-way',
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchState, setSearchState] = useState<SearchParams>(defaultSearchParams)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Sync URL params with state on mount and URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams)
    
    const newState: SearchParams = {
      originId: urlParams.get('from') || undefined,
      destinationId: urlParams.get('to') || undefined,
      outboundDate: urlParams.get('outbound') || '',
      inboundDate: urlParams.get('inbound') || undefined,
      passengers: {
        adults: parseInt(urlParams.get('adults') || '1'),
        students: parseInt(urlParams.get('students') || '0'),
        children: parseInt(urlParams.get('children') || '0'),
      },
      tripType: (urlParams.get('type') as 'one-way' | 'round-trip') || 'one-way',
    }

    setSearchState(newState)
  }, [searchParams])

  // Update URL when state changes
  const updateURL = (newState: SearchParams) => {
    const params = new URLSearchParams()
    
    if (newState.originId) params.set('from', newState.originId)
    if (newState.destinationId) params.set('to', newState.destinationId)
    if (newState.outboundDate) params.set('outbound', newState.outboundDate)
    if (newState.inboundDate) params.set('inbound', newState.inboundDate)
    if (newState.passengers.adults > 0) params.set('adults', newState.passengers.adults.toString())
    if (newState.passengers.students > 0) params.set('students', newState.passengers.students.toString())
    if (newState.passengers.children > 0) params.set('children', newState.passengers.children.toString())
    params.set('type', newState.tripType)

    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  const contextValue: SearchContextType = {
    ...searchState,
    setOriginId: (id: string) => {
      const newState = { ...searchState, originId: id }
      setSearchState(newState)
      updateURL(newState)
    },
    setDestinationId: (id: string) => {
      const newState = { ...searchState, destinationId: id }
      setSearchState(newState)
      updateURL(newState)
    },
    setOutboundDate: (date: string) => {
      const newState = { ...searchState, outboundDate: date }
      setSearchState(newState)
      updateURL(newState)
    },
    setInboundDate: (date: string | undefined) => {
      const newState = { ...searchState, inboundDate: date }
      setSearchState(newState)
      updateURL(newState)
    },
    setPassengers: (passengers: PassengerCounts) => {
      const newState = { ...searchState, passengers }
      setSearchState(newState)
      updateURL(newState)
    },
    setTripType: (type: 'one-way' | 'round-trip') => {
      const newState = { ...searchState, tripType: type }
      // Clear inbound date if switching to one-way
      if (type === 'one-way') {
        newState.inboundDate = undefined
      }
      setSearchState(newState)
      updateURL(newState)
    },
    reset: () => {
      const newState = defaultSearchParams
      setSearchState(newState)
      updateURL(newState)
    },
  }

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
} 