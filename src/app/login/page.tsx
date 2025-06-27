'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/tenant-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlatformLogin, setIsPlatformLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Detect if this is platform login vs tenant login
  useEffect(() => {
    const hostname = window.location.hostname;
    const platformParam = searchParams.get('platform') === 'true';
    const isAppDomain = hostname.startsWith('app.') || 
                       hostname === 'localhost' && window.location.pathname.startsWith('/admin') ||
                       platformParam;
    setIsPlatformLogin(isAppDomain);
  }, [searchParams]);

  // Get the intended destination for redirect after login
  const redirectTo = searchParams.get('redirect') || (isPlatformLogin ? '/admin' : '/account');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setError('Authentication service is not configured. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Get user data to check role and tenant
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, tenant:tenants(*)')
          .eq('id', authData.user.id)
          .single();

        if (userError || !userData) {
          await supabase.auth.signOut();
          throw new Error('Account not found. Please check your email or contact support.');
        }

        // Handle platform login (super admin)
        if (isPlatformLogin) {
          if (userData.role !== 'super_admin') {
            await supabase.auth.signOut();
            throw new Error('Access denied. Super admin privileges required.');
          }
          router.push('/admin');
          return;
        }

        // Handle tenant login (customers, tenant admins, tenant staff)
        if (!tenant?.id) {
          await supabase.auth.signOut();
          throw new Error('Tenant not found for this domain.');
        }

        // Verify user belongs to current tenant (except super admins)
        if (userData.role !== 'super_admin' && userData.tenant_id !== tenant.id) {
          await supabase.auth.signOut();
          throw new Error('Account not found for this domain. Please check your email or register for a new account.');
        }

        // Redirect based on user role
        if (userData.role === 'tenant_admin' || userData.role === 'tenant_staff') {
          router.push('/dashboard');
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }

    if (!supabase) {
      setError('Authentication service is not configured.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setError(null);
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  };

  // Use different branding for platform vs tenant login
  const primaryColor = isPlatformLogin ? '#3B82F6' : (tenant?.branding?.primary_color || '#10B981');
  const brandName = isPlatformLogin ? 'Platform Admin' : (tenant?.name || 'BookingApp');
  const logoUrl = isPlatformLogin ? null : tenant?.branding?.logo_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logoUrl && !isPlatformLogin ? (
            <img
              className="h-16 w-auto"
              src={logoUrl}
              alt={brandName}
            />
          ) : (
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {brandName}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-lg text-gray-600">
            {isPlatformLogin 
              ? 'Sign in to manage the platform'
              : 'Sign in to your account to continue'
            }
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
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

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
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
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 block w-full h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-14 block w-full h-14 border-2 border-gray-200 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    style={{ 
                      '--tw-ring-color': primaryColor
                    } as any}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Forgot your password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: primaryColor,
                  '--tw-ring-color': primaryColor
                } as any}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isPlatformLogin ? (
                <>
                  Platform access is by invitation only.{' '}
                  <Link href="/contact" className="font-medium hover:underline" style={{ color: primaryColor }}>
                    Contact us
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link href="/register" className="font-medium hover:underline" style={{ color: primaryColor }}>
                    Sign up now
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 