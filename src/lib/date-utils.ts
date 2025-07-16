/**
 * Date Utility Functions for Calendar Components
 * 
 * This module provides core date calculation utilities for the booking-style
 * date picker component, including calendar logic, date formatting, validation,
 * and range calculations.
 */

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  isBefore, 
  isAfter,
  addMonths,
  subMonths,
  isValid,
  parseISO
} from 'date-fns';

import type { DateRange, CalendarDate, CalendarConfig } from '@/types/calendar';

/**
 * Generate calendar dates for a given month
 * Creates a 6-week grid (42 days) including dates from adjacent months
 */
export function getCalendarDates(
  month: Date,
  config: CalendarConfig = {}
): CalendarDate[] {
  const {
    minDate,
    maxDate,
    disablePastDates = true,
    showAdjacentMonths = true,
    firstDayOfWeek = 0 // Sunday
  } = config;

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  // Get the start and end of the calendar grid (6 weeks)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  
  // Generate all dates in the calendar grid
  const allDates = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Ensure we have exactly 42 days (6 weeks)
  while (allDates.length < 42) {
    const lastDate = allDates[allDates.length - 1];
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);
    allDates.push(nextDate);
  }
  
  const today = new Date();
  
  return allDates.slice(0, 42).map((date): CalendarDate => {
    const isCurrentMonth = isSameMonth(date, month);
    const isPastDate = disablePastDates && isBefore(date, today) && !isSameDay(date, today);
    const isBeforeMin = minDate && isBefore(date, minDate);
    const isAfterMax = maxDate && isAfter(date, maxDate);
    
    return {
      date,
      isCurrentMonth: showAdjacentMonths ? true : isCurrentMonth,
      isToday: isToday(date),
      isSelected: false, // Will be set by the component
      isRangeStart: false, // Will be set by the component
      isRangeEnd: false, // Will be set by the component
      isInRange: false, // Will be set by the component
      isHovered: false, // Will be set by the component
      isDisabled: isPastDate || isBeforeMin || isAfterMax
    };
  });
}

/**
 * Check if a date is within a date range (inclusive)
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  const { startDate, endDate } = range;
  
  if (!startDate || !endDate) {
    return false;
  }
  
  return (isSameDay(date, startDate) || isAfter(date, startDate)) &&
         (isSameDay(date, endDate) || isBefore(date, endDate));
}

/**
 * Check if a date is the start of a range
 */
export function isDateRangeStart(date: Date, range: DateRange): boolean {
  return range.startDate ? isSameDay(date, range.startDate) : false;
}

/**
 * Check if a date is the end of a range
 */
export function isDateRangeEnd(date: Date, range: DateRange): boolean {
  return range.endDate ? isSameDay(date, range.endDate) : false;
}

/**
 * Check if a date is selected (either start or end of range)
 */
export function isDateSelected(date: Date, range: DateRange): boolean {
  return isDateRangeStart(date, range) || isDateRangeEnd(date, range);
}

/**
 * Format a date for display in the date picker trigger
 */
export function formatDateForDisplay(date: Date): string {
  return format(date, 'MMM d');
}

/**
 * Format a date range for display
 */
export function formatDateRangeForDisplay(range: DateRange): string {
  const { startDate, endDate } = range;
  
  if (startDate && endDate) {
    return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
  } else if (startDate) {
    return `${formatDateForDisplay(startDate)} - Add end date`;
  } else {
    return 'Add dates';
  }
}

/**
 * Format a date for API/form submission (ISO string)
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse a date string from API/form (handles ISO strings and date strings)
 */
