import { z } from 'zod';

// Product types enum
export type ProductType = 'seat' | 'capacity' | 'open' | 'equipment' | 'package' | 'timeslot';

// Step completion status
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

// Form validation schemas
export const BusinessTypeSchema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  productType: z.enum(['seat', 'capacity', 'open', 'equipment', 'package', 'timeslot'], {
    message: 'Please select a product type'
  })
});

export const BasicInfoSchema = z.object({
  name: z.string().min(1, 'Offering name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(10080, 'Duration cannot exceed 7 days'),
  difficultyLevel: z.enum(['easy', 'moderate', 'challenging', 'expert'], {
    message: 'Please select a difficulty level'
  }),
  minAge: z.number().min(0, 'Minimum age cannot be negative').max(100, 'Minimum age cannot exceed 100'),
  maxGroupSize: z.number().min(1, 'Maximum group size must be at least 1').max(1000, 'Maximum group size cannot exceed 1000').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional()
});

export const SchedulingSchema = z.object({
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
  blackoutDates: z.array(z.date()).optional(),
  seasonalAvailability: z.object({
    startMonth: z.number().min(1).max(12).optional(),
    endMonth: z.number().min(1).max(12).optional()
  }).optional()
});

export const PricingSchema = z.object({
  basePricing: z.object({
    adult: z.number().min(0, 'Adult price cannot be negative'),
    child: z.number().min(0, 'Child price cannot be negative').optional(),
    student: z.number().min(0, 'Student price cannot be negative').optional(),
    senior: z.number().min(0, 'Senior price cannot be negative').optional()
  }),
  currency: z.string().min(1, 'Currency is required'),
  groupDiscounts: z.array(z.object({
    minSize: z.number().min(2, 'Minimum group size must be at least 2'),
    discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
    type: z.enum(['percentage', 'fixed'])
  })).optional(),
  seasonalPricing: z.array(z.object({
    name: z.string().min(1, 'Season name is required'),
    startDate: z.date(),
    endDate: z.date(),
    multiplier: z.number().min(0.1, 'Multiplier must be at least 0.1').max(10, 'Multiplier cannot exceed 10')
  })).optional(),
  cancellationPolicy: z.object({
    freeCancellationHours: z.number().min(0, 'Free cancellation hours cannot be negative').max(8760, 'Free cancellation cannot exceed 1 year'),
    refundPercentage: z.number().min(0, 'Refund percentage cannot be negative').max(100, 'Refund percentage cannot exceed 100%'),
    processingFee: z.number().min(0, 'Processing fee cannot be negative').optional()
  }),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().min(0, 'Deposit amount cannot be negative').optional(),
  taxInclusive: z.boolean().default(false)
});

export const MediaSchema = z.object({
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().min(1, 'Alt text is required'),
    isPrimary: z.boolean().default(false),
    order: z.number().min(0)
  })).min(1, 'At least one image is required').max(20, 'Maximum 20 images allowed'),
  videos: z.array(z.object({
    url: z.string().url('Invalid video URL'),
    title: z.string().min(1, 'Video title is required'),
    type: z.enum(['youtube', 'vimeo', 'direct']),
    order: z.number().min(0)
  })).max(5, 'Maximum 5 videos allowed').optional(),
  seoData: z.object({
    metaTitle: z.string().min(1, 'Meta title is required').max(60, 'Meta title must be less than 60 characters'),
    metaDescription: z.string().min(1, 'Meta description is required').max(160, 'Meta description must be less than 160 characters'),
    keywords: z.array(z.string()).max(10, 'Maximum 10 keywords allowed').optional(),
    slug: z.string().min(1, 'URL slug is required').max(50, 'URL slug must be less than 50 characters')
  }),
  socialMedia: z.object({
    shareTitle: z.string().min(1, 'Share title is required').max(80, 'Share title must be less than 80 characters'),
    shareDescription: z.string().min(1, 'Share description is required').max(200, 'Share description must be less than 200 characters'),
    shareImage: z.string().url('Invalid share image URL').optional()
  }).optional()
});

// Complete form schema
export const OfferingFormSchema = z.object({
  businessType: BusinessTypeSchema,
  basicInfo: BasicInfoSchema,
  productConfig: z.record(z.any()).optional(), // Dynamic based on product type
  scheduling: SchedulingSchema,
  pricing: PricingSchema,
  media: MediaSchema,
  isDraft: z.boolean().optional(),
  lastModified: z.date().optional()
});

// Form data types
export type BusinessTypeFormData = z.infer<typeof BusinessTypeSchema>;
export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;
export type SchedulingFormData = z.infer<typeof SchedulingSchema>;
export type PricingFormData = z.infer<typeof PricingSchema>;
export type MediaFormData = z.infer<typeof MediaSchema>;
export type OfferingFormData = z.infer<typeof OfferingFormSchema>;

// Step configuration
export interface WizardStep {
  id: number;
  title: string;
  description: string;
  schema: z.ZodSchema<any>;
  component: React.ComponentType<any>;
  isRequired: boolean;
  dependsOn?: number[];
}

// Step completion tracking
export interface StepCompletion {
  [stepId: number]: {
    status: StepStatus;
    errors: string[];
    lastUpdated: Date;
    data?: any;
  };
}

// Draft management
export interface DraftData {
  id: string;
  name: string;
  formData: Partial<OfferingFormData>;
  currentStep: number;
  completedSteps: number[];
  lastSaved: Date;
  isAutoSaved: boolean;
}

// Form context
export interface OfferingFormContext {
  formData: Partial<OfferingFormData>;
  currentStep: number;
  stepCompletion: StepCompletion;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  
  // Actions
  updateFormData: (step: string, data: any) => void;
  validateStep: (stepId: number) => Promise<boolean>;
  goToStep: (stepId: number) => void;
  saveProgress: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

// Validation errors
export interface ValidationError {
  field: string;
  message: string;
  step: number;
}

// Form submission result
export interface FormSubmissionResult {
  success: boolean;
  productId?: string;
  errors?: ValidationError[];
  message?: string;
}

// Auto-save configuration
export interface AutoSaveConfig {
  interval: number; // milliseconds
  enabled: boolean;
  onSave?: (data: Partial<OfferingFormData>) => Promise<void>;
  onError?: (error: Error) => void;
}

// Default form values
export const defaultFormValues: Partial<OfferingFormData> = {
  businessType: {
    businessType: '',
    productType: 'seat' as ProductType
  },
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
    blackoutDates: [],
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: []
    }
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