/**
 * useDateRangePicker Hook
 * 
 * Custom hook to manage date selection state and calendar navigation
 * for the booking-style date picker component.
 * 
 * Handles:
 * - Date range selection (start date, end date)
 * - Hover state for range preview
 * - Month navigation (previous/next month)
 * - Selection state management and transitions
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  getNextMonth, 
  getPreviousMonth, 
  createDateRange, 
  validateDateRange,
  clearDateRange
} from '@/lib/date-utils';
import type { DateRange } from '@/types/calendar';

export interface UseDateRangePickerOptions {
  /** Initial date range */
  initialRange?: DateRange;
  /** Initial month to display */
  initialMonth?: Date;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Callback when date range changes */
  onRangeChange?: (range: DateRange) => void;
  /** Callback when range selection is completed */
  onRangeComplete?: (range: DateRange) => void;
}

export interface UseDateRangePickerReturn {
  // Current state
  selectedRange: DateRange;
  hoveredDate?: Date;
  currentMonth: Date;
  isSelecting: boolean;
  isOpen: boolean;
  
  // Date selection actions
  selectDate: (date: Date) => void;
  setHoveredDate: (date?: Date) => void;
  clearSelection: () => void;
  
  // Calendar navigation
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToMonth: (date: Date) => void;
  
  // Calendar popup control
  openCalendar: () => void;
  closeCalendar: () => void;
  toggleCalendar: () => void;
  
  // Utility functions
  isDateSelected: (date: Date) => boolean;
  isDateRangeStart: (date: Date) => boolean;
  isDateRangeEnd: (date: Date) => boolean;
  isDateInRange: (date: Date) => boolean;
  isDateHovered: (date: Date) => boolean;
  
  // Validation
  rangeValidation: {
    isValid: boolean;
    errors: string[];
  };
}

