'use client'

import { Map, List } from 'lucide-react'

interface ViewToggleProps {
  view: 'list' | 'map'
  onViewChange: (view: 'list' | 'map') => void
  className?: string
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-lg p-1 ${className || ''}`}>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="w-4 h-4" />
        List
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'map'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  )
}

export default ViewToggle 