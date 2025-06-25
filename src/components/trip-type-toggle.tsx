'use client'

interface TripTypeToggleProps {
  value: 'one-way' | 'round-trip'
  onChange: (type: 'one-way' | 'round-trip') => void
}

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  return (
    <div className="flex rounded-lg p-1 w-fit" style={{ backgroundColor: '#e8e5de' }}>
      <button
        type="button"
        onClick={() => onChange('one-way')}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: value === 'one-way' ? '#faf6e1' : 'transparent',
          color: value === 'one-way' ? '#21452e' : '#637752',
          boxShadow: value === 'one-way' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        One Way
      </button>
      <button
        type="button"
        onClick={() => onChange('round-trip')}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: value === 'round-trip' ? '#faf6e1' : 'transparent',
          color: value === 'round-trip' ? '#21452e' : '#637752',
          boxShadow: value === 'round-trip' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        Round Trip
      </button>
    </div>
  )
} 