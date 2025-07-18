import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Simple form data structure
export interface OfferingFormData {
  businessType: string;
  productType: string;
  basicInfo: {
    name: string;
    description: string;
    location: string;
    category: string;
    duration: number;
    difficultyLevel: string;
    minAge: number;
    maxGroupSize?: number;
    tags?: string[];
  };
  productConfig: Record<string, any>;
  scheduling: {
    scheduleType: string;
    timezone: string;
    advanceBookingDays: number;
    cutoffHours: number;
    recurringPattern?: Record<string, any>;
    blackoutDates?: Date[];
  };
  pricing: {
    basePricing: {
      adult: number;
      child?: number;
      student?: number;
      senior?: number;
    };
    currency: string;
    groupDiscounts?: any[];
    seasonalPricing?: any[];
    cancellationPolicy: {
      freeCancellationHours: number;
      refundPercentage: number;
      processingFee?: number;
    };
    depositRequired: boolean;
    depositAmount?: number;
    taxInclusive: boolean;
  };
  media: {
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
      order: number;
    }>;
    videos?: Array<{
      url: string;
      title: string;
      type: string;
      order: number;
    }>;
    seoData: {
      metaTitle: string;
      metaDescription: string;
      keywords?: string[];
      slug: string;
    };
    socialMedia?: {
      shareTitle: string;
      shareDescription: string;
      shareImage?: string;
    };
  };
  isDraft: boolean;
  lastModified: Date;
}

// Step status tracking
export interface StepStatus {
  [stepId: number]: {
    isCompleted: boolean;
    isValid: boolean;
    errors: string[];
    lastUpdated: Date;
  };
}

// Form validation errors
export interface FormErrors {
  [field: string]: string[];
}

// Auto-save configuration
export interface AutoSaveConfig {
  interval: number;
  enabled: boolean;
}

// Default form values
const defaultFormValues: Partial<OfferingFormData> = {
  businessType: '',
  productType: '',
  basicInfo: {
    name: '',
    description: '',
    location: '',
    category: '',
    duration: 60,
    difficultyLevel: 'easy',
    minAge: 0,
    maxGroupSize: 50,
    tags: []
  },
  productConfig: {},
  scheduling: {
    scheduleType: 'fixed',
    timezone: 'UTC',
    advanceBookingDays: 7,
    cutoffHours: 24,
    recurringPattern: {},
    blackoutDates: []
  },
  pricing: {
    basePricing: {
      adult: 0,
      child: 0,
      student: 0,
      senior: 0
    },
    currency: 'USD',
    groupDiscounts: [],
    seasonalPricing: [],
    cancellationPolicy: {
      freeCancellationHours: 24,
      refundPercentage: 100,
      processingFee: 0
    },
    depositRequired: false,
    depositAmount: 0,
    taxInclusive: false
  },
  media: {
    images: [],
    videos: [],
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      slug: ''
    },
    socialMedia: {
      shareTitle: '',
      shareDescription: '',
      shareImage: ''
    }
  },
  isDraft: true,
  lastModified: new Date()
};

