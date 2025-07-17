'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/date-range-picker';
import { 
  Calendar, 
  Clock, 
  Globe, 
  AlertCircle, 
  Plus, 
  X, 
  Settings, 
  Zap,
  RepeatIcon,
  Ban,
  Snowflake,
  Sun,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2
} from 'lucide-react';

interface SchedulingStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
  isLoading?: boolean;
}

interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  startDate?: Date;
  endDate?: Date;
}

interface BlackoutDate {
  id: string;
  date: Date;
  reason: string;
  type: 'holiday' | 'maintenance' | 'custom';
}

interface SeasonalAvailability {
  name: string;
  startMonth: number;
  endMonth: number;
  isActive: boolean;
}

const SCHEDULE_TYPES = [
  {
    id: 'fixed',
    name: 'Fixed Dates',
    description: 'Specific dates and times',
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    id: 'recurring',
    name: 'Recurring Pattern',
    description: 'Regular schedule with patterns',
    icon: RepeatIcon,
    color: 'bg-green-500'
  },
  {
    id: 'on-demand',
    name: 'On-Demand',
    description: 'Flexible booking available anytime',
    icon: Zap,
    color: 'bg-purple-500'
  }
];

const TIMEZONES = [
  { value: 'America/Toronto', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Vancouver', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'America/Edmonton', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Winnipeg', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Halifax', label: 'Atlantic Time (AT)', offset: '-04:00' },
  { value: 'America/St_Johns', label: 'Newfoundland Time (NT)', offset: '-03:30' },
  { value: 'America/New_York', label: 'Eastern Time (US)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)', offset: '-08:00' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: '+10:00' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

// Simple multi-date picker component
const MultiDatePicker = ({ selectedDates, onDateSelect }: { selectedDates: string[], onDateSelect: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };
  
  const isDateSelected = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    return selectedDates.includes(dateString);
  };
  
  const isDatePast = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  
  const handleDateClick = (day: number) => {
    if (isDatePast(day)) return;
    const date = new Date(year, month, day);
    onDateSelect(date);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="p-2 text-center text-sm font-medium text-gray-500">
            {day.short}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>;
          }
          
          const isSelected = isDateSelected(day);
          const isPast = isDatePast(day);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={`p-2 text-sm rounded-lg transition-colors ${
                isPast
                  ? 'text-gray-300 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BLACKOUT_TYPES = [
  { id: 'holiday', name: 'Holiday', color: 'bg-red-500' },
  { id: 'maintenance', name: 'Maintenance', color: 'bg-yellow-500' },
  { id: 'custom', name: 'Custom', color: 'bg-gray-500' }
];

export function SchedulingStep({ formData, onUpdate, errors, isLoading }: SchedulingStepProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('schedule-type');
  const [autoDetectedTimezone, setAutoDetectedTimezone] = useState<string>('');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newBlackoutReason, setNewBlackoutReason] = useState('');
  const [newBlackoutType, setNewBlackoutType] = useState<'holiday' | 'maintenance' | 'custom'>('custom');

  const scheduling = formData.scheduling || {};
  
  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setAutoDetectedTimezone(detectedTimezone);
      
      // If no timezone is set, use the detected one
      if (!scheduling.timezone) {
        onUpdate('scheduling.timezone', detectedTimezone);
      }
    } catch (error) {
      console.warn('Could not auto-detect timezone:', error);
      setAutoDetectedTimezone('America/Toronto'); // Fallback
    }
  }, []);

  // Handle schedule type selection
  const handleScheduleTypeChange = useCallback((type: string) => {
    onUpdate('scheduling.scheduleType', type);
    
    // Set default values based on schedule type
    if (type === 'fixed') {
      onUpdate('scheduling.advanceBookingDays', 30);
      onUpdate('scheduling.cutoffHours', 24);
    } else if (type === 'recurring') {
      onUpdate('scheduling.advanceBookingDays', 90);
      onUpdate('scheduling.cutoffHours', 2);
      onUpdate('scheduling.recurringPattern', {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
      });
    } else if (type === 'on-demand') {
      onUpdate('scheduling.advanceBookingDays', 0);
      onUpdate('scheduling.cutoffHours', 0);
    }
  }, [onUpdate]);

  // Handle recurring pattern updates
  const handleRecurringPatternChange = useCallback((field: string, value: any) => {
    const currentPattern = scheduling.recurringPattern || {};
    onUpdate('scheduling.recurringPattern', {
      ...currentPattern,
      [field]: value
    });
  }, [scheduling.recurringPattern, onUpdate]);

  // Handle days of week selection
  const handleDayOfWeekToggle = useCallback((day: number) => {
    const currentPattern = scheduling.recurringPattern || {};
    const currentDays = currentPattern.daysOfWeek || [];
    
    let newDays;
    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d: number) => d !== day);
    } else {
      newDays = [...currentDays, day].sort();
    }
    
    handleRecurringPatternChange('daysOfWeek', newDays);
  }, [scheduling.recurringPattern, handleRecurringPatternChange]);

  // Handle blackout date addition
  const handleAddBlackoutDate = useCallback(() => {
    if (!newBlackoutDate || !newBlackoutReason.trim()) return;
    
    const newBlackout: BlackoutDate = {
      id: Date.now().toString(),
      date: new Date(newBlackoutDate),
      reason: newBlackoutReason.trim(),
      type: newBlackoutType
    };
    
    const currentBlackouts = scheduling.blackoutDates || [];
    onUpdate('scheduling.blackoutDates', [...currentBlackouts, newBlackout]);
    
    // Reset form
    setNewBlackoutDate('');
    setNewBlackoutReason('');
    setNewBlackoutType('custom');
    setShowAddBlackout(false);
  }, [newBlackoutDate, newBlackoutReason, newBlackoutType, scheduling.blackoutDates, onUpdate]);

  // Handle blackout date removal
  const handleRemoveBlackoutDate = useCallback((id: string) => {
    const currentBlackouts = scheduling.blackoutDates || [];
    onUpdate('scheduling.blackoutDates', currentBlackouts.filter((b: BlackoutDate) => b.id !== id));
  }, [scheduling.blackoutDates, onUpdate]);

  // Handle seasonal availability
  const handleSeasonalAvailabilityChange = useCallback((field: string, value: any) => {
    const currentSeasonal = scheduling.seasonalAvailability || {};
    onUpdate('scheduling.seasonalAvailability', {
      ...currentSeasonal,
      [field]: value
    });
  }, [scheduling.seasonalAvailability, onUpdate]);

  // Handle fixed dates
  const handleRemoveFixedDate = useCallback((dateToRemove: string) => {
    const currentDates = scheduling.fixedDates || [];
    const newDates = currentDates.filter((date: string) => date !== dateToRemove);
    onUpdate('scheduling.fixedDates', newDates);
  }, [scheduling.fixedDates, onUpdate]);

  const handleAddFixedDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const currentDates = scheduling.fixedDates || [];
    
    // Check if date already exists
    if (currentDates.includes(dateString)) {
      // Remove if already selected
      const newDates = currentDates.filter((d: string) => d !== dateString);
      onUpdate('scheduling.fixedDates', newDates);
    } else {
      // Add new date
      const newDates = [...currentDates, dateString].sort();
      onUpdate('scheduling.fixedDates', newDates);
    }
  }, [scheduling.fixedDates, onUpdate]);

  // Get timezone display
  const getTimezoneDisplay = (timezone: string) => {
    const tz = TIMEZONES.find(t => t.value === timezone);
    return tz ? `${tz.label} (${tz.offset})` : timezone;
  };

  // Accordion toggle
  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheduling & Availability</h2>
        <p className="text-gray-600">Set up when your offering is available for booking</p>
      </div>

      {/* Schedule Type Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('schedule-type')}>
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Schedule Type</h3>
              <p className="text-sm text-gray-600">Choose how your offering is scheduled</p>
            </div>
          </div>
          {activeAccordion === 'schedule-type' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {activeAccordion === 'schedule-type' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SCHEDULE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = scheduling.scheduleType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleScheduleTypeChange(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mr-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{type.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
            
            {errors['scheduling.scheduleType'] && (
              <div className="flex items-center text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['scheduling.scheduleType']}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Fixed Dates (only show if fixed schedule type) */}
      {scheduling.scheduleType === 'fixed' && (
        <Card className="p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('fixed-dates')}>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Fixed Dates</h3>
                <p className="text-sm text-gray-600">Select specific dates for your offering</p>
              </div>
            </div>
            {activeAccordion === 'fixed-dates' ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
          
          {activeAccordion === 'fixed-dates' && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Fixed Date Scheduling</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Select specific dates when your offering will be available. Perfect for special events, seasonal tours, or one-time activities.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Available Dates
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <MultiDatePicker
                    selectedDates={scheduling.fixedDates || []}
                    onDateSelect={handleAddFixedDate}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click on individual dates to select them. You can select multiple dates.
                </p>
                {errors['scheduling.fixedDates'] && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors['scheduling.fixedDates']}
                  </div>
                )}
              </div>

              {scheduling.fixedDates && scheduling.fixedDates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Dates ({scheduling.fixedDates.length})
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {scheduling.fixedDates.map((date: string, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                          <span className="text-sm text-gray-700">
                            {new Date(date).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFixedDate(date)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Timezone Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('timezone')}>
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Timezone</h3>
              <p className="text-sm text-gray-600">Set your operating timezone</p>
            </div>
          </div>
          {activeAccordion === 'timezone' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {activeAccordion === 'timezone' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Auto-detected: {getTimezoneDisplay(autoDetectedTimezone)}
                </span>
              </div>
              <button
                onClick={() => onUpdate('scheduling.timezone', autoDetectedTimezone)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Use This
              </button>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Timezone
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="block truncate">
                    {scheduling.timezone ? getTimezoneDisplay(scheduling.timezone) : 'Select timezone...'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                
                {showTimezoneDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {TIMEZONES.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => {
                          onUpdate('scheduling.timezone', tz.value);
                          setShowTimezoneDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="block text-sm text-gray-900">{tz.label}</span>
                          <span className="text-sm text-gray-500">{tz.offset}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {errors['scheduling.timezone'] && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['scheduling.timezone']}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Booking Rules */}
      <Card className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('booking-rules')}>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Rules</h3>
              <p className="text-sm text-gray-600">Set advance booking and cutoff times</p>
            </div>
          </div>
          {activeAccordion === 'booking-rules' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {activeAccordion === 'booking-rules' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Booking (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={scheduling.advanceBookingDays || ''}
                  onChange={(e) => onUpdate('scheduling.advanceBookingDays', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 30"
                />
                <p className="text-sm text-gray-500 mt-1">
                  How many days in advance customers can book
                </p>
                {errors['scheduling.advanceBookingDays'] && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors['scheduling.advanceBookingDays']}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Cutoff (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={scheduling.cutoffHours || ''}
                  onChange={(e) => onUpdate('scheduling.cutoffHours', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 24"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Booking deadline before activity starts
                </p>
                {errors['scheduling.cutoffHours'] && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors['scheduling.cutoffHours']}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>


      {/* Recurring Pattern (only show if recurring schedule type) */}
      {scheduling.scheduleType === 'recurring' && (
        <Card className="p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('recurring')}>
            <div className="flex items-center">
              <RepeatIcon className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recurring Pattern</h3>
                <p className="text-sm text-gray-600">Set up your recurring schedule</p>
              </div>
            </div>
            {activeAccordion === 'recurring' ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
          
          {activeAccordion === 'recurring' && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={scheduling.recurringPattern?.frequency || 'weekly'}
                    onChange={(e) => handleRecurringPatternChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={scheduling.recurringPattern?.interval || 1}
                    onChange={(e) => handleRecurringPatternChange('interval', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Every {scheduling.recurringPattern?.interval || 1} {scheduling.recurringPattern?.frequency || 'week'}(s)
                  </p>
                </div>
              </div>
              
              {scheduling.recurringPattern?.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = scheduling.recurringPattern?.daysOfWeek?.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayOfWeekToggle(day.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={scheduling.recurringPattern?.startDate ? scheduling.recurringPattern.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleRecurringPatternChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={scheduling.recurringPattern?.endDate ? scheduling.recurringPattern.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleRecurringPatternChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Blackout Dates (only show for recurring and on-demand schedules) */}
      {scheduling.scheduleType !== 'fixed' && (
        <Card className="p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('blackout')}>
            <div className="flex items-center">
              <Ban className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Blackout Dates</h3>
                <p className="text-sm text-gray-600">Block specific dates when unavailable</p>
              </div>
            </div>
            {activeAccordion === 'blackout' ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        
        {activeAccordion === 'blackout' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Add dates when your offering is not available
              </p>
              <button
                onClick={() => setShowAddBlackout(!showAddBlackout)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Blackout
              </button>
            </div>
            
            {showAddBlackout && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newBlackoutDate}
                      onChange={(e) => setNewBlackoutDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newBlackoutType}
                      onChange={(e) => setNewBlackoutType(e.target.value as 'holiday' | 'maintenance' | 'custom')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {BLACKOUT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={newBlackoutReason}
                      onChange={(e) => setNewBlackoutReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Christmas Day"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddBlackout(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBlackoutDate}
                    disabled={!newBlackoutDate || !newBlackoutReason.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Blackout
                  </button>
                </div>
              </div>
            )}
            
            {/* List of blackout dates */}
            {scheduling.blackoutDates && scheduling.blackoutDates.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Current Blackout Dates</h4>
                {scheduling.blackoutDates.map((blackout: BlackoutDate) => {
                  const typeConfig = BLACKOUT_TYPES.find(t => t.id === blackout.type);
                  return (
                    <div key={blackout.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${typeConfig?.color || 'bg-gray-500'} mr-3`}></div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {blackout.date.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">{blackout.reason}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBlackoutDate(blackout.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>
      )}

      {/* Seasonal Availability */}
      <Card className="p-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccordion('seasonal')}>
          <div className="flex items-center">
            <Sun className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Seasonal Availability</h3>
              <p className="text-sm text-gray-600">Define seasonal operating periods</p>
            </div>
          </div>
          {activeAccordion === 'seasonal' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {activeAccordion === 'seasonal' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Snowflake className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Leave empty to operate year-round
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Month
                </label>
                <select
                  value={scheduling.seasonalAvailability?.startMonth || ''}
                  onChange={(e) => handleSeasonalAvailabilityChange('startMonth', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select start month...</option>
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Month
                </label>
                <select
                  value={scheduling.seasonalAvailability?.endMonth || ''}
                  onChange={(e) => handleSeasonalAvailabilityChange('endMonth', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select end month...</option>
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {scheduling.seasonalAvailability?.startMonth && scheduling.seasonalAvailability?.endMonth && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Sun className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Operating season: {MONTHS[scheduling.seasonalAvailability.startMonth - 1]} to {MONTHS[scheduling.seasonalAvailability.endMonth - 1]}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Saving scheduling settings...</span>
        </div>
      )}
    </div>
  );
} 