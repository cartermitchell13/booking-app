import { useState } from 'react'
import { TenantTrip } from '@/types'

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatCalendarDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getTripsForDate = (day: number, trips: TenantTrip[]) => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return trips.filter(trip => {
      // Check if trip departure occurs on this date
      const tripDate = new Date(trip.departure_time)
      return tripDate.toDateString() === targetDate.toDateString()
    })
  }

  const getAvailabilityStatus = (dayTrips: TenantTrip[]) => {
    if (dayTrips.length === 0) return 'none'
    
    const totalAvailable = dayTrips.reduce((sum, trip) => sum + trip.available_seats, 0)
    const totalCapacity = dayTrips.reduce((sum, trip) => sum + trip.max_passengers, 0)
    const availabilityRatio = totalAvailable / totalCapacity
    
    if (availabilityRatio > 0.7) return 'high' // Green - lots of availability
    if (availabilityRatio > 0.3) return 'medium' // Orange - limited availability  
    if (availabilityRatio > 0) return 'low' // Red - very limited
    return 'full' // Gray - sold out
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'high': return '#10B981' // Green
      case 'medium': return '#F59E0B' // Orange
      case 'low': return '#EF4444' // Red
      case 'full': return '#6B7280' // Gray
      default: return 'transparent'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  return {
    currentMonth,
    setCurrentMonth,
    getDaysInMonth,
    getFirstDayOfMonth,
    formatCalendarDate,
    getTripsForDate,
    getAvailabilityStatus,
    getAvailabilityColor,
    navigateMonth,
    formatTime,
    formatPrice
  }
} 