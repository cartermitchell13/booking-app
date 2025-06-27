'use client'

import { useTenantBranding } from '@/lib/tenant-context'

interface TripTypeToggleProps {
  value: 'one-way' | 'round-trip'
  onChange: (type: 'one-way' | 'round-trip') => void
}

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  const branding = useTenantBranding()
  
  return (
    <div className="flex rounded-lg p-1 w-fit" style={{ backgroundColor: '#f3f4f6' }}>
      <button
        type="button"
        onClick={() => onChange('one-way')}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: value === 'one-way' ? '#ffffff' : 'transparent',
          color: value === 'one-way' ? branding.primary_color || '#21452e' : branding.secondary_color || '#637752',
          boxShadow: value === 'one-way' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        Single
      </button>
      <button
        type="button"
        onClick={() => onChange('round-trip')}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: value === 'round-trip' ? '#ffffff' : 'transparent',
          color: value === 'round-trip' ? branding.primary_color || '#21452e' : branding.secondary_color || '#637752',
          boxShadow: value === 'round-trip' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        Return
      </button>
    </div>
  )
} 