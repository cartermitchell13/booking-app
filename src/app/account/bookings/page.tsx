'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/tenant-context';
import { 
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  trip_id: string;
  passenger_count_adult: number;
  passenger_count_child: number;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  trip: {
    title: string;
    destination: string;
    departure_location: string;
    departure_time: string;
    image_url?: string;
  };
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const checkAuthAndLoadBookings = async () => {
      if (!supabase) {
        router.push('/login?redirect=/account/bookings');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?redirect=/account/bookings');
          return;
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .single();

        if (userError || !userData) {
          router.push('/login?redirect=/account/bookings');
          return;
        }

        setUser(userData);

        // Fetch user bookings with trip details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_reference,
            trip_id,
            passenger_count_adult,
            passenger_count_child,
            total_amount,
            payment_status,
            status,
            created_at,
            trips:trip_id (
              title,
              destination,
              departure_location,
              departure_time,
              image_url
            )
          `)
          .eq('user_id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Bookings fetch error:', bookingsError);
        } else {
          // Transform the data to match our interface
          const transformedBookings = (bookingsData || []).map(booking => ({
            ...booking,
            trip: Array.isArray(booking.trips) ? booking.trips[0] : booking.trips
          })) as Booking[];
          setBookings(transformedBookings);
        }

      } catch (err) {
        console.error('Auth/booking check error:', err);
        router.push('/login?redirect=/account/bookings');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadBookings();
  }, [router, tenant?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/account"
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
                <p className="text-gray-600">View and manage your trip bookings</p>
              </div>
            </div>
            {user && (
              <div className="text-sm text-gray-600">
                {user.first_name} {user.last_name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by trip name, destination, or booking reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--focus-ring-color': tenant?.branding?.primary_color || '#10B981'
                  } as React.CSSProperties}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--focus-ring-color': tenant?.branding?.primary_color || '#10B981'
                  } as React.CSSProperties}
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matching bookings' : 'No bookings yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start exploring and book your first trip!'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white"
                  style={{ backgroundColor: tenant?.branding?.primary_color || '#10B981' }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Browse Trips
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={booking.trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80&h=64&fit=crop&crop=center"}
                              alt={booking.trip.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {booking.trip.title}
                              </h3>
                              <div className="flex items-center ml-4">
                                {getStatusIcon(booking.status)}
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{booking.trip.destination}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{formatDate(booking.trip.departure_time)} at {formatTime(booking.trip.departure_time)}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.passenger_count_adult} adult{booking.passenger_count_adult !== 1 ? 's' : ''}
                                  {booking.passenger_count_child > 0 && `, ${booking.passenger_count_child} child${booking.passenger_count_child !== 1 ? 'ren' : ''}`}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                <span>{formatPrice(booking.total_amount)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Booking #{booking.booking_reference}
                              </span>
                              <span className="text-sm text-gray-500">
                                Booked on {formatDate(booking.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-shrink-0">
                        <div className="text-sm text-gray-500 cursor-not-allowed flex items-center">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Coming soon
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {bookings.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(bookings.reduce((sum, b) => sum + b.total_amount, 0))}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 