import { Grid, List, Map, Calendar } from 'lucide-react'
import { useTenantBranding } from '@/lib/tenant-context'
import { ViewMode } from '@/hooks/useViewMode'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const branding = useTenantBranding()

  // Get smart text colors for different backgrounds
  const foregroundTextColor = branding.textOnForeground  // For text on foreground elements
  const backgroundTextColor = branding.textOnBackground  // For text on background elements

  const views = [
    { mode: 'grid', icon: Grid, label: 'Grid' },
    { mode: 'list', icon: List, label: 'List' },
    { mode: 'map', icon: Map, label: 'Map' },
    { mode: 'calendar', icon: Calendar, label: 'Calendar' }
  ] as const

  return (
    <div className="w-full sm:w-auto">
      {/* Mobile: Full width with labels */}
      <div className="sm:hidden grid grid-cols-4 gap-2 p-2 rounded-lg" style={{ backgroundColor: branding.foreground_color || '#F3F4F6' }}>
        {views.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors hover:opacity-80 min-h-[64px] ${
              viewMode === mode ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: viewMode === mode ? (branding.background_color || '#FFFFFF') : 'transparent',
              color: viewMode === mode ? backgroundTextColor : foregroundTextColor
            }}
            aria-label={`${label} view`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Desktop: Compact icon-only layout */}
      <div className="hidden sm:flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: branding.foreground_color || '#F3F4F6' }}>
        {views.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`p-3 rounded-md transition-colors hover:opacity-80 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              viewMode === mode ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: viewMode === mode ? (branding.background_color || '#FFFFFF') : 'transparent',
              color: viewMode === mode ? backgroundTextColor : foregroundTextColor
            }}
            aria-label={`${label} view`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  )
} 