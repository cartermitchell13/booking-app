import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';

// Validation schema for scheduling
const SchedulingValidationSchema = z.object({
  scheduleType: z.enum(['fixed', 'recurring', 'on-demand'], {
    message: 'Please select a schedule type'
  }),
  timezone: z.string().min(1, 'Timezone is required'),
  advanceBookingDays: z.number().min(0, 'Advance booking days cannot be negative').max(365, 'Advance booking cannot exceed 365 days'),
  cutoffHours: z.number().min(0, 'Cutoff hours cannot be negative').max(168, 'Cutoff cannot exceed 7 days'),
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    interval: z.number().min(1).max(52).optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional()
  }).optional(),
  blackoutDates: z.array(z.object({
    id: z.string(),
    date: z.date(),
    reason: z.string().min(1, 'Reason is required'),
    type: z.enum(['holiday', 'maintenance', 'custom'])
  })).optional(),
  seasonalAvailability: z.object({
    startMonth: z.number().min(1).max(12).optional(),
    endMonth: z.number().min(1).max(12).optional()
  }).optional()
});

export interface SchedulingFormData {
  scheduleType: 'fixed' | 'recurring' | 'on-demand';
  timezone: string;
  advanceBookingDays: number;
  cutoffHours: number;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    startDate?: Date;
    endDate?: Date;
  };
  blackoutDates?: Array<{
    id: string;
    date: Date;
    reason: string;
    type: 'holiday' | 'maintenance' | 'custom';
  }>;
  seasonalAvailability?: {
    startMonth?: number;
    endMonth?: number;
  };
}

export interface UseSchedulingFormProps {
  initialData?: Partial<SchedulingFormData>;
  onValidationChange?: (isValid: boolean) => void;
  onDataChange?: (data: SchedulingFormData) => void;
}

export function useSchedulingForm({
  initialData,
  onValidationChange,
  onDataChange
}: UseSchedulingFormProps = {}) {
  const [data, setData] = useState<Partial<SchedulingFormData>>({
    scheduleType: 'fixed',
    timezone: '',
    advanceBookingDays: 30,
    cutoffHours: 24,
    blackoutDates: [],
    seasonalAvailability: {},
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Auto-detect timezone on mount
  useEffect(() => {
    if (!data.timezone) {
      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setData(prev => ({ ...prev, timezone: detectedTimezone }));
      } catch (error) {
        console.warn('Could not auto-detect timezone:', error);
        setData(prev => ({ ...prev, timezone: 'America/Toronto' }));
      }
    }
  }, [data.timezone]);

  // Validate form data
  const validateForm = useCallback((formData: Partial<SchedulingFormData>) => {
    try {
      SchedulingValidationSchema.parse(formData);
      setErrors({});
      setIsValid(true);
      onValidationChange?.(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path) {
            const fieldPath = err.path.join('.');
            fieldErrors[fieldPath] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsValid(false);
        onValidationChange?.(false);
      }
      return false;
    }
  }, [onValidationChange]);

  // Update field value
  const updateField = useCallback((path: string, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      
      // Handle nested paths like 'recurringPattern.frequency'
      const pathParts = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      // Set default values based on schedule type
      if (path === 'scheduleType') {
        if (value === 'fixed') {
          newData.advanceBookingDays = 30;
          newData.cutoffHours = 24;
          delete newData.recurringPattern;
        } else if (value === 'recurring') {
          newData.advanceBookingDays = 90;
          newData.cutoffHours = 2;
          newData.recurringPattern = {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
          };
        } else if (value === 'on-demand') {
          newData.advanceBookingDays = 0;
          newData.cutoffHours = 0;
          delete newData.recurringPattern;
        }
      }
      
      return newData;
    });
  }, []);

  // Add blackout date
  const addBlackoutDate = useCallback((blackoutData: {
    date: Date;
    reason: string;
    type: 'holiday' | 'maintenance' | 'custom';
  }) => {
    const newBlackout = {
      id: Date.now().toString(),
      ...blackoutData
    };
    
    setData(prev => ({
      ...prev,
      blackoutDates: [...(prev.blackoutDates || []), newBlackout]
    }));
  }, []);

  // Remove blackout date
  const removeBlackoutDate = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      blackoutDates: (prev.blackoutDates || []).filter(b => b.id !== id)
    }));
  }, []);

  // Get suggested values based on schedule type
  const getSuggestedValues = useCallback((scheduleType: 'fixed' | 'recurring' | 'on-demand') => {
    switch (scheduleType) {
      case 'fixed':
        return {
          advanceBookingDays: 30,
          cutoffHours: 24,
          description: 'Best for specific events and tours with set dates'
        };
      case 'recurring':
        return {
          advanceBookingDays: 90,
          cutoffHours: 2,
          description: 'Perfect for regular schedules like daily tours or weekly classes'
        };
      case 'on-demand':
        return {
          advanceBookingDays: 0,
          cutoffHours: 0,
          description: 'Ideal for flexible services available anytime'
        };
      default:
        return {};
    }
  }, []);

  // Get validation errors for specific field
  const getFieldError = useCallback((fieldPath: string) => {
    return errors[fieldPath] || '';
  }, [errors]);

  // Check if specific field is valid
  const isFieldValid = useCallback((fieldPath: string) => {
    return !errors[fieldPath];
  }, [errors]);

  // Get recurring pattern display text
  const getRecurringPatternText = useCallback(() => {
    const pattern = data.recurringPattern;
    if (!pattern) return '';
    
    const { frequency, interval, daysOfWeek } = pattern;
    
    if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
      return `Every ${interval || 1} week(s) on ${selectedDays}`;
    }
    
    return `Every ${interval || 1} ${frequency || 'week'}(s)`;
  }, [data.recurringPattern]);

  // Get seasonal availability display text
  const getSeasonalAvailabilityText = useCallback(() => {
    const seasonal = data.seasonalAvailability;
    if (!seasonal?.startMonth || !seasonal?.endMonth) return 'Year-round';
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[seasonal.startMonth - 1]} to ${months[seasonal.endMonth - 1]}`;
  }, [data.seasonalAvailability]);

  // Validate form whenever data changes
  useEffect(() => {
    validateForm(data);
    onDataChange?.(data as SchedulingFormData);
  }, [data, validateForm, onDataChange]);

  return {
    data,
    errors,
    isValid,
    updateField,
    addBlackoutDate,
    removeBlackoutDate,
    getSuggestedValues,
    getFieldError,
    isFieldValid,
    getRecurringPatternText,
    getSeasonalAvailabilityText,
    validateForm: () => validateForm(data)
  };
} 