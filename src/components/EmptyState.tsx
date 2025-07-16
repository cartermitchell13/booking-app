import { MapPin, SlidersHorizontal } from 'lucide-react'
import { useTenantBranding } from '@/lib/tenant-context'

interface EmptyStateProps {
  type: 'no-trips' | 'no-filtered-results'
  onClearFilters?: () => void
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  const branding = useTenantBranding()

  if (type === 'no-trips') {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>
          No offerings available
        </h3>
        <p className="text-gray-600">Check back soon for new adventures!</p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <SlidersHorizontal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>
        No offerings match your filters
      </h3>
      <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: branding.primary_color || '#10B981' }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
} 