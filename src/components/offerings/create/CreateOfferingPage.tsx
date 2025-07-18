'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SchedulingStep as SchedulingStepComponent } from '@/components/offerings/SchedulingStep';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle,
  Home,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOfferingForm } from '@/hooks/useOfferingForm';

// Import step components
import { BusinessTypeStep } from './steps/BusinessTypeStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ConfigurationStep } from './steps/ConfigurationStep';
import { PricingStep } from './steps/PricingStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';

// Import constants
import { WIZARD_STEPS } from './constants';

// Import types
import { OfferingFormData } from './types/createOfferingTypes';

export const CreateOfferingPage: React.FC = () => {
  const router = useRouter();
  const { 
    formData, 
    updateFormData, 
    currentStep, 
    goToStep, 
    nextStep, 
    prevStep, 
    validateStep, 
    submitForm, 
    isSubmitting, 
    lastAutoSave, 
    saveProgress 
  } = useOfferingForm();
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const getStepValidationErrors = (stepId: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch (stepId) {
      case 1: // Business Type
        if (!formData.businessType) {
          errors.businessType = 'Business type is required';
        }
        if (!formData.productType) {
          errors.productType = 'Product type is required';
        }
        break;

      case 2: // Basic Info
        if (!formData.basicInfo?.name) {
          errors.name = 'Offering name is required';
        }
        if (!formData.basicInfo?.description || formData.basicInfo.description.length < 10) {
          errors.description = 'Description must be at least 10 characters';
        }
        if (!formData.basicInfo?.location) {
          errors.location = 'Location is required';
        }
        if (!formData.basicInfo?.category) {
          errors.category = 'Category is required';
        }
        break;

      case 3: // Product Config
        // Dynamic validation based on product type
        break;

      case 4: // Scheduling
        if (!formData.scheduling?.scheduleType) {
          errors.scheduleType = 'Schedule type is required';
        }
        if (!formData.scheduling?.timezone) {
          errors.timezone = 'Timezone is required';
        }
        break;

      case 5: // Pricing
        if (!formData.pricing?.basePricing?.adult || formData.pricing.basePricing.adult <= 0) {
          errors.adult = 'Adult price is required and must be greater than 0';
        }
        if (!formData.pricing?.currency) {
          errors.currency = 'Currency is required';
        }
        break;

      case 6: // Media
        if (!formData.media?.images || formData.media.images.length === 0) {
          errors.images = 'At least one image is required';
        }
        if (!formData.media?.seoData?.metaTitle) {
          errors.metaTitle = 'Meta title is required';
        }
        if (!formData.media?.seoData?.metaDescription) {
          errors.metaDescription = 'Meta description is required';
        }
        break;
    }

    return errors;
  };

  const handleNext = () => {
    const stepErrors = getStepValidationErrors(currentStep);
    setValidationErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setShowValidationErrors(false);
      if (validateStep(currentStep)) {
        nextStep();
      }
    } else {
      setShowValidationErrors(true);
    }
  };

  const handlePrevious = () => {
    setShowValidationErrors(false);
    setValidationErrors({});
    prevStep();
  };

  const handleStepChange = (stepId: number) => {
    setShowValidationErrors(false);
    setValidationErrors({});
    goToStep(stepId);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await saveProgress();
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await submitForm();
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep - 1];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Offerings</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-600">Create New Offering</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Offering</h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep} of {WIZARD_STEPS.length}: {currentStepData.title}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastAutoSave && (
            <div className="text-xs text-gray-500">
              Saved {lastAutoSave.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Draft
          </button>
          <button
            onClick={() => router.push('/dashboard/offerings')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offerings
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isAccessible = step.id <= currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isAccessible && handleStepChange(step.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-600'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isAccessible
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isAccessible}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs">{step.description}</div>
                  </div>
                  {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && <BusinessTypeStep formData={formData as any} updateFormData={updateFormData as any} errors={showValidationErrors ? validationErrors : undefined} />}
        {currentStep === 2 && <BasicInfoStep formData={formData as any} updateFormData={updateFormData as any} errors={showValidationErrors ? validationErrors : undefined} />}
        {currentStep === 3 && <ConfigurationStep formData={formData as any} updateFormData={updateFormData as any} errors={showValidationErrors ? validationErrors : undefined} />}
        {currentStep === 4 && <SchedulingStepWithAdapter formData={formData as any} updateFormData={updateFormData as any} />}
        {currentStep === 5 && <PricingStep formData={formData as any} updateFormData={updateFormData as any} errors={showValidationErrors ? validationErrors : undefined} />}
        {currentStep === 6 && <MediaStep formData={formData as any} updateFormData={updateFormData as any} errors={showValidationErrors ? validationErrors : undefined} />}
        {currentStep === 7 && <ReviewStep formData={formData as any} updateFormData={updateFormData as any} />}
      </Card>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {currentStep < WIZARD_STEPS.length ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Create Offering
            </button>
          )}
        </div>

        {/* Validation Error Message */}
        {showValidationErrors && Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors to continue:
                </h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Temporary adapter component for the existing SchedulingStep
const SchedulingStepWithAdapter: React.FC<{
  formData: Partial<OfferingFormData>;
  updateFormData: (section: keyof OfferingFormData, data: any) => void;
}> = ({ formData, updateFormData }) => {
  const handleSchedulingUpdate = (field: string, value: any) => {
    if (field.startsWith('scheduling.')) {
      const fieldName = field.replace('scheduling.', '');
      updateFormData('scheduling', { ...formData.scheduling, [fieldName]: value });
    } else {
      updateFormData('scheduling', { ...formData.scheduling, [field]: value });
    }
  };

  const getFieldErrors = () => {
    const fieldErrors: Record<string, string> = {};
    
    if (!formData.scheduling?.scheduleType) {
      fieldErrors['scheduling.scheduleType'] = 'Schedule type is required';
    }
    if (!formData.scheduling?.timezone) {
      fieldErrors['scheduling.timezone'] = 'Timezone is required';
    }
    
    return fieldErrors;
  };

  return (
    <SchedulingStepComponent
      formData={formData}
      onUpdate={handleSchedulingUpdate}
      errors={getFieldErrors()}
      isLoading={false}
    />
  );
};

export default CreateOfferingPage; 