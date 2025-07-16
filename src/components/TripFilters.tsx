import { useTenantBranding } from '@/lib/tenant-context'
import { TripFilters as TripFiltersType } from '@/hooks/useTripFilters'

interface TripFiltersProps {
  filters: TripFiltersType
  onFilterChange: (filterType: keyof TripFiltersType, value: string) => void
}

export function TripFilters({ filters, onFilterChange }: TripFiltersProps) {
  const branding = useTenantBranding()

  // Get smart text colors for different backgrounds
  const cardTextColor = branding.textOnForeground  // For text on card background
  const backgroundTextColor = branding.textOnBackground  // For text on page background

  return (
    <div 
      className="mt-4 p-3 sm:p-4 rounded-lg border-2" 
      style={{ 
        backgroundColor: branding.foreground_color || '#F9FAFB',
        borderColor: branding.accent_color || '#637752'
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: cardTextColor }}>
            Price Range
          </label>
          <select 
            className="w-full border rounded-md px-3 py-3 min-h-[44px] focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
            style={{ 
              borderColor: branding.accent_color || '#637752',
              backgroundColor: branding.background_color || '#FFFFFF',
              color: backgroundTextColor,
              '--tw-ring-color': branding.primary_color || '#10B981'
            } as any}
            value={filters.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
          >
            <option value="any">Any price</option>
            <option value="under-100">Under $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="over-500">Over $500</option>
          </select>
        </div>
        <div>
          <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: cardTextColor }}>
            Duration
          </label>
          <select 
            className="w-full border rounded-md px-3 py-3 min-h-[44px] focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
            style={{ 
              borderColor: branding.accent_color || '#637752',
              backgroundColor: branding.background_color || '#FFFFFF',
              color: backgroundTextColor,
              '--tw-ring-color': branding.primary_color || '#10B981'
            } as any}
            value={filters.duration}
            onChange={(e) => onFilterChange('duration', e.target.value)}
          >
            <option value="any">Any duration</option>
            <option value="half-day">Half day</option>
            <option value="full-day">Full day</option>
            <option value="multi-day">Multi-day</option>
          </select>
        </div>
        <div>
          <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: cardTextColor }}>
            Category
          </label>
          <select 
            className="w-full border rounded-md px-3 py-3 min-h-[44px] focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
            style={{ 
              borderColor: branding.accent_color || '#637752',
              backgroundColor: branding.background_color || '#FFFFFF',
              color: backgroundTextColor,
              '--tw-ring-color': branding.primary_color || '#10B981'
            } as any}
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="any">All categories</option>
            <option value="adventure">Adventure</option>
            <option value="wildlife">Wildlife</option>
            <option value="sightseeing">Sightseeing</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>
        <div>
          <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: cardTextColor }}>
            Availability
          </label>
          <select 
            className="w-full border rounded-md px-3 py-3 min-h-[44px] focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
            style={{ 
              borderColor: branding.accent_color || '#637752',
              backgroundColor: branding.background_color || '#FFFFFF',
              color: backgroundTextColor,
              '--tw-ring-color': branding.primary_color || '#10B981'
            } as any}
            value={filters.availability}
            onChange={(e) => onFilterChange('availability', e.target.value)}
          >
            <option value="any">All dates</option>
            <option value="this-week">This week</option>
            <option value="this-month">This month</option>
            <option value="next-3-months">Next 3 months</option>
          </select>
        </div>
      </div>
    </div>
  )
} 