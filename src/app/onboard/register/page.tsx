'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Building2,
  User,
  Globe,
  Palette,
  CreditCard,
  Rocket,
  Upload,
  Eye,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Phone,
  Mail,
  Lock,
  Shield,
  Zap,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface FormData {
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
  phone: string;
  
  // Step 3: Business Details
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Step 4: Branding
  primaryColor: string;
  secondaryColor: string;
  logo: File | null;
  subdomain: string;
  
  // Step 5: Plan Selection
  selectedPlan: string;
  
  // Step 6: Payment (placeholder)
  paymentMethod: string;
}

const businessTypes = [
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

const steps = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Account Setup', icon: User },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Branding', icon: Palette },
  { id: 5, title: 'Plan Selection', icon: CreditCard },
  { id: 6, title: 'Launch', icon: Rocket }
];

const plans = [
  {
    name: 'starter',
    displayName: 'Starter',
    price: 99,
    description: 'Perfect for small tour operators',
    features: ['Up to 100 bookings/month', 'Basic branding', 'Email support', '5% transaction fee'],
    recommended: false
  },
  {
    name: 'professional',
    displayName: 'Professional',
    price: 299,
    description: 'Most popular for growing businesses',
    features: ['Up to 1,000 bookings/month', 'Full branding', 'Priority support', 'Custom domain', '3% transaction fee'],
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

export default function OnboardingRegister() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Create Your Tour Booking Platform
          </h1>
          <p className="text-gray-600">
            This will be a comprehensive multi-step registration wizard.
          </p>
        </Card>
      </div>
    </div>
  );
} 