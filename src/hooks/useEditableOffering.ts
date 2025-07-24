'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OfferingFormData } from '@/components/offerings/create/types/createOfferingTypes';

interface EditableOfferingState {
  formData: Partial<OfferingFormData>;
  isDirty: boolean;
  lastSaved: Date | null;
  isAutoSaving: boolean;
  validationErrors: ValidationError[];
  activeSection: string | null;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  section: string;
}

interface UseEditableOfferingOptions {
  initialData?: Partial<OfferingFormData>;
  autoSaveDelay?: number;
  onSave?: (data: Partial<OfferingFormData>) => Promise<void>;
  onError?: (error: Error) => void;
}

interface UseEditableOfferingReturn {
  // State
  formData: Partial<OfferingFormData>;
  isDirty: boolean;
  lastSaved: Date | null;
  isAutoSaving: boolean;
  validationErrors: ValidationError[];
  activeSection: string | null;
  
  // Actions
  updateFormData: (section: keyof OfferingFormData, data: any) => void;
  updateField: (path: string, value: any) => void;
  setActiveSection: (section: string | null) => void;
  save: () => Promise<void>;
  reset: () => void;
  
  // Validation
  validate: () => ValidationError[];
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
}

export const useEditableOffering = ({
  initialData = {},
  autoSaveDelay = 2000,
  onSave,
  onError
}: UseEditableOfferingOptions = {}): UseEditableOfferingReturn => {
  const [state, setState] = useState<EditableOfferingState>({
    formData: initialData,
    isDirty: false,
    lastSaved: null,
    isAutoSaving: false,
    validationErrors: [],
    activeSection: null
  });

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update form data
  const updateFormData = useCallback((section: keyof OfferingFormData, data: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [section]: data
      },
      isDirty: true
    }));
  }, []);

  // Update individual field using dot notation path
  const updateField = useCallback((path: string, value: any) => {
    setState(prev => {
      const newFormData = { ...prev.formData };
      const pathParts = path.split('.');
      let current: any = newFormData;
      
      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the final value
      current[pathParts[pathParts.length - 1]] = value;
      
      return {
        ...prev,
        formData: newFormData,
        isDirty: true
      };
    });
  }, []);

  // Set active section for editing
  const setActiveSection = useCallback((section: string | null) => {
    setState(prev => ({
      ...prev,
      activeSection: section
    }));
  }, []);

  // Validation function
  const validate = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const { formData } = state;

    // Basic Info validation
    if (!formData.basicInfo?.name) {
      errors.push({
        field: 'basicInfo.name',
        message: 'Offering name is required',
        severity: 'error',
        section: 'Basic Info'
      });
    }

    if (!formData.basicInfo?.description || formData.basicInfo.description.length < 10) {
      errors.push({
        field: 'basicInfo.description',
        message: 'Description must be at least 10 characters',
        severity: 'error',
        section: 'Basic Info'
      });
    }

    if (!formData.basicInfo?.location) {
      errors.push({
        field: 'basicInfo.location',
        message: 'Location is required',
        severity: 'error',
        section: 'Basic Info'
      });
    }

    if (!formData.basicInfo?.duration || formData.basicInfo.duration <= 0) {
      errors.push({
        field: 'basicInfo.duration',
        message: 'Duration must be greater than 0',
        severity: 'error',
        section: 'Basic Info'
      });
    }

    // Pricing validation
    if (!formData.pricing?.basePricing?.adult || formData.pricing.basePricing.adult <= 0) {
      errors.push({
        field: 'pricing.basePricing.adult',
        message: 'Adult price is required and must be greater than 0',
        severity: 'error',
        section: 'Pricing'
      });
    }

    if (!formData.pricing?.currency) {
      errors.push({
        field: 'pricing.currency',
        message: 'Currency is required',
        severity: 'error',
        section: 'Pricing'
      });
    }

    // Media validation
    if (!formData.media?.images || formData.media.images.length === 0) {
      errors.push({
        field: 'media.images',
        message: 'At least one image is required',
        severity: 'error',
        section: 'Media'
      });
    }

    // SEO validation (warnings)
    if (!formData.media?.seoData?.metaTitle) {
      errors.push({
        field: 'media.seoData.metaTitle',
        message: 'Meta title recommended for better SEO',
        severity: 'warning',
        section: 'SEO'
      });
    }

    if (!formData.media?.seoData?.metaDescription) {
      errors.push({
        field: 'media.seoData.metaDescription',
        message: 'Meta description recommended for better SEO',
        severity: 'warning',
        section: 'SEO'
      });
    }

    return errors;
  }, [state]);

  // Save function
  const save = useCallback(async () => {
    if (!onSave) return;

    setState(prev => ({ ...prev, isAutoSaving: true }));

    try {
      await onSave(state.formData);
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
        isAutoSaving: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isAutoSaving: false }));
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [state.formData, onSave, onError]);

  // Reset function
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialData,
      isDirty: false,
      validationErrors: [],
      activeSection: null
    }));
  }, [initialData]);

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty && onSave) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        save().catch(console.error);
      }, autoSaveDelay);

      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [state.isDirty, state.formData, autoSaveDelay, save, autoSaveTimeout, onSave]);

  // Validation effect
  useEffect(() => {
    const errors = validate();
    setState(prev => ({
      ...prev,
      validationErrors: errors
    }));
  }, [state.formData, validate]);

  // Computed values
  const isValid = state.validationErrors.filter(e => e.severity === 'error').length === 0;
  const hasErrors = state.validationErrors.some(e => e.severity === 'error');
  const hasWarnings = state.validationErrors.some(e => e.severity === 'warning');

  return {
    // State
    formData: state.formData,
    isDirty: state.isDirty,
    lastSaved: state.lastSaved,
    isAutoSaving: state.isAutoSaving,
    validationErrors: state.validationErrors,
    activeSection: state.activeSection,
    
    // Actions
    updateFormData,
    updateField,
    setActiveSection,
    save,
    reset,
    
    // Validation
    validate,
    isValid,
    hasErrors,
    hasWarnings
  };
};