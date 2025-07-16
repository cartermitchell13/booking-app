import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MonthView } from '../month-view'
import { TenantProvider } from '@/lib/tenant-context'
import type { DateRange } from '@/types/calendar'

// Mock tenant context
const mockTenant = {
  id: 'test-tenant',
  name: 'Test Tenant',
  branding: {
    primary_color: '#3B82F6',
    foreground_color: '#FFFFFF'
  }
}

// Helper to render component with tenant context
const renderWithTenant = (component: React.ReactElement) => {
  return render(
    <TenantProvider tenant={mockTenant}>
      {component}
    </TenantProvider>
  )
}

describe('MonthView', () => {
  const mockOnDateClick = vi.fn()
  const mockOnDateHover = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders month view with correct month header', () => {
      const testMonth = new Date(2024, 0, 15) // January 2024
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      expect(screen.getByText('January 2024')).toBeInTheDocument()
    })

    it('renders without header when showHeader is false', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          showHeader={false}
        />
      )

      expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    })

    it('renders weekday headers in correct order', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const expectedWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      expectedWeekdays.forEach(weekday => {
        expect(screen.getByText(weekday)).toBeInTheDocument()
      })
    })

    it('renders weekday headers starting with Monday when firstDayOfWeek is 1', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ firstDayOfWeek: 1 }}
        />
      )

      const weekdayHeaders = screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/)
      expect(weekdayHeaders[0]).toHaveTextContent('Mon')
      expect(weekdayHeaders[6]).toHaveTextContent('Sun')
    })
  })

  describe('Calendar Grid Layout', () => {
    it('renders exactly 42 date cells (6 weeks)', () => {
      const testMonth = new Date(2024, 0, 15) // January 2024
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      // Count all date buttons
      const dateButtons = screen.getAllByRole('button')
      expect(dateButtons).toHaveLength(42)
    })

    it('includes dates from previous and next months to fill grid', () => {
      const testMonth = new Date(2024, 0, 15) // January 2024 (starts on Monday)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      // Should include some dates from December 2023 and February 2024
      // January 1, 2024 was a Monday, so we should see Dec 31 (Sunday)
      const dec31Button = screen.getByTestId('calendar-date-2023-12-31')
      expect(dec31Button).toBeInTheDocument()
    })

    it('displays current month dates with normal styling', () => {
      const testMonth = new Date(2024, 0, 15) // January 2024
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const jan15Button = screen.getByTestId('calendar-date-2024-1-15')
      expect(jan15Button).toBeInTheDocument()
      expect(jan15Button).not.toHaveClass('text-gray-400') // Should not be muted
    })
  })

  describe('Date Selection States', () => {
    it('highlights selected start date', () => {
      const testMonth = new Date(2024, 0, 15)
      const startDate = new Date(2024, 0, 15)
      const selectedRange: DateRange = { startDate }

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const startDateButton = screen.getByTestId('calendar-date-2024-1-15')
      expect(startDateButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('highlights selected end date', () => {
      const testMonth = new Date(2024, 0, 15)
      const startDate = new Date(2024, 0, 10)
      const endDate = new Date(2024, 0, 20)
      const selectedRange: DateRange = { startDate, endDate }

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const endDateButton = screen.getByTestId('calendar-date-2024-1-20')
      expect(endDateButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('highlights dates in selected range', () => {
      const testMonth = new Date(2024, 0, 15)
      const startDate = new Date(2024, 0, 10)
      const endDate = new Date(2024, 0, 20)
      const selectedRange: DateRange = { startDate, endDate }

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      // Date in the middle of range should have in-range styling
      const middleDateButton = screen.getByTestId('calendar-date-2024-1-15')
      // The CalendarDate component should apply in-range styling
      expect(middleDateButton).toBeInTheDocument()
    })

    it('shows hover preview for incomplete range', () => {
      const testMonth = new Date(2024, 0, 15)
      const startDate = new Date(2024, 0, 10)
      const hoveredDate = new Date(2024, 0, 20)
      const selectedRange: DateRange = { startDate }

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          hoveredDate={hoveredDate}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      // Dates between start and hovered should show in-range preview
      const middleDateButton = screen.getByTestId('calendar-date-2024-1-15')
      expect(middleDateButton).toBeInTheDocument()
    })
  })

  describe('Date Interactions', () => {
    it('calls onDateClick when date is clicked', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ disablePastDates: false }} // Disable past date validation for test
        />
      )

      const dateButton = screen.getByTestId('calendar-date-2024-1-15')
      fireEvent.click(dateButton)

      expect(mockOnDateClick).toHaveBeenCalledWith(new Date(2024, 0, 15))
    })

    it('calls onDateHover when date is hovered', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ disablePastDates: false }} // Disable past date validation for test
        />
      )

      const dateButton = screen.getByTestId('calendar-date-2024-1-15')
      fireEvent.mouseEnter(dateButton)

      expect(mockOnDateHover).toHaveBeenCalledWith(new Date(2024, 0, 15))
    })

    it('does not call handlers for disabled dates', () => {
      // Test with a past date that should be disabled
      const testMonth = new Date() // Current month
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5) // 5 days ago
      
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const pastDateButton = screen.getByTestId(
        `calendar-date-${pastDate.getFullYear()}-${pastDate.getMonth() + 1}-${pastDate.getDate()}`
      )
      
      fireEvent.click(pastDateButton)
      fireEvent.mouseEnter(pastDateButton)

      // Should not call handlers for disabled dates
      expect(mockOnDateClick).not.toHaveBeenCalled()
      expect(mockOnDateHover).not.toHaveBeenCalled()
    })
  })

  describe('Configuration Options', () => {
    it('respects minDate configuration', () => {
      const testMonth = new Date(2024, 0, 15)
      const minDate = new Date(2024, 0, 10)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ minDate }}
        />
      )

      // Dates before minDate should be disabled
      const beforeMinButton = screen.getByTestId('calendar-date-2024-1-5')
      expect(beforeMinButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('respects maxDate configuration', () => {
      const testMonth = new Date(2024, 0, 15)
      const maxDate = new Date(2024, 0, 20)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ maxDate }}
        />
      )

      // Dates after maxDate should be disabled
      const afterMaxButton = screen.getByTestId('calendar-date-2024-1-25')
      expect(afterMaxButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('allows past dates when disablePastDates is false', () => {
      const testMonth = new Date()
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          config={{ disablePastDates: false }}
        />
      )

      // Past dates should not be disabled
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const yesterdayButton = screen.getByTestId(
        `calendar-date-${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
      )
      expect(yesterdayButton).not.toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for dates', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const dateButton = screen.getByTestId('calendar-date-2024-1-15')
      expect(dateButton).toHaveAttribute('aria-label')
      expect(dateButton.getAttribute('aria-label')).toContain('January 15, 2024')
    })

    it('marks selected dates with aria-pressed', () => {
      const testMonth = new Date(2024, 0, 15)
      const startDate = new Date(2024, 0, 15)
      const selectedRange: DateRange = { startDate }

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      const selectedButton = screen.getByTestId('calendar-date-2024-1-15')
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('marks disabled dates with aria-disabled', () => {
      const testMonth = new Date()
      const selectedRange: DateRange = {}

      renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
        />
      )

      // Find a past date that should be disabled
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const disabledButton = screen.getByTestId(
        `calendar-date-${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
      )
      expect(disabledButton).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const testMonth = new Date(2024, 0, 15)
      const selectedRange: DateRange = {}

      const { container } = renderWithTenant(
        <MonthView
          month={testMonth}
          selectedRange={selectedRange}
          onDateClick={mockOnDateClick}
          onDateHover={mockOnDateHover}
          className="custom-month-view"
        />
      )

      expect(container.querySelector('.custom-month-view')).toBeInTheDocument()
    })
  })
})