'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { ButtonLoading } from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Get the intended destination for redirect after registration
  const redirectTo = searchParams.get('redirect') || '/account';

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setError('Authentication service is not configured. Please contact support.');
      setIsLoading(false);
      return;
    }

    if (!tenant?.id) {
      setError('Tenant information not available. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      // Create auth user with Supabase (skip email confirmation for testing)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            tenant_id: tenant.id,
            email_confirmed: true // Mark as confirmed for testing
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Create user record in our users table
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
            role: 'customer',
            email_verified: false
          });

        if (userError) {
          console.error('User creation error:', userError);
          // Don't throw here as the auth user was created successfully
        }

        // Show success message and redirect immediately (no email confirmation needed)
        setSuccess('Account created successfully! Redirecting...');

        // Redirect after a short delay
        setTimeout(() => {
            router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const primaryColor = tenant?.branding?.primary_color || '#10B981';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {tenant?.branding?.logo_url ? (
            <img
              className="h-16 w-auto"
              src={tenant.branding.logo_url}
              alt={tenant.name}
            />
          ) : (
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {tenant?.name || 'BookingApp'}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-lg text-gray-600">
            Join us today and start booking amazing experiences
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200">
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

            {success && (
              <div className="rounded-xl bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {success}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
                <div>
                  <label htmlFor="firstName" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      inputMode="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-12 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                      style={{ 
                        '--tw-ring-color': primaryColor
                      } as any}
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                    Last name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      inputMode="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-12 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                      style={{ 
                        '--tw-ring-color': primaryColor
                      } as any}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                  Phone <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    pattern="[+]?[\d\s\(\)\-]+"
                    className="pl-12 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-16 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="Create a password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="min-h-[56px] min-w-[56px] h-14 w-14 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-xl transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-base sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-12 pr-16 block w-full min-h-[56px] h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="min-h-[56px] min-w-[56px] h-14 w-14 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-xl transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <ButtonLoading
                loading={isLoading}
                type="submit"
                size="lg"
                variant="primary"
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </ButtonLoading>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Already have an account?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} 
                    className="font-bold hover:underline"
                    style={{color: primaryColor}}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 