'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Minus, Users } from 'lucide-react'
import { PassengerCounts } from '@/types'

interface PassengerSelectorProps {
  value: PassengerCounts
  onChange: (passengers: PassengerCounts) => void
}

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalPassengers = value.adults + value.students + value.children

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateCount = (type: keyof PassengerCounts, increment: boolean) => {
    const newValue = { ...value }
    
    if (increment) {
      newValue[type]++
    } else {
      newValue[type] = Math.max(0, newValue[type] - 1)
    }

    // Ensure at least one adult
    if (type === 'adults' && newValue.adults === 0) {
      newValue.adults = 1
    }

    onChange(newValue)
  }

  const getPassengerText = () => {
    if (totalPassengers === 1) return '1 Passenger'
    return `${totalPassengers} Passengers`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center">
          <Users className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-900">{getPassengerText()}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="p-4 space-y-4">
            
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Adults</div>
                <div className="text-sm text-gray-500">Age 18+</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => updateCount('adults', false)}
                  disabled={value.adults <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease adult count"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-gray-900">{value.adults}</span>
                <button
                  type="button"
                  onClick={() => updateCount('adults', true)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Increase adult count"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Students */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Students</div>
                <div className="text-sm text-gray-500">With valid ID</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => updateCount('students', false)}
                  disabled={value.students <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease student count"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-gray-900">{value.students}</span>
                <button
                  type="button"
                  onClick={() => updateCount('students', true)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Increase student count"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Children</div>
                <div className="text-sm text-gray-500">Age 2-17</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => updateCount('children', false)}
                  disabled={value.children <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease children count"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-gray-900">{value.children}</span>
                <button
                  type="button"
                  onClick={() => updateCount('children', true)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Increase children count"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 