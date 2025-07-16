'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenant-context';
import { Building2, User, ArrowRight, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { tenant } = useTenant();

  // If we're on a tenant domain, redirect directly to customer registration
  useEffect(() => {
    if (tenant?.id) {
      router.replace('/register/customer');
    }
  }, [tenant?.id, router]);

  // If we have a tenant (redirecting), show loading
  if (tenant?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Join our platform
          </h2>
          <p className="text-lg text-gray-600">
            Choose how you'd like to get started
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 px-4">
          {/* Business Owner Registration */}
          <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                I'm a Business Owner
              </h3>
              <p className="text-gray-600 mb-6">
                Register your tour company and start offering amazing experiences to customers
              </p>
              
              <div className="space-y-3 text-left text-sm text-gray-600 mb-8">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Create and manage your tour offerings</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Accept bookings from customers</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Custom branding and domain</span>
                </div>
              </div>

              <Link
                href="/register/operator"
                className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start your business
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Customer Registration */}
          <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                I'm a Customer
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to book tours and manage your travel experiences
              </p>
              
              <div className="space-y-3 text-left text-sm text-gray-600 mb-8">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  <span>Book amazing tours and experiences</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-green-600" />
                  <span>Manage your bookings and history</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-green-600" />
                  <span>Personalized recommendations</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  To register as a customer, visit a tour operator's website and create an account there.
                </p>
                <Link
                  href="/search"
                  className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Browse experiences
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back to login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 