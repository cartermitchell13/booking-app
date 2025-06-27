'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Check,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  confirmPassword: string;
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
  logo: string;
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
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
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
    
    // Step 4: Branding
    primaryColor: '#10B981',
    secondaryColor: '#374151',
    logo: '',
    subdomain: '',
    
    // Step 5: Plan Selection
    selectedPlan: 'professional',
    
    // Step 6: Payment
    paymentMethod: 'stripe'
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim() || !formData.businessType || !formData.description.trim()) {
          setError('Please fill in all required business information fields.');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
          setError('Please fill in all required account fields.');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        break;
      case 3:
        if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
          setError('Please fill in all required location fields.');
          return false;
        }
        break;
      case 4:
        if (!formData.subdomain.trim()) {
          setError('Please choose a subdomain for your booking platform.');
          return false;
        }
        // Basic subdomain validation
        if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
          setError('Subdomain can only contain lowercase letters, numbers, and hyphens.');
          return false;
        }
        break;
      case 5:
        if (!formData.selectedPlan) {
          setError('Please select a subscription plan.');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setError('Service not configured. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      // Create tenant record first
      const tenantData = {
        name: formData.businessName,
        slug: formData.subdomain.toLowerCase(),
        domain: null, // Will be set later if custom domain is added
        branding: {
          logo_url: formData.logo || null,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          font_family: 'Inter'
        },
        settings: {
          business_type: formData.businessType,
          description: formData.description,
          website: formData.website || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: formData.zipCode,
          phone: formData.phone || null
        },
        subscription_plan: formData.selectedPlan,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            tenant_id: tenant.id
          }
        }
      });

      if (authError) throw authError;

      // Create user record in users table
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            tenant_id: tenant.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            role: 'tenant_admin',
            email_verified: false
          });

        if (userError) {
          console.error('User creation error:', userError);
          // Don't throw here as the auth user and tenant were created successfully
        }
      }

      // Success! Move to final step
      setCurrentStep(6);
      
      // Redirect to success page after showing completion
      setTimeout(() => {
        router.push('/onboard/success');
      }, 3000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Business Type *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
              >
                <option value="">Select your business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500 resize-none"
                placeholder="Tell us about your business and the experiences you offer..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="Enter your business address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="State or Province"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="Postal/Zip Code"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Your Booking Platform URL *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-l-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  placeholder="yourcompany"
                />
                <div className="h-12 px-4 bg-gray-100 border-2 border-l-0 border-gray-200 rounded-r-xl flex items-center text-gray-600">
                  .yourdomain.com
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Choose a unique subdomain for your booking platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    placeholder="#10B981"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    placeholder="#374151"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="https://yoursite.com/logo.png"
              />
              <p className="text-sm text-gray-500 mt-1">Optional: Add a logo URL (you can upload later)</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-4">Preview</h3>
              <div className="bg-white p-4 rounded-lg border" style={{ borderColor: formData.primaryColor }}>
                <div className="flex items-center justify-between mb-4">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-8" />
                  ) : (
                    <div className="font-bold text-lg" style={{ color: formData.primaryColor }}>
                      {formData.businessName || 'Your Business'}
                    </div>
                  )}
                  <button 
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Book Now
                  </button>
                </div>
                <div className="text-gray-600 text-sm">
                  This is how your booking platform will look to customers
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Start with a 30-day free trial. No credit card required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.selectedPlan === plan.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('selectedPlan', plan.name)}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Recommended
                    </Badge>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 text-sm text-gray-600">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {formData.selectedPlan === plan.name && (
                    <div className="absolute top-6 right-6">
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Your Booking Platform!
              </h3>
              <p className="text-gray-600 text-lg">
                Your account has been created successfully. You'll be redirected to the success page in a moment.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3">What's Next?</h4>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Check your email for verification link
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Set up your first trips and services
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Customize your booking platform
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  Start accepting bookings!
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/onboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to overview
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">
            Create Your Booking Platform
          </h1>
          <p className="text-lg text-gray-600">
            Let's get you set up with your own booking website in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 mr-6">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <Card className="p-8 shadow-xl">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
          </div>

          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : currentStep === 5 ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create My Platform
                    <Rocket className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
} 