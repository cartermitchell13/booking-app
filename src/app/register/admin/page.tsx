'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { supabase } from '@/lib/supabase';

interface Invitation {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  invited_by: string;
  expires_at: string;
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Validate invitation token on component mount
  useEffect(() => {
    const validateInvitation = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid or missing invitation token. Admin registration requires a valid invitation.');
        setIsValidating(false);
        return;
      }

      try {
        // Validate the invitation token
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (invitationError || !invitationData) {
          setError('Invalid or expired invitation token. Please request a new invitation.');
          setIsValidating(false);
          return;
        }

        // Set invitation data and pre-fill email
        setInvitation(invitationData);
        setFormData(prev => ({
          ...prev,
          email: invitationData.email
        }));
        
        setIsValidating(false);
      } catch (err) {
        console.error('Error validating invitation:', err);
        setError('Failed to validate invitation. Please try again.');
        setIsValidating(false);
      }
    };

    validateInvitation();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Ensure we have a valid invitation
    if (!invitation) {
      setError('Invalid invitation. Please request a new invitation.');
      setIsLoading(false);
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Create the user account
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: invitation.role as 'tenant_admin' // Use role from invitation
      });

      // Mark invitation as used
      const { error: invitationError } = await supabase
        .from('invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invitationError) {
        console.error('Error marking invitation as used:', invitationError);
        // Don't throw - user was created successfully
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Use tenant branding colors
  const primaryColor = tenant?.branding?.primary_color || '#10B981';

  // Show loading state while validating invitation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'var(--tenant-font, inherit)' }}>
            Validating invitation...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if invitation is invalid
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Invalid Invitation
            </h3>
            <p className="text-sm text-red-600 mb-4" style={{ fontFamily: 'var(--tenant-font, inherit)' }}>
              {error}
            </p>
            <p className="text-xs text-gray-600" style={{ fontFamily: 'var(--tenant-font, inherit)' }}>
              Please contact your administrator to request a new invitation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {tenant?.branding?.logo_url ? (
            <img
              src={tenant.branding.logo_url}
              alt={`${tenant.name} logo`}
              className="mx-auto h-12 w-auto"
            />
          ) : (
            <div 
              className="mx-auto h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <span 
                className={`text-white ${branding.headingWeightClass} text-xl`}
                style={{ fontFamily: 'var(--tenant-font, inherit)' }}
              >
                {tenant?.name?.charAt(0) || 'T'}
              </span>
            </div>
          )}
          <h2 
            className={`mt-6 text-3xl ${branding.headingWeightClass} text-gray-900`}
            style={{ 
              fontFamily: 'var(--tenant-font, inherit)',
              fontWeight: 'var(--tenant-heading-weight-value, 700)'
            }}
          >
            Create Admin Account
          </h2>
          <p 
            className="mt-2 text-sm text-gray-600"
            style={{ fontFamily: 'var(--tenant-font, inherit)' }}
          >
            Complete your admin registration for {tenant?.name}
          </p>
        </div>

        {/* Invitation Details */}
        {invitation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800" style={{ fontFamily: 'var(--tenant-font, inherit)' }}>
                  Valid Invitation
                </p>
                <p className="text-xs text-blue-600" style={{ fontFamily: 'var(--tenant-font, inherit)' }}>
                  Creating {invitation.role.replace('_', ' ')} account for {invitation.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
              style={{ fontFamily: 'var(--tenant-font, inherit)' }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700"
                style={{ fontFamily: 'var(--tenant-font, inherit)' }}
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm"
                style={{ 
                  fontFamily: 'var(--tenant-font, inherit)',
                  '--tw-ring-color': primaryColor
                } as any}
                placeholder="First name"
              />
            </div>
            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700"
                style={{ fontFamily: 'var(--tenant-font, inherit)' }}
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm"
                style={{ 
                  fontFamily: 'var(--tenant-font, inherit)',
                  '--tw-ring-color': primaryColor
                } as any}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
              style={{ fontFamily: 'var(--tenant-font, inherit)' }}
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              readOnly
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm bg-gray-50"
              style={{ 
                fontFamily: 'var(--tenant-font, inherit)',
                '--tw-ring-color': primaryColor
              } as any}
              placeholder="Email address"
            />
          </div>

          <div>
            <label 
              htmlFor="phone" 
              className="block text-sm font-medium text-gray-700"
              style={{ fontFamily: 'var(--tenant-font, inherit)' }}
            >
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm"
              style={{ 
                fontFamily: 'var(--tenant-font, inherit)',
                '--tw-ring-color': primaryColor
              } as any}
              placeholder="Phone number"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
              style={{ fontFamily: 'var(--tenant-font, inherit)' }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm"
              style={{ 
                fontFamily: 'var(--tenant-font, inherit)',
                '--tw-ring-color': primaryColor
              } as any}
              placeholder="Password (min. 6 characters)"
            />
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700"
              style={{ fontFamily: 'var(--tenant-font, inherit)' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent focus:z-10 sm:text-sm"
              style={{ 
                fontFamily: 'var(--tenant-font, inherit)',
                '--tw-ring-color': primaryColor
              } as any}
              placeholder="Confirm password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: primaryColor,
                '--tw-ring-color': primaryColor,
                fontFamily: 'var(--tenant-font, inherit)'
              } as any}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm hover:underline"
              style={{ 
                color: primaryColor,
                fontFamily: 'var(--tenant-font, inherit)'
              }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 