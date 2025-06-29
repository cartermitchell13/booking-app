'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Heart,
  Bell,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  Plus,
  BookOpen
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
  const branding = useTenantBranding();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentBookings] = useState([
    {
      id: '1',
      tripName: 'Banff National Park Bus Tour',
      date: '2024-01-20',
      status: 'confirmed',
      amount: 89,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      tripName: 'Lake Louise Day Trip',
      date: '2024-01-15',
      status: 'completed',
      amount: 125,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: branding.primary_color || '#10B981' }}></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
    >
      {/* Clean White Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                {tenant?.branding?.logo_url ? (
                  <img
                    className="h-10 w-auto"
                    src={tenant.branding.logo_url}
                    alt={tenant.name}
                  />
                ) : (
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: branding.primary_color || '#10B981' }}
                  >
                    {tenant?.name || 'BookingApp'}
                  </div>
                )}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-600">
                  Member since {new Date(user.created_at).getFullYear()}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Welcome Section with Stats */}
          <div 
            className="rounded-2xl shadow-xl mb-8 overflow-hidden border-2"
            style={{ 
              backgroundColor: branding.foreground_color || '#FFFFFF',
              borderColor: branding.accent_color || '#059669'
            }}
          >
            <div className="px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{ color: branding.textOnForeground || '#111827' }}
                  >
                    Welcome back, {user.first_name}! 👋
                  </h1>
                  <p 
                    className="text-lg opacity-80"
                    style={{ color: branding.textOnForeground || '#6B7280' }}
                  >
                    Ready for your next adventure? Explore our latest offerings below.
                  </p>
                </div>
                <div className="flex space-x-6">
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: branding.primary_color || '#10B981' }}
                    >
                      {recentBookings.length}
                    </div>
                    <div 
                      className="text-sm opacity-70"
                      style={{ color: branding.textOnForeground || '#6B7280' }}
                    >
                      Total Bookings
                    </div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: branding.accent_color || '#059669' }}
                    >
                      {recentBookings.filter(b => b.status === 'completed').length}
                    </div>
                    <div 
                      className="text-sm opacity-70"
                      style={{ color: branding.textOnForeground || '#6B7280' }}
                    >
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div 
                className="rounded-2xl shadow-xl p-8 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#059669'
                }}
              >
                <h3 
                  className="text-xl font-bold mb-6"
                  style={{ color: branding.textOnForeground || '#111827' }}
                >
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link
                    href="/"
                    className="group relative p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      backgroundColor: branding.primary_color || '#10B981',
                      color: branding.textOnPrimary || '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <MapPin className="h-8 w-8 mb-3" />
                        <h4 className="text-lg font-semibold mb-2">Discover Trips</h4>
                        <p className="text-sm opacity-90">
                          Explore amazing destinations and book your next adventure
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <div 
                    className="group relative p-6 rounded-xl transition-all duration-300 cursor-not-allowed opacity-60"
                    style={{ 
                      backgroundColor: branding.accent_color || '#059669',
                      color: branding.textOnAccent || '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Heart className="h-8 w-8 mb-3" />
                        <h4 className="text-lg font-semibold mb-2">My Wishlist</h4>
                        <p className="text-sm opacity-90">
                          Save and organize your favorite trips for later
                        </p>
                      </div>
                      <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        Soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div 
                className="rounded-2xl shadow-xl p-8 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#059669'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: branding.textOnForeground || '#111827' }}
                  >
                    Recent Bookings
                  </h3>
                  <Link
                    href="/account/bookings"
                    className="text-sm font-medium hover:underline"
                    style={{ color: branding.primary_color || '#10B981' }}
                  >
                    View All
                  </Link>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
                      >
                        <img
                          src={booking.image}
                          alt={booking.tripName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 
                            className="font-semibold"
                            style={{ color: branding.textOnBackground || '#111827' }}
                          >
                            {booking.tripName}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-4 w-4 opacity-70" style={{ color: branding.textOnBackground || '#6B7280' }} />
                            <span 
                              className="text-sm opacity-70"
                              style={{ color: branding.textOnBackground || '#6B7280' }}
                            >
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p 
                            className="font-bold text-lg"
                            style={{ color: branding.textOnBackground || '#111827' }}
                          >
                            ${booking.amount}
                          </p>
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' 
                                ? 'text-green-800' 
                                : 'text-gray-800'
                            }`}
                            style={{ 
                              backgroundColor: booking.status === 'confirmed' 
                                ? `${branding.accent_color || '#059669'}20` 
                                : `${branding.textOnBackground || '#6B7280'}20`
                            }}
                          >
                            {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-16 w-16 opacity-40" style={{ color: branding.textOnForeground || '#9CA3AF' }} />
                    <h3 className="mt-4 text-lg font-medium" style={{ color: branding.textOnForeground || '#111827' }}>
                      No bookings yet
                    </h3>
                    <p className="mt-2 opacity-70" style={{ color: branding.textOnForeground || '#6B7280' }}>
                      Start exploring and book your first adventure!
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: branding.primary_color || '#10B981' }}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Browse Offerings
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Account Menu */}
              <div 
                className="rounded-2xl shadow-xl p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#059669'
                }}
              >
                <h3 
                  className="text-lg font-bold mb-6"
                  style={{ color: branding.textOnForeground || '#111827' }}
                >
                  Account Menu
                </h3>
                <nav className="space-y-2">
                  <Link
                    href="/account/bookings"
                    className="group flex items-center p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ 
                      backgroundColor: branding.background_color || '#F8FAFC',
                      color: branding.textOnBackground || '#111827'
                    }}
                  >
                    <Calendar 
                      className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform" 
                      style={{ color: branding.primary_color || '#10B981' }} 
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Booking History</div>
                      <div className="text-sm opacity-70">Manage your bookings</div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href="/account/profile"
                    className="group flex items-center p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ 
                      backgroundColor: branding.background_color || '#F8FAFC',
                      color: branding.textOnBackground || '#111827'
                    }}
                  >
                    <User 
                      className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform" 
                      style={{ color: branding.accent_color || '#059669' }} 
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Profile Settings</div>
                      <div className="text-sm opacity-70">Update your information</div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  {/* Coming Soon Items */}
                  <div className="space-y-2 pt-2">
                    {[
                      { icon: CreditCard, label: 'Payment Methods', desc: 'Manage cards & billing' },
                      { icon: Bell, label: 'Notifications', desc: 'Email & SMS preferences' },
                      { icon: Settings, label: 'Privacy Settings', desc: 'Account security' }
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-4 rounded-xl opacity-50 cursor-not-allowed"
                        style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
                      >
                        <item.icon className="h-6 w-6 mr-4" style={{ color: branding.textOnBackground || '#9CA3AF' }} />
                        <div className="flex-1">
                          <div className="font-semibold" style={{ color: branding.textOnBackground || '#9CA3AF' }}>
                            {item.label}
                          </div>
                          <div className="text-sm opacity-70" style={{ color: branding.textOnBackground || '#9CA3AF' }}>
                            {item.desc}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                          Soon
                        </span>
                      </div>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Account Summary Card */}
              <div 
                className="rounded-2xl shadow-xl p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#059669'
                }}
              >
                <h3 
                  className="text-lg font-bold mb-6"
                  style={{ color: branding.textOnForeground || '#111827' }}
                >
                  Account Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: branding.textOnForeground || '#111827' }}>
                      Total Spent
                    </span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: branding.primary_color || '#10B981' }}
                    >
                      ${recentBookings.reduce((sum, booking) => sum + booking.amount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: branding.textOnForeground || '#111827' }}>
                      Member Since
                    </span>
                    <span style={{ color: branding.textOnForeground || '#6B7280' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: branding.textOnForeground || '#111827' }}>
                      Status
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" style={{ color: branding.accent_color || '#059669' }} />
                      <span style={{ color: branding.accent_color || '#059669' }}>
                        Valued Customer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 