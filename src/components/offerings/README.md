# Scheduling Step Component

The `SchedulingStep` component is a comprehensive Step 4 implementation for the offering creation wizard. It provides a complete scheduling and availability management interface.

## Features

- **Schedule Type Selection**: Fixed dates, recurring patterns, or on-demand booking
- **Timezone Management**: Auto-detection with manual override options
- **Booking Rules**: Configurable advance booking days and cutoff times
- **Recurring Pattern Builder**: Support for daily, weekly, and monthly patterns
- **Blackout Dates**: Add holidays, maintenance days, and custom unavailable dates
- **Seasonal Availability**: Define operating seasons (e.g., summer-only operations)
- **Responsive Design**: Mobile-friendly with collapsible sections
- **Form Validation**: Real-time validation with error messages
- **Integration Ready**: Works with existing form management systems

## Usage

### Basic Implementation

```tsx
import { SchedulingStep } from '@/components/offerings';

function MyOfferingWizard() {
  const [formData, setFormData] = useState({
    scheduling: {
      scheduleType: 'recurring',
      timezone: 'America/Toronto',
      advanceBookingDays: 30,
      cutoffHours: 24,
      // ... other scheduling fields
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdate = (field: string, value: any) => {
    // Handle nested field updates
    setFormData(prev => {
      const newData = { ...prev };
      const pathParts = field.split('.');
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      return newData;
    });
  };

  return (
    <SchedulingStep
      formData={formData}
      onUpdate={handleUpdate}
      errors={errors}
      isLoading={false}
    />
  );
}
```

### With Custom Hook

```tsx
import { SchedulingStep } from '@/components/offerings';
import { useSchedulingForm } from '@/hooks/useSchedulingForm';

function MyOfferingWizard() {
  const {
    data,
    errors,
    isValid,
    updateField,
    addBlackoutDate,
    removeBlackoutDate,
    getRecurringPatternText,
    getSeasonalAvailabilityText
  } = useSchedulingForm({
    initialData: {
      scheduleType: 'recurring',
      timezone: 'America/Toronto',
      advanceBookingDays: 30,
      cutoffHours: 24
    },
    onValidationChange: (isValid) => {
      console.log('Step is valid:', isValid);
    },
    onDataChange: (data) => {
      console.log('Data changed:', data);
    }
  });

  return (
    <SchedulingStep
      formData={{ scheduling: data }}
      onUpdate={updateField}
      errors={errors}
      isLoading={false}
    />
  );
}
```

## Props

### SchedulingStep Props

| Prop | Type | Description |
|------|------|-------------|
| `formData` | `any` | The complete form data object containing scheduling data |
| `onUpdate` | `(field: string, value: any) => void` | Callback for field updates |
| `errors` | `Record<string, string>` | Validation errors keyed by field path |
| `isLoading` | `boolean` | Loading state for async operations |

### useSchedulingForm Hook Props

| Prop | Type | Description |
|------|------|-------------|
| `initialData` | `Partial<SchedulingFormData>` | Initial form data |
| `onValidationChange` | `(isValid: boolean) => void` | Validation change callback |
| `onDataChange` | `(data: SchedulingFormData) => void` | Data change callback |

## Data Structure

The component expects the following data structure:

```typescript
interface SchedulingFormData {
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
```

## Schedule Types

### Fixed Dates
- Best for: Specific events, one-time tours
- Default settings: 30 days advance booking, 24 hours cutoff
- Features: Manual date selection, no recurring patterns

### Recurring Patterns
- Best for: Regular schedules, ongoing services
- Default settings: 90 days advance booking, 2 hours cutoff
- Features: Daily/weekly/monthly patterns, day-of-week selection

### On-Demand
- Best for: Flexible services, immediate booking
- Default settings: 0 days advance booking, 0 hours cutoff
- Features: Immediate availability, no scheduling restrictions

## Validation

The component includes comprehensive validation:

- **Required fields**: Schedule type, timezone
- **Range validation**: Advance booking (0-365 days), cutoff (0-168 hours)
- **Pattern validation**: Recurring pattern consistency
- **Date validation**: Blackout dates and seasonal periods
- **Business logic**: Appropriate defaults for each schedule type

## Styling

The component uses Tailwind CSS with:
- Responsive breakpoints (mobile-first)
- Accordion-style sections for better organization
- Consistent color scheme (blue primary, gray neutrals)
- Proper focus states and accessibility
- Loading states and error displays

## Integration with Existing Systems

The component is designed to integrate with:
- Existing form management systems
- Multi-step wizards
- Validation libraries (Zod)
- State management solutions
- API integration patterns

## Demo

See `SchedulingStepDemo.tsx` for a complete integration example showing how to use the component within a multi-step wizard with proper state management and navigation. 