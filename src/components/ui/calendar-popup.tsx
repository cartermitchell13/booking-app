import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTenantBranding } from '@/lib/tenant-context';

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRange: DateRange;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onDateHover: (date?: Date) => void;
  position?: { top: number; left: number; width: number };
}

export function CalendarPopup({
  isOpen,
  onClose,
  selectedRange,
  currentMonth,
  onMonthChange,
  onDateSelect,
  position
}: CalendarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const branding = useTenantBranding();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 768);
      setIsTablet(screenWidth >= 768 && screenWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Calculate next month
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Navigation functions
  const goToPrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  // Date selection logic
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (!selectedRange.startDate) return false;
    if (selectedRange.startDate && !selectedRange.endDate) {
      return date.getTime() === selectedRange.startDate.getTime();
    }
    if (selectedRange.startDate && selectedRange.endDate) {
      return date.getTime() >= selectedRange.startDate.getTime() && 
             date.getTime() <= selectedRange.endDate.getTime();
    }
    return false;
  };

  // Check if date is start or end of range
  const isStartDate = (date: Date) => {
    return selectedRange.startDate && date.getTime() === selectedRange.startDate.getTime();
  };

  const isEndDate = (date: Date) => {
    return selectedRange.endDate && date.getTime() === selectedRange.endDate.getTime();
  };

  // Render a single month
  const renderMonth = (monthDate: Date, isCompact = false) => {
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={`${isCompact ? 'w-8 h-8' : 'w-9 h-9'}`}></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const isSelected = isDateSelected(date);
      const isStart = isStartDate(date);
      const isEnd = isEndDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            ${isCompact ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-sm'} 
            flex items-center justify-center font-medium
            hover:bg-blue-50 transition-colors border border-transparent
            ${isSelected 
              ? 'bg-blue-600 text-white border-blue-600' 
              : isToday 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'text-gray-900 hover:text-blue-600 hover:border-blue-200'
            }
            ${(isStart || isEnd) ? 'rounded-full' : ''}
            ${isSelected && !isStart && !isEnd ? 'bg-blue-100 text-blue-600' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className={`${isCompact ? 'w-60' : 'w-64'}`}>
        <div className={`text-center font-semibold ${isCompact ? 'text-base' : 'text-lg'} text-gray-900 ${isCompact ? 'mb-4' : 'mb-2'}`}>
          {monthName}
        </div>
        <div className={`grid grid-cols-7 gap-1 ${isCompact ? 'mb-2' : 'mb-1'}`}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className={`${isCompact ? 'w-8 h-6' : 'w-9 h-6'} flex items-center justify-center text-sm font-medium text-gray-500`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // Calculate responsive width and positioning
  const calculatePopupStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute', // Changed from 'fixed' to 'absolute'
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '16px',
      minWidth: '300px',
      maxWidth: '90vw',
    };

    if (!position) {
      // Fallback for when position is not provided, though it should be.
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(800px, 90vw)',
      };
    }
    
    // Use the exact position passed from the parent
    return {
      ...baseStyle,
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
  };

  const popupStyle = calculatePopupStyle();

  return createPortal(
    <div
      ref={popupRef}
      className="calendar-popup relative"
      style={popupStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Date range picker calendar"
    >
      {/* Small arrow pointing up to search bar */}
      {position && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
      )}
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 id="calendar-heading" className="text-lg font-semibold text-gray-900">
          Select dates
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPrevMonth} 
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <button 
            onClick={goToNextMonth} 
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-center gap-4">
        {renderMonth(currentMonth)}
        {!isMobile && !isTablet && (
          <div className="hidden sm:block">
            {renderMonth(nextMonth)}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
} 