'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SearchContextType, SearchParams } from '@/types'

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const defaultSearchParams: SearchParams = {
  destinationId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
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
      destinationId: urlParams.get('destination') || undefined,
      dateFrom: urlParams.get('date_from') || undefined,
      dateTo: urlParams.get('date_to') || undefined,
    }

    setSearchState(newState)
  }, [searchParams])

  // Update URL when state changes
  const updateURL = (newState: SearchParams) => {
    const params = new URLSearchParams()
    
    if (newState.destinationId) params.set('destination', newState.destinationId)
    if (newState.dateFrom) params.set('date_from', newState.dateFrom)
    if (newState.dateTo) params.set('date_to', newState.dateTo)

    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  const contextValue: SearchContextType = {
    ...searchState,
    setDestinationId: (id: string) => {
      const newState = { ...searchState, destinationId: id }
      setSearchState(newState)
      updateURL(newState)
    },
    setDateFrom: (date: string | undefined) => {
      const newState = { ...searchState, dateFrom: date }
      setSearchState(newState)
      updateURL(newState)
    },
    setDateTo: (date: string | undefined) => {
      const newState = { ...searchState, dateTo: date }
      setSearchState(newState)
      updateURL(newState)
    },
    setDateRange: (dateFrom: string | undefined, dateTo: string | undefined) => {
      const newState = { ...searchState, dateFrom, dateTo }
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