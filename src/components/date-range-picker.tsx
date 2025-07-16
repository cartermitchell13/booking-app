'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { CalendarPopup } from './ui/calendar-popup'
import { useDateRangePicker } from '@/hooks/useDateRangePicker'
import { createDateRange } from '@/lib/date-utils'
import { DateRange } from '@/types/calendar'

export interface DateRangePickerProps {
  dateFrom?: string
  dateTo?: string
  onDateRangeChange: (dateFrom: string | undefined, dateTo: string | undefined) => void
  placeholder?: string
}

export function DateRangePicker({ 
  dateFrom,
  dateTo,
  onDateRangeChange,
  placeholder = "Add dates"
}: DateRangePickerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>()
  const [triggerPosition, setTriggerPosition] = useState<{ top: number; left: number; width: number } | undefined>()

  const selectedRange: DateRange = createDateRange(
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined
  )

  const handleDateSelect = (date: Date) => {
    const { startDate, endDate } = selectedRange

    let newDateFrom: string | undefined
    let newDateTo: string | undefined

    if (!startDate || (startDate && endDate)) {
      newDateFrom = date.toISOString().split('T')[0]
      newDateTo = undefined
    } else if (date < startDate) {
      newDateFrom = date.toISOString().split('T')[0]
      newDateTo = undefined
    } else {
      newDateFrom = startDate.toISOString().split('T')[0]
      newDateTo = date.toISOString().split('T')[0]
      setIsOpen(false)
    }
    onDateRangeChange(newDateFrom, newDateTo)
  }

  const openCalendar = () => {
    updateTriggerPosition()
    setIsOpen(true)
  }

  const closeCalendar = () => setIsOpen(false)

  const goToMonth = (month: Date) => setCurrentMonth(month)

  const getDateRangeDisplay = () => {
    if (!selectedRange.startDate) return placeholder
    const startDate = selectedRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!selectedRange.endDate) return `${startDate} - Add end date`
    const endDate = selectedRange.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startDate} - ${endDate}`
  }

  const updateTriggerPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setTriggerPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [])
  
  // Omitted for brevity: useEffect for click outside, resize, accessibility, etc.

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={openCalendar}
        // Omitted for brevity: a11y attributes, styling, etc.
        className="w-full px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center">
          <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm">{getDateRangeDisplay()}</span>
        </div>
      </div>
      
      <CalendarPopup
        isOpen={isOpen}
        onClose={closeCalendar}
        selectedRange={selectedRange}
        onDateSelect={handleDateSelect}
        currentMonth={currentMonth}
        onDateHover={setHoveredDate}
        onMonthChange={goToMonth}
        position={triggerPosition}
      />
    </div>
  )
} 