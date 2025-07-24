/**
 * Validation utilities for real-time form validation
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  section: string;
}

export interface FieldValidationRule {
  field: string;
  section: string;
  required?: boolean;
  validator?: (value: any, formData?: any) => string | null;
  warning?: (value: any, formData?: any) => string | null;
}

/**
 * Validation rules for offering form fields
 */
export const OFFERING_VALIDATION_RULES: FieldValidationRule[] = [
  // Business Type
  {
    field: 'businessType',
    section: 'Business Type',
    required: true,
    validator: (value) => !value ? 'Business type is required' : null
  },
  {
    field: 'productType',
    section: 'Business Type',
    required: true,
    validator: (value) => !value ? 'Product type is required' : null
  },

  // Basic Info
  {
    field: 'basicInfo.name',
    section: 'Basic Info',
    required: true,
    validator: (value) => {
      if (!value || value.trim().length === 0) return 'Offering name is required';
      if (value.length > 100) return 'Name must be less than 100 characters';
      return null;
    }
  },
  {
    field: 'basicInfo.description',
    section: 'Basic Info',
    required: true,
    validator: (value) => {
      if (!value || value.trim().length === 0) return 'Description is required';
      if (value.length < 10) return 'Description must be at least 10 characters';
      if (value.length > 2000) return 'Description must be less than 2000 characters';
      return null;
    },
    warning: (value) => {
      if (value && value.length < 50) return 'Consider adding more detail to your description';
      return null;
    }
  },
  {
    field: 'basicInfo.location',
    section: 'Basic Info',
    required: true,
    validator: (value) => !value || value.trim().length === 0 ? 'Location is required' : null
  },
  {
    field: 'basicInfo.duration',
    section: 'Basic Info',
    required: true,
    validator: (value) => {
      if (!value || value <= 0) return 'Duration must be greater than 0';
      if (value > 10080) return 'Duration cannot exceed 7 days (10,080 minutes)';
      return null;
    }
  },

  // Scheduling
  {
    field: 'scheduling.scheduleType',
    section: 'Scheduling',
    required: true,
    validator: (value) => !value ? 'Schedule type is required' : null
  },
  {
    field: 'scheduling.timezone',
    section: 'Scheduling',
    required: true,
    validator: (value) => !value ? 'Timezone is required' : null
  },

  // Pricing
  {
    field: 'pricing.basePricing.adult',
    section: 'Pricing',
    required: true,
    validator: (value) => {
      if (!value || value <= 0) return 'Adult pricing is required and must be greater than 0';
      return null;
    }
  },
  {
    field: 'pricing.currency',
    section: 'Pricing',
    required: true,
    validator: (value) => !value ? 'Currency is required' : null
  },

  // Media
  {
    field: 'media.images',
    section: 'Media',
    required: true,
    validator: (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return 'At least one image is required';
      }
      return null;
    },
    warning: (value) => {
      if (value && Array.isArray(value) && value.length < 3) {
        return 'Consider adding more images to showcase your offering';
      }
      return null;
    }
  },
  {
    field: 'media.seoData.metaTitle',
    section: 'SEO',
    required: true,
    validator: (value) => {
      if (!value || value.trim().length === 0) return 'Meta title is required';
      if (value.length > 60) return 'Meta title should be less than 60 characters';
      return null;
    }
  },
  {
    field: 'media.seoData.metaDescription',
    section: 'SEO',
    required: true,
    validator: (value) => {
      if (!value || value.trim().length === 0) return 'Meta description is required';
      if (value.length > 160) return 'Meta description should be less than 160 characters';
      return null;
    }
  }
];

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Validate a single field
 */
export function validateField(
  rule: FieldValidationRule,
  formData: any
): ValidationError[] {
  const errors: ValidationError[] = [];
  const value = getNestedValue(formData, rule.field);

  // Check required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    errors.push({
      field: rule.field,
      message: `${rule.section} is required`,
      severity: 'error',
      section: rule.section
    });
    return errors; // Don't run other validations if required check fails
  }

  // Run custom validator
  if (rule.validator && value !== undefined && value !== null) {
    const errorMessage = rule.validator(value, formData);
    if (errorMessage) {
      errors.push({
        field: rule.field,
        message: errorMessage,
        severity: 'error',
        section: rule.section
      });
    }
  }

  // Run warning validator
  if (rule.warning && value !== undefined && value !== null) {
    const warningMessage = rule.warning(value, formData);
    if (warningMessage) {
      errors.push({
        field: rule.field,
        message: warningMessage,
        severity: 'warning',
        section: rule.section
      });
    }
  }

  return errors;
}

/**
 * Validate entire form data
 */
export function validateOfferingForm(formData: any): ValidationResult {
  const allErrors: ValidationError[] = [];

  for (const rule of OFFERING_VALIDATION_RULES) {
    const fieldErrors = validateField(rule, formData);
    allErrors.push(...fieldErrors);
  }

  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get validation errors for a specific section
 */
export function getValidationErrorsForSection(
  formData: any,
  section: string
): ValidationError[] {
  const sectionRules = OFFERING_VALIDATION_RULES.filter(rule => rule.section === section);
  const errors: ValidationError[] = [];

  for (const rule of sectionRules) {
    const fieldErrors = validateField(rule, formData);
    errors.push(...fieldErrors);
  }

  return errors;
}

/**
 * Check if a specific field has validation errors
 */
export function hasFieldError(formData: any, fieldPath: string): boolean {
  const rule = OFFERING_VALIDATION_RULES.find(r => r.field === fieldPath);
  if (!rule) return false;

  const errors = validateField(rule, formData);
  return errors.some(e => e.severity === 'error');
}

/**
 * Get completion percentage for the form
 */
export function getFormCompletionPercentage(formData: any): number {
  const requiredRules = OFFERING_VALIDATION_RULES.filter(rule => rule.required);
  const completedFields = requiredRules.filter(rule => {
    const value = getNestedValue(formData, rule.field);
    return value !== undefined && value !== null && 
           (typeof value !== 'string' || value.trim().length > 0) &&
           (!Array.isArray(value) || value.length > 0);
  });

  return Math.round((completedFields.length / requiredRules.length) * 100);
}

/**
 * Get sections with their completion status
 */
export function getSectionCompletionStatus(formData: any): Record<string, {
  completed: number;
  total: number;
  hasErrors: boolean;
  hasWarnings: boolean;
}> {
  const sections: Record<string, any> = {};

  for (const rule of OFFERING_VALIDATION_RULES) {
    if (!sections[rule.section]) {
      sections[rule.section] = {
        completed: 0,
        total: 0,
        hasErrors: false,
        hasWarnings: false
      };
    }

    if (rule.required) {
      sections[rule.section].total++;
      
      const value = getNestedValue(formData, rule.field);
      const isCompleted = value !== undefined && value !== null && 
                         (typeof value !== 'string' || value.trim().length > 0) &&
                         (!Array.isArray(value) || value.length > 0);
      
      if (isCompleted) {
        sections[rule.section].completed++;
      }
    }

    // Check for errors and warnings
    const fieldErrors = validateField(rule, formData);
    if (fieldErrors.some(e => e.severity === 'error')) {
      sections[rule.section].hasErrors = true;
    }
    if (fieldErrors.some(e => e.severity === 'warning')) {
      sections[rule.section].hasWarnings = true;
    }
  }

  return sections;
}