export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  isRequired: boolean;
}

export interface ProductType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ProductCategory {
  category: string;
  types: ProductType[];
}

export interface PublishingOptions {
  option: 'draft' | 'immediate' | 'scheduled';
  scheduledDate?: string;
  publishedAt?: string;
}

export interface ValidationChecklist {
  reviewedInfo: boolean;
  understoodPolicies: boolean;
  agreedToTerms: boolean;
}

export interface PricingCalculatorData {
  adults: number;
  children: number;
  date: string;
  addOns: string[];
}

// Match the existing hook's interface structure
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
      // Enhanced image properties for original implementation
      id?: number;
      file?: File;
      filename?: string;
      altText?: string;
      size?: number;
      type?: string;
    }>;
    videos?: Array<{
      url: string;
      title: string;
      type: string;
      order: number;
      // Enhanced video properties for original implementation
      id?: number;
      platform?: string;
      description?: string;
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
      shareImage: string;
    };
    // New marketing and social media fields from original implementation
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    suggestedHashtags?: string[];
    socialMediaTemplate?: string;
    emailTemplate?: string;
  };
  publishingOptions?: PublishingOptions;
  validationChecklist?: ValidationChecklist;
  isDraft: boolean;
  lastModified: Date;
}

// Legacy interfaces for backward compatibility
export interface BasicInfo {
  name?: string;
  location?: string;
  duration?: number;
  category?: string;
  description?: string;
  difficultyLevel?: string;
  minAge?: number;
  maxGroupSize?: number;
  tags?: string[];
}

export interface ProductConfig {
  // Seat-based (Bus Tours)
  vehicleType?: string;
  totalSeats?: number;
  accessibleSeats?: number;
  amenities?: string[];
  highlights?: string[];
  pickupLocations?: PickupLocation[];
  routeDescription?: string;
  estimatedTravelTime?: number;
  numberOfStops?: number;

  // Capacity-based (Boat Cruises)
  maxCapacity?: number;
  minGroupSize?: number;
  vesselType?: string;
  deckLevels?: number;
  pricingType?: string;
  baseGroupRate?: number;

  // Open (Walking Tours)
  mainMeetingPoint?: string;
  meetingPointDescription?: string;
  guideType?: string;
  maxGroupSize?: number;
  equipmentProvided?: string[];
  accessibilityFeatures?: string[];

  // Equipment Rental
  equipmentCategory?: string;
  totalInventory?: number;
  rentalPeriods?: string[];
  minimumRentalPeriod?: string;
  maximumRentalPeriod?: string;
  securityDeposit?: number;
  insuranceRequired?: string;

  // Package
  packageType?: string;
  packageDuration?: string;
  bundleDiscountPercentage?: number;
  customizationOptions?: string[];
  validityPeriod?: string;
  minimumParticipants?: number;

  // Timeslot (Classes)
  classType?: string;
  maxClassSize?: number;
  skillLevel?: string;
  sessionDuration?: number;
  instructorRequirements?: string[];
  venueType?: string;
  equipmentNeeded?: string[];
  prerequisites?: string;
  materialsProvided?: string;
  whatToBring?: string;
}

export interface PickupLocation {
  id: number;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  pickupTime: string;
  isMainLocation: boolean;
}

export interface Scheduling {
  scheduleType?: string;
  timezone?: string;
  advanceBookingDays?: number;
  cutoffHours?: number;
  recurringPattern?: Record<string, any>;
  blackoutDates?: Date[];
}

export interface BasePricing {
  adult?: number;
  child?: number;
  student?: number;
  senior?: number;
}

export interface GroupTier {
  id: number;
  minSize: number;
  maxSize: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface SeasonalRate {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  isActive: boolean;
}

export interface Pricing {
  basePricing?: BasePricing;
  currency?: string;
  groupDiscounts?: any[];
  seasonalPricing?: any[];
  cancellationPolicy?: {
    freeCancellationHours: number;
    refundPercentage: number;
    processingFee?: number;
  };
  depositRequired?: boolean;
  depositAmount?: number;
  taxInclusive?: boolean;
  // Legacy fields for backward compatibility
  childAgeMin?: number;
  childAgeMax?: number;
  seniorAgeMin?: number;
  taxRate?: number;
  taxDisplay?: 'exclusive' | 'inclusive';
  enableMultiCurrency?: boolean;
  groupTiers?: GroupTier[];
  seasonalRates?: SeasonalRate[];
  freeCancellationHours?: number;
  cancellationFeeType?: 'percentage' | 'fixed';
  cancellationFeeValue?: number;
  refundPolicy?: string;
  requireDeposit?: boolean;
  depositType?: 'percentage' | 'fixed';
  depositValue?: number;
  paymentDueDays?: number;
  paymentMethods?: string[];
  chargeProcessingFees?: boolean;
  creditCardFee?: number;
  administrativeFee?: number;
}

export interface MediaImage {
  id: number;
  url: string;
  file?: File;
  filename: string;
  altText: string;
  isPrimary: boolean;
  size: number;
  type: string;
}

export interface MediaVideo {
  id: number;
  url: string;
  platform: 'youtube' | 'vimeo';
  title: string;
  description: string;
}

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug?: string;
}

export interface Media {
  images?: MediaImage[];
  videos?: MediaVideo[];
  seoData?: SeoData;
  socialMedia?: {
    shareTitle?: string;
    shareDescription?: string;
    shareImage?: string;
  };
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  suggestedHashtags?: string[];
  socialMediaTemplate?: string;
  emailTemplate?: string;
}

export interface StepComponentProps {
  formData: Partial<OfferingFormData>;
  updateFormData: (section: keyof OfferingFormData, data: any) => void;
  errors?: Record<string, string>;
  isLoading?: boolean;
}

export interface ConfigComponentProps {
  config: ProductConfig;
  updateConfig: (field: string, value: any) => void;
} 