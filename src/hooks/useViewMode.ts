import { useState } from 'react'

export type ViewMode = 'grid' | 'list' | 'map' | 'calendar'

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedTripId, setSelectedTripId] = useState<string>()

  // Handle trip selection from map or other interactions
  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(tripId)
    // Scroll to trip card if in grid/list view, or just highlight on map
    if (viewMode !== 'map') {
      const element = document.getElementById(`trip-${tripId}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Clear trip selection
  const clearTripSelection = () => {
    setSelectedTripId(undefined)
  }

  return {
    viewMode,
    setViewMode,
    selectedTripId,
    setSelectedTripId,
    handleTripSelect,
    clearTripSelection
  }
} 