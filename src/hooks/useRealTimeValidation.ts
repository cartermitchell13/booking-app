import { useState, useEffect, useMemo } from 'react';
import { 
  validateOfferingForm, 
  getValidationErrorsForSection,
  getSectionCompletionStatus,
  getFormCompletionPercentage,
  ValidationError,
  ValidationResult
} from '@/lib/validation-utils';

interface UseRealTimeValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

interface UseRealTimeValidationReturn {
  validation: ValidationResult;
  sectionStatus: Record<string, {
    completed: number;
    total: number;
    hasErrors: boolean;
    hasWarnings: boolean;
  }>;
  completionPercentage: number;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  getFieldErrors: (fieldPath: string) => ValidationError[];
  getSectionErrors: (section: string) => ValidationError[];
  validateField: (fieldPath: string) => ValidationError[];
  revalidate: () => void;
}

export function useRealTimeValidation(
  formData: any,
  options: UseRealTimeValidationOptions = {}
): UseRealTimeValidationReturn {
  const { debounceMs = 300, validateOnMount = true } = options;
  
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  // Debounced validation effect
  useEffect(() => {
    if (!validateOnMount && !formData) return;

    const timeoutId = setTimeout(() => {
      const result = validateOfferingForm(formData || {});
      setValidation(result);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formData, debounceMs, validateOnMount]);

  // Memoized computed values
  const sectionStatus = useMemo(() => {
    return getSectionCompletionStatus(formData || {});
  }, [formData]);

  const completionPercentage = useMemo(() => {
    return getFormCompletionPercentage(formData || {});
  }, [formData]);

  const isValid = validation.isValid;
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  // Helper functions
  const getFieldErrors = (fieldPath: string): ValidationError[] => {
    return [...validation.errors, ...validation.warnings].filter(
      error => error.field === fieldPath
    );
  };

  const getSectionErrors = (section: string): ValidationError[] => {
    return getValidationErrorsForSection(formData || {}, section);
  };

  const validateField = (fieldPath: string): ValidationError[] => {
    return getFieldErrors(fieldPath);
  };

  const revalidate = () => {
    const result = validateOfferingForm(formData || {});
    setValidation(result);
  };

  return {
    validation,
    sectionStatus,
    completionPercentage,
    isValid,
    hasErrors,
    hasWarnings,
    getFieldErrors,
    getSectionErrors,
    validateField,
    revalidate
  };
}

/**
 * Hook for validating a specific section
 */
export function useSectionValidation(
  formData: any,
  sectionName: string,
  options: UseRealTimeValidationOptions = {}
) {
  const { debounceMs = 300 } = options;
  const [sectionErrors, setSectionErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const errors = getValidationErrorsForSection(formData || {}, sectionName);
      setSectionErrors(errors);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formData, sectionName, debounceMs]);

  const hasErrors = sectionErrors.some(e => e.severity === 'error');
  const hasWarnings = sectionErrors.some(e => e.severity === 'warning');
  const isValid = !hasErrors;

  return {
    errors: sectionErrors,
    hasErrors,
    hasWarnings,
    isValid
  };
}

/**
 * Hook for validating a specific field
 */
export function useFieldValidation(
  formData: any,
  fieldPath: string,
  options: UseRealTimeValidationOptions = {}
) {
  const { debounceMs = 300 } = options;
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const allValidation = validateOfferingForm(formData || {});
      const errors = [...allValidation.errors, ...allValidation.warnings].filter(
        error => error.field === fieldPath
      );
      setFieldErrors(errors);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formData, fieldPath, debounceMs]);

  const hasError = fieldErrors.some(e => e.severity === 'error');
  const hasWarning = fieldErrors.some(e => e.severity === 'warning');
  const isValid = !hasError;

  return {
    errors: fieldErrors,
    hasError,
    hasWarning,
    isValid
  };
}