export interface FormData {
  // Step 1: Business Information
  businessName: string;
  businessType: string;
  website: string;
  description: string;
  
  // Step 2: Account Setup
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Step 3: Business Details
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Step 4: Branding & Domain
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  subdomain: string;
  useCustomDomain: boolean;
  customDomain: string;
  domainVerified: boolean;
  // New domain verification fields for CNAME-based system
  domainVerificationStatus: 'pending' | 'verified' | 'failed' | 'expired' | null;
  verificationTarget: string;
  cnameSource: string;
  cnameTarget: string;
  verificationInstructions: string;
  sslStatus: 'pending' | 'provisioned' | 'active' | 'failed' | null;
  dnsPropagation: {
    cloudflare: 'resolved' | 'pending' | 'failed';
    google: 'resolved' | 'pending' | 'failed';
  } | null;
  
  // Step 5: Plan Selection
  selectedPlan: string;
  
  // Step 6: Payment (placeholder)
  paymentMethod: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  icon: any; // LucideIcon type
}

export interface SubscriptionPlan {
  name: string;
  displayName: string;
  price: number;
  description: string;
  features: string[];
  recommended: boolean;
}

export interface StepComponentProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean | object | null) => void;
  error?: string | null;
}

export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
  helperText?: string;
} 