/**
 * Unit tests for date utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCalendarDates,
  isDateInRange,
  isDateRangeStart,
  isDateRangeEnd,
  isDateSelected,
  formatDateForDisplay,
  formatDateRangeForDisplay,
  formatDateForAPI,
  parseDateFromAPI,
  validateDateRange,
  getNextMonth,
  getPreviousMonth,
  getMonthYearDisplay,
  getWeekdayHeaders,
  createDateRange,
  areDateRangesEqual,
  getDateRangeDuration,
  isDateRangeComplete,
  clearDateRange
} from '../date-utils';
import type { DateRange } from '@/types/calendar';

describe('Date Utility Functions', () => {
  let testDate: Date;
  let testRange: DateRange;

  beforeEach(() => {
    // Use a fixed date for consistent testing
    testDate = new Date(2024, 2, 15); // March 15, 2024 (Friday)
    testRange = {
      startDate: new Date(2024, 2, 10), // March 10, 2024
      endDate: new Date(2024, 2, 20)    // March 20, 2024
    };
  });

  describe('getCalendarDates', () => {
    it('should generate 42 dates for a calendar month', () => {
      const dates = getCalendarDates(testDate);
      expect(dates).toHaveLength(42);
    });

    it('should include dates from previous and next months', () => {
      const dates = getCalendarDates(testDate);
      const firstDate = dates[0];
      const lastDate = dates[41];
      
      // First date should be from previous month or same month
      expect(firstDate.date.getMonth()).toBeLessThanOrEqual(testDate.getMonth());
      
      // Last date should be from next month or same month
      expect(lastDate.date.getMonth()).toBeGreaterThanOrEqual(testDate.getMonth());
    });

    it('should mark current month dates correctly', () => {
      const dates = getCalendarDates(testDate);
      const currentMonthDates = dates.filter(d => d.isCurrentMonth);
      
      // Should have dates from the current month
      expect(currentMonthDates.length).toBeGreaterThan(0);
    });

    it('should mark today correctly', () => {
      const today = new Date();
      const dates = getCalendarDates(today);
      const todayDates = dates.filter(d => d.isToday);
      
      if (todayDates.length > 0) {
        expect(todayDates).toHaveLength(1);
        expect(todayDates[0].date.toDateString()).toBe(today.toDateString());
      }
    });

    it('should disable past dates when disablePastDates is true', () => {
      const today = new Date();
      const dates = getCalendarDates(today, { disablePastDates: true });
      
      dates.forEach(dateObj => {
        if (dateObj.date < today && !dateObj.isToday) {
          expect(dateObj.isDisabled).toBe(true);
        }
      });
    });

    it('should respect minDate configuration', () => {
      const minDate = new Date(2024, 2, 10);
      const dates = getCalendarDates(testDate, { minDate });
      
      dates.forEach(dateObj => {
        if (dateObj.date < minDate) {
          expect(dateObj.isDisabled).toBe(true);
        }
      });
    });

    it('should respect maxDate configuration', () => {
      const maxDate = new Date(2024, 2, 25);
      const dates = getCalendarDates(testDate, { maxDate });
      
      dates.forEach(dateObj => {
        if (dateObj.date > maxDate) {
          expect(dateObj.isDisabled).toBe(true);
        }
      });
    });
  });

  describe('Date Range Functions', () => {
    describe('isDateInRange', () => {
      it('should return true for dates within range', () => {
        const dateInRange = new Date(2024, 2, 15);
        expect(isDateInRange(dateInRange, testRange)).toBe(true);
      });

      it('should return true for start and end dates', () => {
        expect(isDateInRange(testRange.startDate!, testRange)).toBe(true);
        expect(isDateInRange(testRange.endDate!, testRange)).toBe(true);
      });

      it('should return false for dates outside range', () => {
        const dateBefore = new Date(2024, 2, 5);
        const dateAfter = new Date(2024, 2, 25);
        
        expect(isDateInRange(dateBefore, testRange)).toBe(false);
        expect(isDateInRange(dateAfter, testRange)).toBe(false);
      });

      it('should return false for incomplete ranges', () => {
        const incompleteRange = { startDate: testRange.startDate };
        expect(isDateInRange(testDate, incompleteRange)).toBe(false);
      });
    });

    describe('isDateRangeStart', () => {
      it('should return true for start date', () => {
        expect(isDateRangeStart(testRange.startDate!, testRange)).toBe(true);
      });

      it('should return false for non-start dates', () => {
        expect(isDateRangeStart(testRange.endDate!, testRange)).toBe(false);
        expect(isDateRangeStart(testDate, testRange)).toBe(false);
      });
    });

    describe('isDateRangeEnd', () => {
      it('should return true for end date', () => {
        expect(isDateRangeEnd(testRange.endDate!, testRange)).toBe(true);
      });

      it('should return false for non-end dates', () => {
        expect(isDateRangeEnd(testRange.startDate!, testRange)).toBe(false);
        expect(isDateRangeEnd(testDate, testRange)).toBe(false);
      });
    });

    describe('isDateSelected', () => {
      it('should return true for start and end dates', () => {
        expect(isDateSelected(testRange.startDate!, testRange)).toBe(true);
        expect(isDateSelected(testRange.endDate!, testRange)).toBe(true);
      });

      it('should return false for dates in range but not start/end', () => {
        expect(isDateSelected(testDate, testRange)).toBe(false);
      });
    });
  });

  describe('Date Formatting Functions', () => {
    describe('formatDateForDisplay', () => {
      it('should format date correctly for display', () => {
        const result = formatDateForDisplay(testDate);
        expect(result).toBe('Mar 15');
      });
    });

    describe('formatDateRangeForDisplay', () => {
      it('should format complete range correctly', () => {
        const result = formatDateRangeForDisplay(testRange);
        expect(result).toBe('Mar 10 - Mar 20');
      });

      it('should format incomplete range with start date only', () => {
        const incompleteRange = { startDate: testRange.startDate };
        const result = formatDateRangeForDisplay(incompleteRange);
        expect(result).toBe('Mar 10 - Add end date');
      });

      it('should format empty range', () => {
        const emptyRange = {};
        const result = formatDateRangeForDisplay(emptyRange);
        expect(result).toBe('Add dates');
      });
    });

    describe('formatDateForAPI', () => {
      it('should format date for API correctly', () => {
        const result = formatDateForAPI(testDate);
        expect(result).toBe('2024-03-15');
      });
    });

    describe('parseDateFromAPI', () => {
      it('should parse ISO date string correctly', () => {
        const result = parseDateFromAPI('2024-03-15');
        expect(result).toEqual(new Date(2024, 2, 15));
      });

      it('should parse ISO datetime string correctly', () => {
        const result = parseDateFromAPI('2024-03-15T10:30:00Z');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2024);
        expect(result?.getMonth()).toBe(2);
        expect(result?.getDate()).toBe(15);
      });

      it('should return null for invalid date strings', () => {
        expect(parseDateFromAPI('invalid-date')).toBeNull();
        expect(parseDateFromAPI('')).toBeNull();
      });
    });
  });

  describe('Date Validation Functions', () => {
    describe('validateDateRange', () => {
      it('should validate correct date range', () => {
        const futureRange = {
          startDate: new Date(Date.now() + 86400000), // Tomorrow
          endDate: new Date(Date.now() + 172800000)   // Day after tomorrow
        };
        
        const result = validateDateRange(futureRange);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject past start dates', () => {
        const pastRange = {
          startDate: new Date(2020, 0, 1),
          endDate: new Date(Date.now() + 86400000)
        };
        
        const result = validateDateRange(pastRange);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Start date cannot be in the past');
      });

      it('should reject end date before start date', () => {
        const invalidRange = {
          startDate: new Date(Date.now() + 172800000),
          endDate: new Date(Date.now() + 86400000)
        };
        
        const result = validateDateRange(invalidRange);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('End date cannot be before start date');
      });

      it('should reject same start and end dates', () => {
        const sameDate = new Date(Date.now() + 86400000);
        const sameRange = {
          startDate: sameDate,
          endDate: sameDate
        };
        
        const result = validateDateRange(sameRange);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Start and end dates cannot be the same');
      });
    });
  });

  describe('Month Navigation Functions', () => {
    describe('getNextMonth', () => {
      it('should return next month correctly', () => {
        const nextMonth = getNextMonth(testDate);
        expect(nextMonth.getMonth()).toBe(3); // April
        expect(nextMonth.getFullYear()).toBe(2024);
      });

      it('should handle year rollover', () => {
        const december = new Date(2024, 11, 15); // December 2024
        const nextMonth = getNextMonth(december);
        expect(nextMonth.getMonth()).toBe(0); // January
        expect(nextMonth.getFullYear()).toBe(2025);
      });
    });

    describe('getPreviousMonth', () => {
      it('should return previous month correctly', () => {
        const prevMonth = getPreviousMonth(testDate);
        expect(prevMonth.getMonth()).toBe(1); // February
        expect(prevMonth.getFullYear()).toBe(2024);
      });

      it('should handle year rollover', () => {
        const january = new Date(2024, 0, 15); // January 2024
        const prevMonth = getPreviousMonth(january);
        expect(prevMonth.getMonth()).toBe(11); // December
        expect(prevMonth.getFullYear()).toBe(2023);
      });
    });

    describe('getMonthYearDisplay', () => {
      it('should format month and year correctly', () => {
        const result = getMonthYearDisplay(testDate);
        expect(result).toBe('March 2024');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('getWeekdayHeaders', () => {
      it('should return correct weekday headers starting with Sunday', () => {
        const headers = getWeekdayHeaders(0);
        expect(headers).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
      });

      it('should return correct weekday headers starting with Monday', () => {
        const headers = getWeekdayHeaders(1);
        expect(headers).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      });
    });

    describe('createDateRange', () => {
      it('should create date range with both dates', () => {
        const range = createDateRange(testRange.startDate, testRange.endDate);
        expect(range.startDate).toEqual(testRange.startDate);
        expect(range.endDate).toEqual(testRange.endDate);
      });

      it('should create date range with only start date', () => {
        const range = createDateRange(testRange.startDate);
        expect(range.startDate).toEqual(testRange.startDate);
        expect(range.endDate).toBeUndefined();
      });
    });

    describe('areDateRangesEqual', () => {
      it('should return true for equal ranges', () => {
        const range1 = { ...testRange };
        const range2 = { ...testRange };
        expect(areDateRangesEqual(range1, range2)).toBe(true);
      });

      it('should return false for different ranges', () => {
        const range1 = testRange;
        const range2 = {
          startDate: new Date(2024, 3, 10),
          endDate: new Date(2024, 3, 20)
        };
        expect(areDateRangesEqual(range1, range2)).toBe(false);
      });

      it('should return true for both empty ranges', () => {
        const range1 = {};
        const range2 = {};
        expect(areDateRangesEqual(range1, range2)).toBe(true);
      });
    });

    describe('getDateRangeDuration', () => {
      it('should calculate duration correctly', () => {
        const duration = getDateRangeDuration(testRange);
        expect(duration).toBe(10); // March 10 to March 20 = 10 days
      });

      it('should return 0 for incomplete ranges', () => {
        const incompleteRange = { startDate: testRange.startDate };
        expect(getDateRangeDuration(incompleteRange)).toBe(0);
      });
    });

    describe('isDateRangeComplete', () => {
      it('should return true for complete ranges', () => {
        expect(isDateRangeComplete(testRange)).toBe(true);
      });

      it('should return false for incomplete ranges', () => {
        const incompleteRange = { startDate: testRange.startDate };
        expect(isDateRangeComplete(incompleteRange)).toBe(false);
      });

      it('should return false for empty ranges', () => {
        expect(isDateRangeComplete({})).toBe(false);
      });
    });

    describe('clearDateRange', () => {
      it('should return empty date range', () => {
        const cleared = clearDateRange();
        expect(cleared.startDate).toBeUndefined();
        expect(cleared.endDate).toBeUndefined();
      });
    });
  });
});