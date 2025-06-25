'use client'

import { CalendarDays } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  minDate?: string
  maxDate?: string
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  minDate,
  maxDate 
}: DatePickerProps) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className="date-input w-full px-4 py-3 rounded-lg transition-all duration-200"
        style={{
          border: '1px solid #e8e5de',
          backgroundColor: '#faf9f6',
          color: value ? '#21452e' : 'transparent',
          fontSize: '14px',
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#637752'
          e.currentTarget.style.outline = 'none'
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 119, 82, 0.1)'
          e.currentTarget.style.color = '#21452e'
          e.currentTarget.style.backgroundColor = '#ffffff'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e8e5de'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.backgroundColor = '#faf9f6'
          if (!value) {
            e.currentTarget.style.color = 'transparent'
          }
        }}
      />
      {!value && (
        <div 
          className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
          style={{ color: '#637752' }}
        >
          <CalendarDays className="w-5 h-5 mr-2" />
          <span className="text-sm">{placeholder}</span>
        </div>
      )}
      
      {/* Calendar icon for when date is selected */}
      {value && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
          style={{ color: '#637752' }}
        >
          <CalendarDays className="w-5 h-5" />
        </div>
      )}
    </div>
  )
} 