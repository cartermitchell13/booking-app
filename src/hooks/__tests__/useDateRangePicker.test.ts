/**
 * Tests for useDateRangePicker Hook
 * 
 * Tests cover:
 * - Date selection logic and state transitions
 * - Month navigation functionality
 * - Hover state management
 * - Calendar popup control
 * - Validation and error handling
 * - Edge cases and boundary conditions
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDateRangePicker } from '../useDateRangePicker';
import type { DateRange } from '@/types/calendar';

describe('useDateRangePicker', () => {
  const mockOnRangeChange = vi.fn();
  const mockOnRangeComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDateRangePicker());

      expect(result.current.selectedRange).toEqual({
        startDate: undefined,
        endDate: undefined
      });
      expect(result.current.hoveredDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(false);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentMonth).toBeInstanceOf(Date);
    });

    it('should initialize with provided initial range', () => {
      const initialRange: DateRange = {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20')
      };

      const { result } = renderHook(() => 
        useDateRangePicker({ initialRange })
      );

      expect(result.current.selectedRange).toEqual(initialRange);
    });

    it('should initialize with provided initial month', () => {
      const initialMonth = new Date('2024-06-01');

      const { result } = renderHook(() => 
        useDateRangePicker({ initialMonth })
      );

      expect(result.current.currentMonth).toEqual(initialMonth);
    });
  });

  describe('Date Selection Logic', () => {
    it('should set start date when no date is selected', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ onRangeChange: mockOnRangeChange })
      );

      const testDate = new Date(2025, 11, 15); // December 15, 2025

      act(() => {
        result.current.selectDate(testDate);
      });

      expect(result.current.selectedRange.startDate).toEqual(testDate);
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(true);
      expect(mockOnRangeChange).toHaveBeenCalledWith({
        startDate: testDate,
        endDate: undefined
      });
    });

    it('should set end date when start date exists and end date is after start', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ 
          onRangeChange: mockOnRangeChange,
          onRangeComplete: mockOnRangeComplete
        })
      );

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.selectDate(endDate);
      });

      expect(result.current.selectedRange.startDate).toEqual(startDate);
      expect(result.current.selectedRange.endDate).toEqual(endDate);
      expect(result.current.isSelecting).toBe(false);
      expect(mockOnRangeComplete).toHaveBeenCalledWith({
        startDate,
        endDate
      });
    });

    it('should clear selection when clicking same date as start date', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ onRangeChange: mockOnRangeChange })
      );

      const testDate = new Date(2025, 11, 15); // December 15, 2025

      act(() => {
        result.current.selectDate(testDate);
      });

      act(() => {
        result.current.selectDate(testDate);
      });

      expect(result.current.selectedRange.startDate).toBeUndefined();
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(false);
    });

    it('should set new start date when clicking date before current start date', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ onRangeChange: mockOnRangeChange })
      );

      const firstDate = new Date(2025, 11, 15); // December 15, 2025
      const earlierDate = new Date(2025, 11, 10); // December 10, 2025

      act(() => {
        result.current.selectDate(firstDate);
      });

      act(() => {
        result.current.selectDate(earlierDate);
      });

      expect(result.current.selectedRange.startDate).toEqual(earlierDate);
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(true);
    });

    it('should start new selection when both dates are already selected', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ onRangeChange: mockOnRangeChange })
      );

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025
      const newDate = new Date(2025, 11, 25); // December 25, 2025

      // Select initial range
      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.selectDate(endDate);
      });

      // Select new date
      act(() => {
        result.current.selectDate(newDate);
      });

      expect(result.current.selectedRange.startDate).toEqual(newDate);
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(true);
    });
  });

  describe('Hover State Management', () => {
    it('should set hover date when selecting and start date exists', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const hoverDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.hoveredDate).toEqual(hoverDate);
    });

    it('should not set hover date when not selecting', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const hoverDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();
    });

    it('should clear hover date when range is complete', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025
      const hoverDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      act(() => {
        result.current.selectDate(endDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month', () => {
      const initialMonth = new Date(2024, 4, 1); // May (index 4)
      const { result } = renderHook(() => 
        useDateRangePicker({ initialMonth })
      );

      act(() => {
        result.current.goToPreviousMonth();
      });

      expect(result.current.currentMonth.getMonth()).toBe(3); // April (0-indexed)
      expect(result.current.currentMonth.getFullYear()).toBe(2024);
    });

    it('should navigate to next month', () => {
      const initialMonth = new Date(2024, 4, 1); // May (index 4)
      const { result } = renderHook(() => 
        useDateRangePicker({ initialMonth })
      );

      act(() => {
        result.current.goToNextMonth();
      });

      expect(result.current.currentMonth.getMonth()).toBe(5); // June (0-indexed)
      expect(result.current.currentMonth.getFullYear()).toBe(2024);
    });

    it('should navigate to specific month', () => {
      const { result } = renderHook(() => useDateRangePicker());
      const targetMonth = new Date('2024-12-01');

      act(() => {
        result.current.goToMonth(targetMonth);
      });

      expect(result.current.currentMonth).toEqual(targetMonth);
    });

    it('should handle year boundaries correctly', () => {
      const initialMonth = new Date(2024, 0, 1); // January (index 0)
      const { result } = renderHook(() => 
        useDateRangePicker({ initialMonth })
      );

      act(() => {
        result.current.goToPreviousMonth();
      });

      expect(result.current.currentMonth.getMonth()).toBe(11); // December (0-indexed)
      expect(result.current.currentMonth.getFullYear()).toBe(2023);
    });
  });

  describe('Calendar Popup Control', () => {
    it('should open calendar', () => {
      const { result } = renderHook(() => useDateRangePicker());

      act(() => {
        result.current.openCalendar();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close calendar and clear hover state', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date('2024-01-15');
      const hoverDate = new Date('2024-01-18');

      act(() => {
        result.current.openCalendar();
        result.current.selectDate(startDate);
        result.current.setHoveredDate(hoverDate);
      });

      act(() => {
        result.current.closeCalendar();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.hoveredDate).toBeUndefined();
    });

    it('should toggle calendar state', () => {
      const { result } = renderHook(() => useDateRangePicker());

      act(() => {
        result.current.toggleCalendar();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleCalendar();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should correctly identify selected dates', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025
      const otherDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });
      
      act(() => {
        result.current.selectDate(endDate);
      });



      expect(result.current.isDateSelected(startDate)).toBe(true);
      expect(result.current.isDateSelected(endDate)).toBe(true);
      expect(result.current.isDateSelected(otherDate)).toBe(false);
    });

    it('should correctly identify range start and end dates', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
      });
      
      act(() => {
        result.current.selectDate(endDate);
      });



      expect(result.current.isDateRangeStart(startDate)).toBe(true);
      expect(result.current.isDateRangeStart(endDate)).toBe(false);
      expect(result.current.isDateRangeEnd(endDate)).toBe(true);
      expect(result.current.isDateRangeEnd(startDate)).toBe(false);
    });

    it('should correctly identify dates in range', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025
      const inRangeDate = new Date(2025, 11, 18); // December 18, 2025
      const outOfRangeDate = new Date(2025, 11, 25); // December 25, 2025

      act(() => {
        result.current.selectDate(startDate);
      });
      
      act(() => {
        result.current.selectDate(endDate);
      });



      expect(result.current.isDateInRange(inRangeDate)).toBe(true);
      expect(result.current.isDateInRange(outOfRangeDate)).toBe(false);
      expect(result.current.isDateInRange(startDate)).toBe(false); // Start date is not "in range"
      expect(result.current.isDateInRange(endDate)).toBe(false); // End date is not "in range"
    });

    it('should correctly identify hovered dates', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const hoverDate = new Date(2025, 11, 18); // December 18, 2025
      const otherDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });



      expect(result.current.isDateHovered(hoverDate)).toBe(true);
      expect(result.current.isDateHovered(otherDate)).toBe(false);
    });

    it('should show hover range when selecting', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const hoverDate = new Date(2025, 11, 20); // December 20, 2025
      const inHoverRangeDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });



      expect(result.current.isDateInRange(inHoverRangeDate)).toBe(true);
    });
  });

  describe('Clear Selection', () => {
    it('should clear all selection state', () => {
      const { result } = renderHook(() => 
        useDateRangePicker({ onRangeChange: mockOnRangeChange })
      );

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
        result.current.selectDate(endDate);
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedRange.startDate).toBeUndefined();
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.hoveredDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(false);
      expect(mockOnRangeChange).toHaveBeenLastCalledWith({
        startDate: undefined,
        endDate: undefined
      });
    });
  });

  describe('Validation', () => {
    it('should validate complete date ranges', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
        result.current.selectDate(endDate);
      });

      expect(result.current.rangeValidation.isValid).toBe(true);
      expect(result.current.rangeValidation.errors).toHaveLength(0);
    });

    it('should validate incomplete ranges', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      // Incomplete ranges should still be valid (just not complete)
      expect(result.current.rangeValidation.isValid).toBe(true);
    });
  });

  describe('Enhanced Date Range Selection Logic', () => {
    it('should prevent selection of dates before minDate', () => {
      const minDate = new Date(2025, 11, 10); // December 10, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ 
          minDate,
          onRangeChange: mockOnRangeChange 
        })
      );

      const beforeMinDate = new Date(2025, 11, 5); // December 5, 2025

      act(() => {
        result.current.selectDate(beforeMinDate);
      });

      // Should not select date before minDate
      expect(result.current.selectedRange.startDate).toBeUndefined();
      expect(mockOnRangeChange).not.toHaveBeenCalled();
    });

    it('should prevent selection of dates after maxDate', () => {
      const maxDate = new Date(2025, 11, 20); // December 20, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ 
          maxDate,
          onRangeChange: mockOnRangeChange 
        })
      );

      const afterMaxDate = new Date(2025, 11, 25); // December 25, 2025

      act(() => {
        result.current.selectDate(afterMaxDate);
      });

      // Should not select date after maxDate
      expect(result.current.selectedRange.startDate).toBeUndefined();
      expect(mockOnRangeChange).not.toHaveBeenCalled();
    });

    it('should prevent completing range with invalid end date', () => {
      const minDate = new Date(2025, 11, 10); // December 10, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ 
          minDate,
          onRangeChange: mockOnRangeChange,
          onRangeComplete: mockOnRangeComplete
        })
      );

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const invalidEndDate = new Date(2025, 11, 8); // December 8, 2025 (before minDate)

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.selectDate(invalidEndDate);
      });

      // Should set new start date instead of invalid end date
      expect(result.current.selectedRange.startDate).toEqual(invalidEndDate);
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(true);
      expect(mockOnRangeComplete).not.toHaveBeenCalled();
    });

    it('should clear hover state when clearing selection', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const hoverDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.hoveredDate).toEqual(hoverDate);

      act(() => {
        result.current.selectDate(startDate); // Click same date to clear
      });

      expect(result.current.hoveredDate).toBeUndefined();
      expect(result.current.selectedRange.startDate).toBeUndefined();
    });

    it('should validate hover dates against constraints', () => {
      const minDate = new Date(2025, 11, 10); // December 10, 2025
      const maxDate = new Date(2025, 11, 25); // December 25, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ minDate, maxDate })
      );

      const startDate = new Date(2025, 11, 15); // December 15, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      // Try to hover over date before minDate
      const beforeMinDate = new Date(2025, 11, 5); // December 5, 2025
      act(() => {
        result.current.setHoveredDate(beforeMinDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();

      // Try to hover over date after maxDate
      const afterMaxDate = new Date(2025, 11, 30); // December 30, 2025
      act(() => {
        result.current.setHoveredDate(afterMaxDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();

      // Try to hover over same date as start
      act(() => {
        result.current.setHoveredDate(startDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();

      // Valid hover date should work
      const validHoverDate = new Date(2025, 11, 20); // December 20, 2025
      act(() => {
        result.current.setHoveredDate(validHoverDate);
      });

      expect(result.current.hoveredDate).toEqual(validHoverDate);
    });

    it('should show enhanced validation errors', () => {
      const minDate = new Date(2025, 11, 10); // December 10, 2025
      const maxDate = new Date(2025, 11, 25); // December 25, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ minDate, maxDate })
      );

      // Test with valid range
      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025

      act(() => {
        result.current.selectDate(startDate);
        result.current.selectDate(endDate);
      });

      expect(result.current.rangeValidation.isValid).toBe(true);
      expect(result.current.rangeValidation.errors).toHaveLength(0);
    });
  });

  describe('Enhanced Hover Range Preview', () => {
    it('should show hover range preview correctly', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const hoverDate = new Date(2025, 11, 20); // December 20, 2025
      const inRangeDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.isDateInRange(inRangeDate)).toBe(true);
      expect(result.current.isDateHovered(hoverDate)).toBe(true);
    });

    it('should handle reverse hover range (hover before start)', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 20); // December 20, 2025
      const hoverDate = new Date(2025, 11, 15); // December 15, 2025
      const inRangeDate = new Date(2025, 11, 18); // December 18, 2025

      act(() => {
        result.current.selectDate(startDate);
      });

      act(() => {
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.isDateInRange(inRangeDate)).toBe(true);
      expect(result.current.isDateHovered(hoverDate)).toBe(true);
    });

    it('should not show hover preview when range is complete', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const startDate = new Date(2025, 11, 15); // December 15, 2025
      const endDate = new Date(2025, 11, 20); // December 20, 2025
      const hoverDate = new Date(2025, 11, 25); // December 25, 2025

      act(() => {
        result.current.selectDate(startDate);
        result.current.selectDate(endDate);
        result.current.setHoveredDate(hoverDate);
      });

      expect(result.current.hoveredDate).toBeUndefined();
      expect(result.current.isDateHovered(hoverDate)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same date selection correctly', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const sameDate = new Date(2025, 11, 15); // December 15, 2025

      act(() => {
        result.current.selectDate(sameDate);
      });

      // Should have start date set
      expect(result.current.selectedRange.startDate).toEqual(sameDate);
      expect(result.current.isSelecting).toBe(true);

      act(() => {
        result.current.selectDate(sameDate);
      });

      // Should clear selection when clicking same date
      expect(result.current.selectedRange.startDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(false);
    });

    it('should handle rapid date selection changes', () => {
      const { result } = renderHook(() => useDateRangePicker());

      const date1 = new Date(2025, 11, 15); // December 15, 2025
      const date2 = new Date(2025, 11, 16); // December 16, 2025
      const date3 = new Date(2025, 11, 17); // December 17, 2025

      act(() => {
        result.current.selectDate(date1);
        result.current.selectDate(date2);
        result.current.selectDate(date3);
      });

      // Should start new selection with date3
      expect(result.current.selectedRange.startDate).toEqual(date3);
      expect(result.current.selectedRange.endDate).toBeUndefined();
      expect(result.current.isSelecting).toBe(true);
    });

    it('should handle boundary date selections', () => {
      const minDate = new Date(2025, 11, 10); // December 10, 2025
      const maxDate = new Date(2025, 11, 20); // December 20, 2025
      const { result } = renderHook(() => 
        useDateRangePicker({ minDate, maxDate })
      );

      // Select exactly minDate
      act(() => {
        result.current.selectDate(minDate);
      });

      expect(result.current.selectedRange.startDate).toEqual(minDate);

      // Select exactly maxDate as end
      act(() => {
        result.current.selectDate(maxDate);
      });

      expect(result.current.selectedRange.endDate).toEqual(maxDate);
      expect(result.current.rangeValidation.isValid).toBe(true);
    });
  });
});