export function useDateRangePicker(options: UseDateRangePickerOptions = {}): UseDateRangePickerReturn {
  const {
    initialRange = createDateRange(),
    initialMonth = new Date(),
    minDate,
    maxDate,
    onRangeChange,
    onRangeComplete
  } = options;

  // Core state
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange);
  const [hoveredDate, setHoveredDateState] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Date selection logic with enhanced validation and range handling
  const selectDate = useCallback((date: Date) => {
    const { startDate, endDate } = selectedRange;
    
    // If no start date, validate and set as start date
    if (!startDate) {
      // Validate the selected date against min/max constraints for start date
      if (minDate && date < minDate) {
        return; // Don't allow selection of dates before minDate as start date
      }
      if (maxDate && date > maxDate) {
        return; // Don't allow selection of dates after maxDate as start date
      }
      
      const newRange = createDateRange(date, undefined);
      setSelectedRange(newRange);
      setIsSelecting(true);
      onRangeChange?.(newRange);
      return;
    }
    
    // If start date exists but no end date
    if (startDate && !endDate) {
      // If clicking the same date as start, clear selection
      if (date.getTime() === startDate.getTime()) {
        const clearedRange = clearDateRange();
        setSelectedRange(clearedRange);
        setIsSelecting(false);
        setHoveredDateState(undefined);
        onRangeChange?.(clearedRange);
        return;
      }
      
      // If clicking a date before start date, make it the new start date
      if (date < startDate) {
        const newRange = createDateRange(date, undefined);
        setSelectedRange(newRange);
        setIsSelecting(true);
        setHoveredDateState(undefined);
        onRangeChange?.(newRange);
        return;
      }
      
      // Try to set as end date
      const newRange = createDateRange(startDate, date);
      const validation = validateDateRange(newRange, {
        minDate,
        maxDate,
        allowPastDates: false,
        allowSameDate: false
      });
      
      if (validation.isValid) {
        // Valid range - complete the selection
        setSelectedRange(newRange);
        setIsSelecting(false);
        setHoveredDateState(undefined);
        onRangeChange?.(newRange);
        onRangeComplete?.(newRange);
        return;
      } else {
        // Invalid range - treat as new start date selection
        const newStartRange = createDateRange(date, undefined);
        setSelectedRange(newStartRange);
        setIsSelecting(true);
        setHoveredDateState(undefined);
        onRangeChange?.(newStartRange);
        return;
      }
    }
    
    // If both dates are selected, start new selection
    // Validate the selected date against min/max constraints for new start date
    if (minDate && date < minDate) {
      return; // Don't allow selection of dates before minDate as new start date
    }
    if (maxDate && date > maxDate) {
      return; // Don't allow selection of dates after maxDate as new start date
    }
    
    const newRange = createDateRange(date, undefined);
    setSelectedRange(newRange);
    setIsSelecting(true);
    setHoveredDateState(undefined);
    onRangeChange?.(newRange);
  }, [selectedRange, minDate, maxDate, onRangeChange, onRangeComplete]);

  // Enhanced hover state management for range preview
  const setHoveredDate = useCallback((date?: Date) => {
    // Only set hover state when selecting (start date exists but no end date)
    if (isSelecting && selectedRange.startDate && !selectedRange.endDate) {
      // Validate hover date against constraints
      if (date) {
        // Don't allow hovering over dates before minDate or after maxDate
        if (minDate && date < minDate) {
          setHoveredDateState(undefined);
          return;
        }
        if (maxDate && date > maxDate) {
          setHoveredDateState(undefined);
          return;
        }
        
        // Don't allow hovering over the same date as start date
        if (date.getTime() === selectedRange.startDate.getTime()) {
          setHoveredDateState(undefined);
          return;
        }
      }
      
      setHoveredDateState(date);
    } else {
      setHoveredDateState(undefined);
    }
  }, [isSelecting, selectedRange, minDate, maxDate]);

  // Clear selection
  const clearSelection = useCallback(() => {
    const clearedRange = clearDateRange();
    setSelectedRange(clearedRange);
    setHoveredDateState(undefined);
    setIsSelecting(false);
    onRangeChange?.(clearedRange);
  }, [onRangeChange]);

  // Month navigation
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => getPreviousMonth(prev));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => getNextMonth(prev));
  }, []);

  const goToMonth = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

  // Calendar popup control
  const openCalendar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setIsOpen(false);
    setHoveredDateState(undefined);
  }, []);

  const toggleCalendar = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setHoveredDateState(undefined);
    }
  }, [isOpen]);

  // Utility functions for date state checking
  const isDateSelected = useCallback((date: Date) => {
    const { startDate, endDate } = selectedRange;
    if (!startDate) return false;
    
    const isSameAsStart = startDate.getTime() === date.getTime();
    const isSameAsEnd = endDate && endDate.getTime() === date.getTime();
    
    return isSameAsStart || !!isSameAsEnd;
  }, [selectedRange]);

  const isDateRangeStart = useCallback((date: Date) => {
    const { startDate } = selectedRange;
    return startDate ? startDate.getTime() === date.getTime() : false;
  }, [selectedRange]);

  const isDateRangeEnd = useCallback((date: Date) => {
    const { endDate } = selectedRange;
    return endDate ? endDate.getTime() === date.getTime() : false;
  }, [selectedRange]);

  const isDateInRange = useCallback((date: Date) => {
    const { startDate, endDate } = selectedRange;
    
    if (!startDate || !endDate) {
      // If only start date and hovering, check hover range
      if (startDate && hoveredDate && isSelecting) {
        const rangeStart = startDate < hoveredDate ? startDate : hoveredDate;
        const rangeEnd = startDate < hoveredDate ? hoveredDate : startDate;
        return date > rangeStart && date < rangeEnd;
      }
      return false;
    }
    
    return date > startDate && date < endDate;
  }, [selectedRange, hoveredDate, isSelecting]);

  const isDateHovered = useCallback((date: Date) => {
    return hoveredDate ? hoveredDate.getTime() === date.getTime() : false;
  }, [hoveredDate]);

  // Validation with enhanced options
  const rangeValidation = useMemo(() => {
    return validateDateRange(selectedRange, {
      minDate,
      maxDate,
      allowPastDates: false,
      allowSameDate: false
    });
  }, [selectedRange, minDate, maxDate]);

  return {
    // Current state
    selectedRange,
    hoveredDate,
    currentMonth,
    isSelecting,
    isOpen,
    
    // Date selection actions
    selectDate,
    setHoveredDate,
    clearSelection,
    
    // Calendar navigation
    goToPreviousMonth,
    goToNextMonth,
    goToMonth,
    
    // Calendar popup control
    openCalendar,
    closeCalendar,
    toggleCalendar,
    
    // Utility functions
    isDateSelected,
    isDateRangeStart,
    isDateRangeEnd,
    isDateInRange,
    isDateHovered,
    
    // Validation
    rangeValidation
  };
}

export default useDateRangePicker;