'use client';

import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  Phone,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  product_name: string;
  booking_date: string;
  start_time?: string;
  passengers: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  special_requests?: string;
  created_at: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  no_show: 'bg-gray-100 text-gray-800'
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  partially_paid: 'bg-orange-100 text-orange-800'
};

export default function BookingsManagement() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { supabase } = useTenantSupabase();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const loadBookings = async () => {
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

        // Fetch bookings with product information
        const { data: bookingData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            products!inner (
              name,
              product_instances!product_instances_product_id_fkey (
                start_time,
                end_time
              )
            )
          `)
          .eq('tenant_id', actualTenantId)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          throw bookingsError;
        }

        // Transform bookings data
        const transformedBookings: Booking[] = (bookingData || []).map(booking => ({
          id: booking.id,
          booking_reference: booking.booking_reference || `BK-${booking.id.slice(0, 8)}`,
          customer_name: booking.customer_name || 'Guest Customer',
          customer_email: booking.customer_email || 'customer@example.com',
          customer_phone: booking.customer_phone,
          product_name: booking.products?.name || 'Unknown Product',
          booking_date: booking.products?.product_instances?.[0]?.start_time 
            ? new Date(booking.products.product_instances[0].start_time).toLocaleDateString()
            : 'TBD',
          start_time: booking.products?.product_instances?.[0]?.start_time 
            ? new Date(booking.products.product_instances[0].start_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            : 'TBD',
          passengers: booking.quantity || 1,
          total_amount: (booking.total_amount || 0) / 100, // Convert from cents
          status: booking.status || 'pending',
          payment_status: booking.payment_status || 'pending',
          special_requests: booking.special_requests,
          created_at: booking.created_at
        }));

        setBookings(transformedBookings);

      } catch (err: any) {
        console.error('Error loading bookings:', err);
        setError(err.message || 'Failed to load bookings');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [tenant?.id, supabase]);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!supabase || !window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('tenant_id', tenant?.id);

      if (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status: ' + error.message);
        return;
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ));
      
      alert('Booking status updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleRefreshBookings = () => {
    window.location.reload();
  };

  if (tenantLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading bookings...</p>
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
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Bookings</h3>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">
            Manage customer reservations and bookings
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={handleRefreshBookings}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_amount, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, booking reference, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {bookings.length === 0 
              ? 'When customers book your offerings, they will appear here.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {bookings.length === 0 && (
            <Link 
              href="/dashboard/offerings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Create Your First Offering
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.booking_reference}
                      </h3>
                      <p className="text-gray-600">{booking.product_name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                      <Badge className={paymentStatusColors[booking.payment_status]}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer</p>
                      <p className="text-gray-900">{booking.customer_name}</p>
                      <p className="text-sm text-gray-600">{booking.customer_email}</p>
                      {booking.customer_phone && (
                        <p className="text-sm text-gray-600">{booking.customer_phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Trip Date & Time</p>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-1" />
                        {booking.booking_date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {booking.start_time}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passengers</p>
                      <div className="flex items-center text-gray-900">
                        <Users className="w-4 h-4 mr-1" />
                        {booking.passengers} {booking.passengers === 1 ? 'passenger' : 'passengers'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <div className="flex items-center text-gray-900 font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${booking.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Special Requests</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Booked on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button 
                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 