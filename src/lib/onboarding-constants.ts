import {
  Building2,
  User,
  MapPin,
  Palette,
  CreditCard,
  Rocket
} from 'lucide-react';
import { OnboardingStep, SubscriptionPlan, FormData } from '@/types/onboarding';

export const businessTypes = [
  'Tour Operator',
  'Bus Company', 
  'Adventure Tours',
  'City Tours',
  'Wine Tours',
  'Food Tours',
  'Boat Tours',
  'Walking Tours',
  'Equipment Rental',
  'Activity Provider',
  'Other'
];

export const steps: OnboardingStep[] = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Account Setup', icon: User },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Branding', icon: Palette },
  { id: 5, title: 'Plan Selection', icon: CreditCard },
  { id: 6, title: 'Launch', icon: Rocket }
];

export const plans: SubscriptionPlan[] = [
  {
    name: 'starter',
    displayName: 'Starter',
    price: 99,
    description: 'Perfect for small tour operators',
    features: ['Up to 100 bookings/month', 'Basic branding', 'Email support', 'Platform subdomain only', '5% transaction fee'],
    recommended: false
  },
  {
    name: 'professional',
    displayName: 'Professional',
    price: 299,
    description: 'Most popular for growing businesses',
    features: ['Up to 1,000 bookings/month', 'Full branding', 'Priority support', 'Custom domain (booking.yourdomain.com)', '3% transaction fee'],
    recommended: true
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 999,
    description: 'For established tour operators',
    features: ['Unlimited bookings', 'Dedicated database', 'API access', 'Dedicated support', '2% transaction fee'],
    recommended: false
  }
];

export const defaultFormData: FormData = {
  // Step 1: Business Information
  businessName: '',
  businessType: '',
  website: '',
  description: '',
  
  // Step 2: Account Setup
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  
  // Step 3: Business Details
  address: '',
  city: '',
  state: '',
  country: 'Canada',
  zipCode: '',
  
  // Step 4: Branding & Domain
  primaryColor: '#10B981',
  secondaryColor: '#374151',
  logo: '',
  subdomain: '',
  useCustomDomain: false,
  customDomain: '',
  domainVerified: false,
  // New domain verification fields for CNAME-based system
  domainVerificationStatus: null,
  verificationTarget: '',
  cnameSource: '',
  cnameTarget: '',
  verificationInstructions: '',
  sslStatus: null,
  dnsPropagation: null,
  
  // Step 5: Plan Selection
  selectedPlan: 'professional',
  
  // Step 6: Payment
  paymentMethod: 'stripe'
};

export const countries = [
  'Canada',
  'United States',
  'United Kingdom',
  'Australia',
  'Other'
]; 