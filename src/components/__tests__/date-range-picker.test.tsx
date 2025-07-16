/**
 * Integration tests for the enhanced DateRangePicker component
 * 
 * Tests the integration between the trigger component and calendar popup,
 * ensuring proper API compatibility, focus management, and user interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateRangePicker } from '../date-range-picker';

// Mock the calendar popup component for focused testing
vi.mock('../ui/calendar-popup', () => ({
  CalendarPopup: ({ isOpen, onClose, onDateSelect, selectedRange, position }: any) => {
    if (!isOpen) return null;
    
    return (
      <div data-testid="calendar-popup" role="dialog">
        <button 
          data-testid="close-calendar" 
          onClick={onClose}
        >
          Close
        </button>
        <button 
          data-testid="select-date-1" 
          onClick={() => onDateSelect(new Date('2024-01-15'))}
        >
          Select Jan 15
        </button>
        <button 
          data-testid="select-date-2" 
          onClick={() => onDateSelect(new Date('2024-01-20'))}
        >
          Select Jan 20
        </button>
        <div data-testid="selected-range">
          Start: {selectedRange.startDate?.toISOString().split('T')[0] || 'None'}
          End: {selectedRange.endDate?.toISOString().split('T')[0] || 'None'}
        </div>
        <div data-testid="popup-position">
          Top: {position?.top}, Left: {position?.left}, Width: {position?.width}
        </div>
      </div>
    );
  }
}));

describe('DateRangePicker Integration', () => {
  const defaultProps = {
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
    onDateRangeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getBoundingClientRect for position calculations
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 200,
      bottom: 144,
      right: 400,
      width: 200,
      height: 44,
      x: 200,
      y: 100,
      toJSON: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API Compatibility', () => {
    it('maintains existing prop interface', () => {
      const props = {
        dateFrom: '2024-01-15',
        dateTo: '2024-01-20',
        onDateFromChange: vi.fn(),
        onDateToChange: vi.fn(),
        onDateRangeChange: vi.fn(),
        placeholder: 'Select dates'
      };

      render(<DateRangePicker {...props} />);
      
      // Should render without errors and display the date range
      expect(screen.getByText('Jan 15 - Jan 20')).toBeInTheDocument();
    });

    it('displays placeholder when no dates selected', () => {
      render(<DateRangePicker {...defaultProps} placeholder="Custom placeholder" />);
      
      expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
    });

    it('displays partial selection correctly', () => {
      render(<DateRangePicker {...defaultProps} dateFrom="2024-01-15" />);
      
      expect(screen.getByText('Jan 15 - Add end date')).toBeInTheDocument();
    });

    it('calls callback functions when dates change', async () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Select first date
      fireEvent.click(screen.getByTestId('select-date-1'));
      
      expect(defaultProps.onDateFromChange).toHaveBeenCalledWith('2024-01-15');
      expect(defaultProps.onDateRangeChange).toHaveBeenCalledWith('2024-01-15', undefined);
    });
  });

  describe('Calendar Popup Integration', () => {
    it('opens calendar popup when trigger is clicked', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Calendar should not be visible initially
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
      
      // Click trigger to open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Calendar should now be visible
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
    });

    it('closes calendar popup when close button is clicked', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
      
      // Close calendar
      fireEvent.click(screen.getByTestId('close-calendar'));
      
      // Calendar should be closed
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('passes correct position to calendar popup', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Check position is calculated correctly
      const positionElement = screen.getByTestId('popup-position');
      expect(positionElement).toHaveTextContent('Top: 152, Left: 200, Width: 200');
    });

    it('passes selected range to calendar popup', () => {
      render(<DateRangePicker {...defaultProps} dateFrom="2024-01-15" dateTo="2024-01-20" />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Check selected range is passed correctly
      const rangeElement = screen.getByTestId('selected-range');
      expect(rangeElement).toHaveTextContent('Start: 2024-01-15');
      expect(rangeElement).toHaveTextContent('End: 2024-01-20');
    });
  });

  describe('Focus Management', () => {
    it('has proper accessibility attributes', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      const trigger = screen.getByRole('button', { name: /open date range picker/i });
      
      expect(trigger).toHaveAttribute('tabIndex', '0');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('updates aria-expanded when calendar opens', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      const trigger = screen.getByRole('button', { name: /open date range picker/i });
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Open calendar
      fireEvent.click(trigger);
      
      // Should be expanded
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles keyboard navigation on trigger', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      const trigger = screen.getByRole('button', { name: /open date range picker/i });
      
      // Focus the trigger
      trigger.focus();
      
      // Press Enter to open
      fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
      
      // Press Escape to close
      fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('handles Space key to open calendar', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      const trigger = screen.getByRole('button', { name: /open date range picker/i });
      trigger.focus();
      
      // Press Space to open
      fireEvent.keyDown(trigger, { key: ' ', code: 'Space' });
      expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();
    });
  });

  describe('Date Selection Workflow', () => {
    it('handles complete date range selection', () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Select start date
      fireEvent.click(screen.getByTestId('select-date-1'));
      expect(defaultProps.onDateFromChange).toHaveBeenCalledWith('2024-01-15');
      
      // Select end date
      fireEvent.click(screen.getByTestId('select-date-2'));
      expect(defaultProps.onDateToChange).toHaveBeenCalledWith('2024-01-20');
      expect(defaultProps.onDateRangeChange).toHaveBeenCalledWith('2024-01-15', '2024-01-20');
    });

    it('closes calendar automatically after complete selection', async () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Select both dates
      fireEvent.click(screen.getByTestId('select-date-1'));
      fireEvent.click(screen.getByTestId('select-date-2'));
      
      // Calendar should close automatically after a short delay
      await waitFor(() => {
        expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('updates display text when dates are selected', async () => {
      // Create a component that manages its own state to simulate real usage
      const TestComponent = () => {
        const [dateFrom, setDateFrom] = React.useState<string | undefined>();
        const [dateTo, setDateTo] = React.useState<string | undefined>();
        
        return (
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onDateRangeChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
          />
        );
      };
      
      render(<TestComponent />);
      
      // Open calendar and select dates
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      fireEvent.click(screen.getByTestId('select-date-1'));
      fireEvent.click(screen.getByTestId('select-date-2'));
      
      // Wait for calendar to close and display to update
      await waitFor(() => {
        expect(screen.getByText('Jan 15 - Jan 20')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('updates position when window resizes', async () => {
      render(<DateRangePicker {...defaultProps} />);
      
      // Open calendar
      fireEvent.click(screen.getByRole('button', { name: /open date range picker/i }));
      
      // Mock new position after resize
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        top: 150,
        left: 250,
        bottom: 194,
        right: 450,
        width: 200,
        height: 44,
        x: 250,
        y: 150,
        toJSON: vi.fn(),
      }));
      
      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      // Check updated position
      await waitFor(() => {
        const positionElement = screen.getByTestId('popup-position');
        expect(positionElement).toHaveTextContent('Top: 202, Left: 250, Width: 200');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid date strings gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <DateRangePicker 
          {...defaultProps} 
          dateFrom="invalid-date" 
          dateTo="also-invalid" 
        />
      );
      
      // Should not crash and should show placeholder
      expect(screen.getByText('Add dates')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles missing callback functions', () => {
      const minimalProps = {
        onDateFromChange: vi.fn(),
        onDateToChange: vi.fn(),
        // onDateRangeChange is optional
      };
      
      expect(() => {
        render(<DateRangePicker {...minimalProps} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      const TestWrapper = (props: any) => {
        renderSpy();
        return <DateRangePicker {...props} />;
      };
      
      render(<TestWrapper {...defaultProps} />);
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Open and close calendar multiple times
      const trigger = screen.getByRole('button', { name: /open date range picker/i });
      fireEvent.click(trigger);
      fireEvent.click(screen.getByTestId('close-calendar'));
      fireEvent.click(trigger);
      fireEvent.click(screen.getByTestId('close-calendar'));
      
      // Should not cause excessive re-renders
      expect(renderSpy.mock.calls.length).toBeLessThan(initialRenderCount + 10);
    });
  });
});