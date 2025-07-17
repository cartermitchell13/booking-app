'use client';

import { useState, useCallback } from 'react';
import { SchedulingStep } from './SchedulingStep';
import { useSchedulingForm } from '@/hooks/useSchedulingForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

/**
 * Demo component showing how to integrate the SchedulingStep into the offering creation wizard
 * This demonstrates the proper integration pattern with form state management
 */
export function SchedulingStepDemo() {
  const [currentStep, setCurrentStep] = useState(4); // Step 4 is scheduling
  const [formData, setFormData] = useState<any>({
    businessType: 'transportation',
    productType: 'seat',
    basicInfo: {
      name: 'Banff National Park Bus Tour',
      description: 'Explore the stunning landscapes of Banff National Park',
      location: 'Calgary, AB',
      category: 'tour',
      duration: 480, // 8 hours
      difficultyLevel: 'easy',
      minAge: 5,
      maxGroupSize: 45,
      tags: ['nature', 'sightseeing', 'photography']
    },
    productConfig: {
      vehicleType: 'Coach Bus',
      totalSeats: 45,
      amenities: ['Air Conditioning', 'Restroom', 'Wi-Fi'],
      pickupLocations: [
        { name: 'Calgary Downtown', address: '123 Main St', pickupTimeOffset: 0 },
        { name: 'Calgary Airport', address: 'YYC Airport', pickupTimeOffset: 30 }
      ]
    },
    scheduling: {
      scheduleType: 'recurring',
      timezone: 'America/Edmonton',
      advanceBookingDays: 60,
      cutoffHours: 24,
      recurringPattern: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-10-31')
      },
      blackoutDates: [],
      seasonalAvailability: {
        startMonth: 5, // May
        endMonth: 10   // October
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize scheduling form hook
  const {
    data: schedulingData,
    errors: schedulingErrors,
    isValid: isSchedulingValid,
    getRecurringPatternText,
    getSeasonalAvailabilityText
  } = useSchedulingForm({
    initialData: formData.scheduling,
    onValidationChange: (isValid) => {
      console.log('Scheduling step validation:', isValid);
    },
    onDataChange: (data) => {
      console.log('Scheduling data changed:', data);
    }
  });

  // Handle form field updates
  const handleUpdate = useCallback((field: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      
      // Handle nested paths like 'scheduling.scheduleType'
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
  }, []);

  // Handle navigation
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (isSchedulingValid) {
      setCurrentStep(prev => Math.min(7, prev + 1));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Scheduling settings saved successfully!');
    }, 2000);
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Step {currentStep} of 7</div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                const status = getStepStatus(step);
                return (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      status === 'completed'
                        ? 'bg-green-500'
                        : status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {isSchedulingValid ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Valid
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                Incomplete
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Current Step Content */}
      {currentStep === 4 && (
        <SchedulingStep
          formData={formData}
          onUpdate={handleUpdate}
          errors={schedulingErrors}
          isLoading={isLoading}
        />
      )}

      {/* Step Summary (for demo purposes) */}
      {currentStep === 4 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Schedule Type:</span>
              <span className="font-medium">{formData.scheduling?.scheduleType || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timezone:</span>
              <span className="font-medium">{formData.scheduling?.timezone || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Advance Booking:</span>
              <span className="font-medium">{formData.scheduling?.advanceBookingDays || 0} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Cutoff:</span>
              <span className="font-medium">{formData.scheduling?.cutoffHours || 0} hours</span>
            </div>
            {formData.scheduling?.recurringPattern && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recurring Pattern:</span>
                <span className="font-medium">{getRecurringPatternText()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Seasonal Availability:</span>
              <span className="font-medium">{getSeasonalAvailabilityText()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blackout Dates:</span>
              <span className="font-medium">
                {formData.scheduling?.blackoutDates?.length || 0} configured
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              disabled={!isSchedulingValid || isLoading}
              variant="outline"
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Draft'}
            </Button>
            
            <Button
              onClick={() => alert('Preview functionality would show how the offering looks to customers')}
              variant="outline"
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!isSchedulingValid || currentStep === 7}
            className="flex items-center"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Debug Info (for development) */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-2">Debug Information</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>Current Step: {currentStep}</div>
          <div>Scheduling Valid: {isSchedulingValid ? 'Yes' : 'No'}</div>
          <div>Errors: {Object.keys(schedulingErrors).length}</div>
          <div>Schedule Type: {formData.scheduling?.scheduleType || 'None'}</div>
          <div>Timezone: {formData.scheduling?.timezone || 'None'}</div>
          <div>Blackout Dates: {formData.scheduling?.blackoutDates?.length || 0}</div>
        </div>
      </Card>
    </div>
  );
} 