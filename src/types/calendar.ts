/**
 * Calendar and Date Picker Types
 * 
 * These types support the enhanced booking-style date picker component
 * that provides a visual calendar interface for date range selection.
 */

/**
 * Represents a date range with optional start and end dates
 */
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Represents a single date in the calendar with all its states and properties
 */
export interface CalendarDate {
  /** The actual date object */
  date: Date;
  /** Whether this date belongs to the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is selected (either start or end date) */
  isSelected: boolean;
  /** Whether this date is the start of a selected range */
  isRangeStart: boolean;
  /** Whether this date is the end of a selected range */
  isRangeEnd: boolean;
  /** Whether this date is within a selected range */
  isInRange: boolean;
  /** Whether this date is currently being hovered over */
  isHovered: boolean;
  /** Whether this date is disabled (e.g., in the past) */
  isDisabled: boolean;
}

/**
 * Theme configuration for calendar styling
 * Integrates with tenant branding system
 */
export interface CalendarTheme {
  /** Primary brand color for selected dates */
  primaryColor: string;
  /** Foreground color for calendar background */
  foregroundColor: string;
  /** Text color for calendar content */
  textColor: string;
  /** Border color for calendar elements */
  borderColor: string;
  /** Hover color for interactive elements */
  hoverColor: string;
  /** Color for disabled dates */
  disabledColor: string;
  /** Color for today's date indicator */
  todayColor: string;
}

/**
 * Configuration options for calendar behavior
 */
export interface CalendarConfig {
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether to disable past dates */
  disablePastDates?: boolean;
  /** Whether to show dates from adjacent months */
  showAdjacentMonths?: boolean;
  /** First day of the week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: number;
}

/**
 * Props for calendar navigation
 */
export interface CalendarNavigation {
  /** Currently displayed month */
  currentMonth: Date;
  /** Navigate to previous month */
  goToPreviousMonth: () => void;
  /** Navigate to next month */
  goToNextMonth: () => void;
  /** Navigate to specific month */
  goToMonth: (date: Date) => void;
}

/**
 * State for date range selection
 */
export interface DateRangeSelectionState {
  /** Currently selected date range */
  selectedRange: DateRange;
  /** Date currently being hovered over */
  hoveredDate?: Date;
  /** Whether user is currently selecting a range */
  isSelecting: boolean;
  /** Whether the calendar popup is open */
  isOpen: boolean;
}