// Custom hook for offering form management
export function useOfferingForm(autoSaveConfig: AutoSaveConfig = { interval: 30000, enabled: true }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSaveRef = useRef<NodeJS.Timeout>();
  
  // Form state
  const [formData, setFormData] = useState<Partial<OfferingFormData>>(defaultFormValues);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState<StepStatus>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Memoize auto-save config to prevent constant re-renders
  const stableAutoSaveConfig = useMemo(() => autoSaveConfig, [autoSaveConfig.interval, autoSaveConfig.enabled]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      console.log('Saving form data to localStorage:', formData);
      localStorage.setItem('offering-form-draft', JSON.stringify({
        ...formData,
        lastModified: new Date().toISOString()
      }));
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }, [formData]);

  // Initialize current step from URL
  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '1');
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  // Auto-save functionality
  useEffect(() => {
    if (stableAutoSaveConfig.enabled && isDirty && formData) {
      autoSaveRef.current = setTimeout(() => {
        saveToLocalStorage();
        setLastAutoSave(new Date());
        setIsDirty(false);
      }, stableAutoSaveConfig.interval);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [formData, isDirty, stableAutoSaveConfig, saveToLocalStorage]);

  // Load saved data from localStorage on mount, but only if no draft is being loaded
  useEffect(() => {
    console.log('DEBUG-INIT: Checking whether to load from localStorage');
    // First check if we have a draft parameter or sessionStorage data, or if draft is already loaded
    const hasDraftParam = searchParams.get('draft') !== null;
    const hasDraftData = sessionStorage.getItem('loadDraft') !== null;
    
    console.log('DEBUG-INIT: Draft param detected?', hasDraftParam);
    console.log('DEBUG-INIT: Draft data in sessionStorage?', hasDraftData);
    console.log('DEBUG-INIT: isDraftLoaded?', isDraftLoaded);
    console.log('DEBUG-INIT: Search params:', Object.fromEntries(searchParams.entries()));
    console.log('DEBUG-INIT: SessionStorage content:', sessionStorage.getItem('loadDraft'));
    
    // Skip localStorage loading if draft is being loaded OR already loaded successfully
    if ((isDraftLoaded || hasDraftParam || hasDraftData) && formData.lastModified) {
      console.log('DEBUG-INIT: Draft data detected or already loaded, skipping localStorage load');
      return;
    }
    
    // Only proceed with localStorage loading if we're not dealing with drafts or if formData is empty
    console.log('DEBUG-INIT: Loading from localStorage');
    const savedData = localStorage.getItem('offering-form-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('DEBUG-INIT: Setting formData from localStorage');
        // Only set form data from localStorage if it exists and has content
        if (parsed && Object.keys(parsed).length > 0) {
          setFormData(parsed);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [searchParams, isDraftLoaded, formData.lastModified]);


  // Function to load draft data - wrapped in useCallback to prevent infinite loops
  const loadDraftData = useCallback(() => {
    console.log('DEBUG-LOAD: loadDraftData called');
    
    // Skip if draft is already loaded
    if (isDraftLoaded) {
      console.log('DEBUG-LOAD: Draft already loaded, skipping');
      return;
    }
    
    try {
      // Check for draft data in sessionStorage (from draft manager)
      const draftData = sessionStorage.getItem('loadDraft');
      console.log('DEBUG-LOAD: Draft data in sessionStorage:', draftData ? 'present (truncated)' : 'null');
      
      if (draftData) {
        try {
          const parsedData = JSON.parse(draftData);
          console.log('DEBUG-LOAD: Successfully parsed draft data');
          
          const { draftId, formData: draftFormData } = parsedData;
          console.log('DEBUG-LOAD: Loading draft ID:', draftId);
          console.log('DEBUG-LOAD: Draft form data structure:', Object.keys(draftFormData));
          
          // Ensure the draft form data has the expected structure
          if (draftFormData && typeof draftFormData === 'object') {
            console.log('DEBUG-LOAD: Setting form data from draft');
            // Force replacement of the entire form data structure
            setFormData(draftFormData);
            console.log('DEBUG-LOAD: Setting current step to review');
            setCurrentStep(7); // Go to review step for drafts
            
            // Mark as loaded immediately to prevent any other data from overriding it
            setIsDraftLoaded(true);
            
            // Clear sessionStorage after loading
            console.log('DEBUG-LOAD: Clearing sessionStorage');
            sessionStorage.removeItem('loadDraft');
            
            // Also clear the URL parameter to prevent re-loading
            const url = new URL(window.location.href);
            url.searchParams.delete('draft');
            window.history.replaceState({}, '', url.toString());
            console.log('DEBUG-LOAD: URL updated, removed draft parameter');
            
            console.log('DEBUG-LOAD: Draft loaded successfully');
            return;
          } else {
            console.error('DEBUG-LOAD: Invalid draft form data structure:', draftFormData);
          }
        } catch (parseError) {
          console.error('DEBUG-LOAD: Error parsing draft data JSON:', parseError);
        }
      } else {
        console.log('DEBUG-LOAD: No draft data found in sessionStorage');
      }

      // Check URL params for draft parameter only if we haven't loaded from sessionStorage
      const draftParam = searchParams.get('draft');
      console.log('DEBUG-LOAD: Draft parameter in URL:', draftParam);
      
      if (draftParam) {
        console.log('DEBUG-LOAD: Draft parameter found but no sessionStorage data - cleaning up');
        // This indicates we likely already loaded the draft in a previous render
        // or the sessionStorage data was lost. Either way, clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete('draft');
        window.history.replaceState({}, '', url.toString());
        // Mark as loaded to prevent localStorage from being loaded
        setIsDraftLoaded(true);
      } else {
        console.log('DEBUG-LOAD: No draft parameter in URL');
      }
    } catch (error) {
      console.error('DEBUG-LOAD: Error in loadDraftData:', error);
      setIsDraftLoaded(true);
    }
  }, [searchParams, isDraftLoaded]);

  
  // Load draft data if available
  useEffect(() => {
    // Only try to load draft data once on initial mount
    if (!isDraftLoaded) {
      loadDraftData();
    }
  }, [isDraftLoaded, loadDraftData]);


  // Update form data
  const updateFormData = useCallback((section: keyof OfferingFormData, data: any) => {
    setFormData(prev => {
      const currentSection = prev[section];
      
      const updatedForm = {
        ...prev,
        [section]: typeof data === 'object' && data !== null && !Array.isArray(data) && currentSection && typeof currentSection === 'object'
          ? { ...currentSection, ...data }
          : data,
        lastModified: new Date()
      };
      
      // Save immediately to localStorage after every update
      setTimeout(() => {
        localStorage.setItem('offering-form-draft', JSON.stringify(updatedForm));
        console.log('Form data auto-saved after update');
      }, 0);
      
      return updatedForm;
    });
    setIsDirty(true);
  }, []);

  // Validate a specific step - FIXED: Remove stepStatus from dependencies to prevent circular dependency
  const validateStep = useCallback((stepId: number): boolean => {
    const stepErrors: string[] = [];
    let isValid = true;

    switch (stepId) {
      case 1: // Business Type
        if (!formData.businessType) {
          stepErrors.push('Business type is required');
          isValid = false;
        }
        if (!formData.productType) {
          stepErrors.push('Product type is required');
          isValid = false;
        }
        break;

      case 2: // Basic Info
        if (!formData.basicInfo?.name) {
          stepErrors.push('Offering name is required');
          isValid = false;
        }
        if (!formData.basicInfo?.description || formData.basicInfo.description.length < 10) {
          stepErrors.push('Description must be at least 10 characters');
          isValid = false;
        }
        if (!formData.basicInfo?.location) {
          stepErrors.push('Location is required');
          isValid = false;
        }
        if (!formData.basicInfo?.category) {
          stepErrors.push('Category is required');
          isValid = false;
        }
        break;

      case 3: // Product Config
        // Dynamic validation based on product type
        isValid = true; // Placeholder
        break;

      case 4: // Scheduling
        if (!formData.scheduling?.scheduleType) {
          stepErrors.push('Schedule type is required');
          isValid = false;
        }
        if (!formData.scheduling?.timezone) {
          stepErrors.push('Timezone is required');
          isValid = false;
        }
        break;

      case 5: // Pricing
        if (!formData.pricing?.basePricing?.adult || formData.pricing.basePricing.adult <= 0) {
          stepErrors.push('Adult price is required and must be greater than 0');
          isValid = false;
        }
        if (!formData.pricing?.currency) {
          stepErrors.push('Currency is required');
          isValid = false;
        }
        break;

      case 6: // Media
        if (!formData.media?.images || formData.media.images.length === 0) {
          stepErrors.push('At least one image is required');
          isValid = false;
        }
        // SEO fields are now optional - removed metaTitle and metaDescription requirements
        break;

      case 7: // Review
        // For review step, just check if we have basic required data
        isValid = !!(formData.businessType && formData.productType);
        if (!isValid) {
          stepErrors.push('Previous steps must be completed');
        }
        break;

      default:
        isValid = true;
    }

    // Update step status without causing re-renders
    setStepStatus(prev => ({
      ...prev,
      [stepId]: {
        isCompleted: isValid,
        isValid,
        errors: stepErrors,
        lastUpdated: new Date()
      }
    }));

    return isValid;
  }, [formData]); // Only depend on formData, not stepStatus

  // Auto-validate current step when form data changes (debounced)
  useEffect(() => {
    if (formData) {
      const timeoutId = setTimeout(() => {
        validateStep(currentStep);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [formData, currentStep, validateStep]);

  // Navigate to a specific step
  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= 7) {
      // Save current form data before navigating
      saveToLocalStorage();
      
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', stepId.toString());
      router.push(`/dashboard/offerings/create?${params.toString()}`);
      setCurrentStep(stepId);
    }
  }, [router, searchParams, saveToLocalStorage]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < 7) {
      // Always save progress when moving to next step
      saveToLocalStorage();
      goToStep(currentStep + 1);
    } else {
      // Show appropriate validation error message
      console.log('Validation failed for step', currentStep);
      // Force save anyway to prevent data loss
      saveToLocalStorage();
    }
  }, [currentStep, goToStep, validateStep, saveToLocalStorage]);

  // Go to previous step
  const prevStep = useCallback(() => {
    // Always save current step data before navigating back
    saveToLocalStorage();
    
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      router.push('/dashboard/offerings');
    }
  }, [currentStep, goToStep, router, saveToLocalStorage]);

  // Save progress (manual save)
  const saveProgress = useCallback(async () => {
    try {
      saveToLocalStorage();
      setLastAutoSave(new Date());
      setIsDirty(false);
      // TODO: Also save to database
      console.log('Progress saved');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [saveToLocalStorage]);

  // Submit form
  const submitForm = useCallback(async () => {
    console.log('DEBUG-SUBMIT: Starting submission process');
    setIsSubmitting(true);
    
    try {
      // Validate current step only to avoid recursive validation
      console.log('DEBUG-SUBMIT: Validating current step:', currentStep);
      const isValid = validateStep(currentStep);
      console.log('DEBUG-SUBMIT: Current step validation result:', isValid);
      
      if (!isValid) {
        console.log('DEBUG-SUBMIT: Validation failed, aborting submission');
        throw new Error('Current step validation failed');
      }

      // TODO: Implement actual API submission
      console.log('DEBUG-SUBMIT: Would submit form data to API here');
      
      // Simulate API call with a small delay to ensure state updates complete
      console.log('DEBUG-SUBMIT: Simulating API call with timeout');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear saved draft
      console.log('DEBUG-SUBMIT: Clearing localStorage');
      localStorage.removeItem('offering-form-draft');
      
      // Redirect to offerings list
      console.log('DEBUG-SUBMIT: Redirecting to offerings list');
      setTimeout(() => {
        setIsSubmitting(false); // Ensure this completes before navigation
        router.push('/dashboard/offerings');
      }, 100);
      
      return; // Exit early to prevent the finally block from running too soon
      
    } catch (error) {
      console.error('DEBUG-SUBMIT: Error during submission:', error);
      setErrors({ submit: [error instanceof Error ? error.message : 'Submission failed'] });
      setIsSubmitting(false);
    }
  }, [formData, validateStep, currentStep, router]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(defaultFormValues);
    setStepStatus({});
    setErrors({});
    setIsDirty(false);
    localStorage.removeItem('offering-form-draft');
    goToStep(1);
  }, [goToStep]);

  // Check if current step is valid - FIXED: Make this a computed value, not a function call
  const isCurrentStepValid = useMemo(() => {
    return stepStatus[currentStep]?.isValid || false;
  }, [stepStatus, currentStep]);

  // Check if step is completed - FIXED: Make this return a function, not call validateStep
  const isStepCompleted = useCallback((stepId: number) => {
    return stepStatus[stepId]?.isCompleted || false;
  }, [stepStatus]);

  // Get completed steps count
  const getCompletedStepsCount = useCallback(() => {
    return Object.values(stepStatus).filter(status => status.isCompleted).length;
  }, [stepStatus]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    return Math.round((getCompletedStepsCount() / 7) * 100);
  }, [getCompletedStepsCount]);

  return {
    // State
    formData,
    currentStep,
    stepStatus,
    errors,
    isSubmitting,
    isDirty,
    lastAutoSave,

    // Actions
    updateFormData,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    saveProgress,
    submitForm,
    resetForm,

    // Helpers - FIXED: Return computed values, not function calls
    isCurrentStepValid, // Now a boolean value, not a function
    isStepCompleted,
    getCompletedStepsCount,
    getProgressPercentage
  };
}

export { defaultFormValues }; 