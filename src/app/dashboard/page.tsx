'use client';

import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MapPin,
  Star,
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  activeProducts: number;
  totalCustomers: number;
  averageRating: number;
  recentBookings: Array<{
    id: string;
    customerName: string;
    productName: string;
    date: string;
    amount: number;
    status: string;
  }>;
  upcomingInstances: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
    capacity: number;
    booked: number;
    location: string;
  }>;
}

export default function TenantDashboard() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { getProducts, supabase } = useTenantSupabase();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!tenant?.id || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // For mock tenant ID, use the real ParkBus tenant ID
        const actualTenantId = tenant.id === 'mock-parkbus-id' 
          ? '20ee5f83-1019-46c7-9382-05a6f1ded9bf' 
          : tenant.id;

        // Fetch products
        const products = await getProducts();
        
        // Fetch bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            products!inner (
              name,
              product_instances (
                start_time,
                end_time
              )
            )
          `)
          .eq('tenant_id', actualTenantId)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        }

        // Calculate metrics
        const totalBookings = bookings?.length || 0;
        const totalRevenue = bookings?.reduce((sum, booking) => 
          booking.status !== 'cancelled' ? sum + (booking.total_amount || 0) : sum, 0
        ) || 0;
        const activeProducts = products?.filter(p => p.status === 'active').length || 0;
        
        // Get unique customers
        const uniqueCustomers = new Set(bookings?.map(b => b.user_id).filter(Boolean)).size;

        // Format recent bookings
        const recentBookings = (bookings || []).slice(0, 5).map(booking => ({
          id: booking.booking_reference || booking.id,
          customerName: booking.customer_name || 'Guest Customer',
          productName: booking.products?.name || 'Unknown Product',
          date: new Date(booking.created_at).toLocaleDateString(),
          amount: (booking.total_amount || 0) / 100, // Convert from cents
          status: booking.status || 'pending'
        }));

        // Get upcoming product instances
        const { data: upcomingInstances, error: instancesError } = await supabase
          .from('product_instances')
          .select(`
            *,
            products!inner (
              name,
              tenant_id
            )
          `)
          .eq('products.tenant_id', actualTenantId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);

        if (instancesError) {
          console.error('Error fetching instances:', instancesError);
        }

        const formattedUpcoming = (upcomingInstances || []).map(instance => ({
          id: instance.id,
          name: instance.products?.name || 'Unknown Product',
          date: new Date(instance.start_time).toLocaleDateString(),
          time: new Date(instance.start_time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          capacity: instance.max_quantity || 0,
          booked: (instance.max_quantity || 0) - (instance.available_quantity || 0),
          location: 'Location TBD' // Could be enhanced with location data
        }));

        setMetrics({
          totalBookings,
          totalRevenue: totalRevenue / 100, // Convert from cents
          activeProducts,
          totalCustomers: uniqueCustomers,
          averageRating: 4.8, // Could be calculated from reviews if available
          recentBookings,
          upcomingInstances: formattedUpcoming
        });

      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [tenant?.id, getProducts, supabase]);

  if (tenantLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Dashboard data could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back to {tenant?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <Badge 
          variant={tenant?.subscription_status === 'active' ? 'default' : 'secondary'}
          className="text-sm"
        >
          {tenant?.subscription_plan?.charAt(0).toUpperCase()}{tenant?.subscription_plan?.slice(1)} Plan
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings}</p>
              <p className="text-sm text-blue-600 mt-1">All time</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">Total earned</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeProducts}</p>
              <p className="text-sm text-blue-600 mt-1">{metrics.upcomingInstances.length} upcoming</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
              <p className="text-sm text-yellow-600 mt-1">{metrics.averageRating} ★ average rating</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {metrics.recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <Link href="/dashboard/offerings" className="text-sm text-blue-600 hover:text-blue-800">
                  Create your first offering →
                </Link>
              </div>
            ) : (
              metrics.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">{booking.productName}</p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${booking.amount.toFixed(2)}</p>
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Instances */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Trips</h3>
            <Link href="/dashboard/offerings" className="text-sm text-blue-600 hover:text-blue-800">
              Manage →
            </Link>
          </div>
          <div className="space-y-4">
            {metrics.upcomingInstances.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming instances</p>
                <Link href="/dashboard/offerings" className="text-sm text-blue-600 hover:text-blue-800">
                  Schedule instances →
                </Link>
              </div>
            ) : (
              metrics.upcomingInstances.map((instance) => (
                <div key={instance.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{instance.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {instance.booked}/{instance.capacity} booked
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {instance.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {instance.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {instance.location}
                    </div>
                  </div>
                  {instance.capacity > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Capacity</span>
                        <span>{Math.round((instance.booked / instance.capacity) * 100)}% filled</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(instance.booked / instance.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/offerings" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center mb-2">
              <Plus className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Create Offering</span>
            </div>
            <p className="text-sm text-gray-600">Add a new tour, rental, or activity</p>
          </Link>
          
          <Link 
            href="/dashboard/bookings" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">View Bookings</span>
            </div>
            <p className="text-sm text-gray-600">Manage customer reservations</p>
          </Link>
          
          <Link 
            href="/dashboard/customers" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium">Customer Management</span>
            </div>
            <p className="text-sm text-gray-600">View and manage customers</p>
          </Link>
        </div>
      </Card>
    </div>
  );
} 