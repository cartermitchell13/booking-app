import { useState, useEffect, useMemo } from 'react'
import { TenantTrip } from '@/types'

export interface TripFilters {
  priceRange: string
  duration: string
  category: string
  availability: string
  destination: string
  dateFrom: string
  dateTo: string
}

const defaultFilters: TripFilters = {
  priceRange: 'any',
  duration: 'any',
  category: 'any',
  availability: 'any',
  destination: '',
  dateFrom: '',
  dateTo: ''
}

export function useTripFilters(trips: TenantTrip[]) {
  const [filters, setFilters] = useState<TripFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)

  // Filter trips based on current filter state
  const filteredTrips = useMemo(() => {
    let filtered = [...trips]

    // Location filter (searches both destinations and departure locations)
    if (filters.destination && filters.destination.trim() !== '') {
      filtered = filtered.filter(trip => {
        const searchText = filters.destination.toLowerCase()
        return (
          trip.destination.toLowerCase().includes(searchText) ||
          trip.departure_location.toLowerCase().includes(searchText) ||
          trip.title.toLowerCase().includes(searchText) ||
          (trip.description && trip.description.toLowerCase().includes(searchText))
        )
      })
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.departure_time)
        tripDate.setHours(0, 0, 0, 0) // Normalize to start of day
        
        let passesDateFilter = true
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          passesDateFilter = passesDateFilter && tripDate >= fromDate
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo)
          toDate.setHours(23, 59, 59, 999) // End of day
          passesDateFilter = passesDateFilter && tripDate <= toDate
        }
        
        return passesDateFilter
      })
    }

    // Price range filter
    if (filters.priceRange !== 'any') {
      filtered = filtered.filter(trip => {
        const price = trip.price_adult / 100 // Convert cents to dollars
        switch (filters.priceRange) {
          case 'under-100': return price < 100
          case '100-200': return price >= 100 && price <= 200
          case '200-500': return price >= 200 && price <= 500
          case 'over-500': return price > 500
          default: return true
        }
      })
    }

    // Duration filter (rough estimate based on departure/return times)
    if (filters.duration !== 'any') {
      filtered = filtered.filter(trip => {
        if (!trip.return_time) return filters.duration === 'half-day' // Assume no return time means short trip
        
        const departure = new Date(trip.departure_time)
        const returnTime = new Date(trip.return_time)
        const durationHours = (returnTime.getTime() - departure.getTime()) / (1000 * 60 * 60)
        
        switch (filters.duration) {
          case 'half-day': return durationHours <= 6
          case 'full-day': return durationHours > 6 && durationHours <= 24
          case 'multi-day': return durationHours > 24
          default: return true
        }
      })
    }

    // Category filter (basic keyword matching in title/description)
    if (filters.category !== 'any') {
      filtered = filtered.filter(trip => {
        const searchText = `${trip.title} ${trip.description}`.toLowerCase()
        switch (filters.category) {
          case 'adventure': return searchText.includes('adventure') || searchText.includes('hiking') || searchText.includes('outdoor')
          case 'wildlife': return searchText.includes('wildlife') || searchText.includes('animal') || searchText.includes('nature')
          case 'sightseeing': return searchText.includes('scenic') || searchText.includes('sightseeing') || searchText.includes('tour')
          case 'cultural': return searchText.includes('cultural') || searchText.includes('heritage') || searchText.includes('museum')
          default: return true
        }
      })
    }

    // Availability filter
    if (filters.availability !== 'any') {
      const now = new Date()
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.departure_time)
        switch (filters.availability) {
          case 'this-week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return tripDate >= now && tripDate <= weekFromNow
          case 'this-month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
            return tripDate >= now && tripDate <= monthFromNow
          case 'next-3-months':
            const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
            return tripDate >= now && tripDate <= threeMonthsFromNow
          default: return true
        }
      })
    }

    return filtered
  }, [trips, filters])

  // Handle filter changes
  const handleFilterChange = (filterType: keyof TripFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Set search filters (for SearchBar integration)
  const setSearchFilters = (destination: string, dateFrom?: string, dateTo?: string) => {
    setFilters(prev => ({
      ...prev,
      destination: destination || '',
      dateFrom: dateFrom || '',
      dateTo: dateTo || ''
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.destination !== '' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      Object.entries(filters).some(([key, value]) => 
        !['destination', 'dateFrom', 'dateTo'].includes(key) && value !== 'any'
      )
    )
  }, [filters])

  return {
    filters,
    filteredTrips,
    showFilters,
    setShowFilters,
    handleFilterChange,
    setSearchFilters,
    clearFilters,
    hasActiveFilters
  }
} 