export function parseDateFromAPI(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    // Try parsing as ISO string first
    const parsed = parseISO(dateString);
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Fallback to Date constructor
    const fallback = new Date(dateString);
    if (isValid(fallback)) {
      return fallback;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate a date range with comprehensive checks
 */
export function validateDateRange(range: DateRange, options?: {
  minDate?: Date;
  maxDate?: Date;
  allowPastDates?: boolean;
  allowSameDate?: boolean;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const { startDate, endDate } = range;
  const { minDate, maxDate, allowPastDates = false, allowSameDate = false } = options || {};
  
  // Check if start date is in the past (unless explicitly allowed)
  if (!allowPastDates && startDate && isBefore(startDate, new Date()) && !isSameDay(startDate, new Date())) {
    errors.push('Start date cannot be in the past');
  }
  
  // Check if start date is before minDate
  if (minDate && startDate && isBefore(startDate, minDate)) {
    errors.push('Start date cannot be before the minimum allowed date');
  }
  
  // Check if start date is after maxDate
  if (maxDate && startDate && isAfter(startDate, maxDate)) {
    errors.push('Start date cannot be after the maximum allowed date');
  }
  
  // Check if end date is before start date
  if (startDate && endDate && isBefore(endDate, startDate)) {
    errors.push('End date cannot be before start date');
  }
  
  // Check if dates are the same (unless explicitly allowed)
  if (!allowSameDate && startDate && endDate && isSameDay(startDate, endDate)) {
    errors.push('Start and end dates cannot be the same');
  }
  
  // Check if end date is before minDate
  if (minDate && endDate && isBefore(endDate, minDate)) {
    errors.push('End date cannot be before the minimum allowed date');
  }
  
  // Check if end date is after maxDate
  if (maxDate && endDate && isAfter(endDate, maxDate)) {
    errors.push('End date cannot be after the maximum allowed date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get the next month from a given date
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Get the previous month from a given date
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Get month and year display string
 */
export function getMonthYearDisplay(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Get weekday headers for calendar
 */
export function getWeekdayHeaders(firstDayOfWeek: number = 0): string[] {
  const baseHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Rotate array based on first day of week
  return [
    ...baseHeaders.slice(firstDayOfWeek),
    ...baseHeaders.slice(0, firstDayOfWeek)
  ];
}

/**
 * Create a date range from start and end dates
 */
export function createDateRange(startDate?: Date, endDate?: Date): DateRange {
  return { startDate, endDate };
}

/**
 * Check if two date ranges are equal
 */
export function areDateRangesEqual(range1: DateRange, range2: DateRange): boolean {
  const start1 = range1.startDate;
  const end1 = range1.endDate;
  const start2 = range2.startDate;
  const end2 = range2.endDate;
  
  const startEqual = (!start1 && !start2) || (start1 && start2 && isSameDay(start1, start2));
  const endEqual = (!end1 && !end2) || (end1 && end2 && isSameDay(end1, end2));
  
  return startEqual && endEqual;
}

/**
 * Get the number of days in a date range
 */
export function getDateRangeDuration(range: DateRange): number {
  const { startDate, endDate } = range;
  
  if (!startDate || !endDate) {
    return 0;
  }
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date range is complete (has both start and end dates)
 */
export function isDateRangeComplete(range: DateRange): boolean {
  return !!(range.startDate && range.endDate);
}

/**
 * Clear a date range
 */
export function clearDateRange(): DateRange {
  return { startDate: undefined, endDate: undefined };
}

/**
 * Check if a date is valid for selection based on constraints
 */
export function isDateSelectable(date: Date, options?: {
  minDate?: Date;
  maxDate?: Date;
  disablePastDates?: boolean;
}): boolean {
  const { minDate, maxDate, disablePastDates = true } = options || {};
  
  // Check if date is in the past
  if (disablePastDates && isBefore(date, new Date()) && !isSameDay(date, new Date())) {
    return false;
  }
  
  // Check if date is before minDate
  if (minDate && isBefore(date, minDate)) {
    return false;
  }
  
  // Check if date is after maxDate
  if (maxDate && isAfter(date, maxDate)) {
    return false;
  }
  
  return true;
}

/**
 * Get the hover range preview between start date and hover date
 */
export function getHoverRange(startDate: Date, hoverDate: Date): DateRange {
  // Ensure proper order (start should be before end)
  if (hoverDate < startDate) {
    return createDateRange(hoverDate, startDate);
  }
  return createDateRange(startDate, hoverDate);
}

/**
 * Check if a date is within a hover range preview
 */
export function isDateInHoverRange(date: Date, startDate: Date, hoverDate?: Date): boolean {
  if (!hoverDate) return false;
  
  const hoverRange = getHoverRange(startDate, hoverDate);
  return isDateInRange(date, hoverRange);
}