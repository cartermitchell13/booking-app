'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/tenant-context';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Heart,
  Bell,
  ChevronRight
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentBookings] = useState([
    {
      id: '1',
      tripName: 'Banff National Park Bus Tour',
      date: '2024-01-20',
      status: 'confirmed',
      amount: 89
    },
    {
      id: '2',
      tripName: 'Lake Louise Day Trip',
      date: '2024-01-15',
      status: 'completed',
      amount: 125
    }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        // No auth configured - redirect to login
        router.push('/login?redirect=/account');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?redirect=/account');
          return;
        }

        // Fetch user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .single();

        if (error || !userData) {
          console.error('User data error:', error);
          router.push('/login?redirect=/account');
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login?redirect=/account');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, tenant?.id]);

  const handleSignOut = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                {tenant?.branding?.logo_url ? (
                  <img
                    className="h-8 w-auto"
                    src={tenant.branding.logo_url}
                    alt={tenant.name}
                  />
                ) : (
                  <div className="text-xl font-bold" style={{ color: tenant?.branding?.primary_color || '#10B981' }}>
                    {tenant?.name || 'BookingApp'}
                  </div>
                )}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.first_name} {user.last_name}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.first_name}!
              </h1>
              <p className="text-gray-600">
                Manage your bookings, update your profile, and discover new adventures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/search"
                      className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                          <MapPin className="h-6 w-6" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium">
                          <span className="absolute inset-0" aria-hidden="true" />
                          Book a Trip
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Discover and book your next adventure
                        </p>
                      </div>
                      <span className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </Link>

                    <div className="relative group bg-gray-50 p-6 rounded-lg opacity-50 cursor-not-allowed">
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-400 ring-4 ring-white">
                          <Heart className="h-6 w-6" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-400">
                          My Wishlist
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          Coming soon - Save trips for later
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Bookings
                    </h3>
                    <span className="text-sm text-gray-500 cursor-not-allowed">
                      View All (Coming Soon)
                    </span>
                  </div>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.tripName}</h4>
                          <p className="text-sm text-gray-500">{booking.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${booking.amount}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recentBookings.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start exploring and book your first trip!
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/search"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
                          style={{ backgroundColor: tenant?.branding?.primary_color || '#10B981' }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Browse Trips
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Menu */}
            <div className="space-y-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Menu
                  </h3>
                  <nav className="space-y-2">
                    <Link
                      href="/account/bookings"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-8 w-8 mr-4" style={{ color: tenant?.branding?.primary_color || '#10B981' }} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
                            <p className="text-gray-600">View and manage your trip bookings</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Link>

                    <Link
                      href="/account/profile"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Settings className="h-8 w-8 mr-4" style={{ color: tenant?.branding?.primary_color || '#10B981' }} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                            <p className="text-gray-600">Update your personal information</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Link>

                    <div className="flex items-center p-2 text-gray-400 cursor-not-allowed rounded-md">
                      <CreditCard className="h-5 w-5 mr-3" />
                      <span>Payment Methods</span>
                      <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">Soon</span>
                    </div>
                    <div className="flex items-center p-2 text-gray-400 cursor-not-allowed rounded-md">
                      <Bell className="h-5 w-5 mr-3" />
                      <span>Notifications</span>
                      <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">Soon</span>
                    </div>
                    <div className="flex items-center p-2 text-gray-400 cursor-not-allowed rounded-md">
                      <Settings className="h-5 w-5 mr-3" />
                      <span>Account Settings</span>
                      <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">Soon</span>
                    </div>
                  </nav>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{user.first_name} {user.last_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email}</dd>
                    </div>
                    {user.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900">{user.phone}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Member since</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 