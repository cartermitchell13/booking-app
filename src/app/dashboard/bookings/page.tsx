'use client';

import { useTenant } from '@/lib/tenant-context';
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
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

// Mock booking data
const mockBookings = [
  {
    id: 'BK-2024-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    customerPhone: '+1 (555) 123-4567',
    tripName: 'Banff National Park Bus Tour',
    tripDate: '2024-01-25',
    tripTime: '09:00 AM',
    passengers: 2,
    totalAmount: 178,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-15',
    notes: 'Anniversary trip, requested window seats',
    pickupLocation: 'Calgary Downtown'
  },
  {
    id: 'BK-2024-002',
    customerName: 'Mike Chen',
    customerEmail: 'mike.chen@email.com',
    customerPhone: '+1 (555) 987-6543',
    tripName: 'Lake Louise Day Trip',
    tripDate: '2024-01-26',
    tripTime: '10:00 AM',
    passengers: 4,
    totalAmount: 500,
    status: 'pending',
    paymentStatus: 'pending',
    bookingDate: '2024-01-18',
    notes: 'Group booking, dietary restrictions noted',
    pickupLocation: 'Banff Centre'
  },
  {
    id: 'BK-2024-003',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@email.com',
    customerPhone: '+1 (555) 456-7890',
    tripName: 'Vancouver Food Walking Tour',
    tripDate: '2024-01-24',
    tripTime: '02:00 PM',
    passengers: 1,
    totalAmount: 45,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-12',
    notes: 'Vegetarian preferences',
    pickupLocation: 'Gastown'
  },
  {
    id: 'BK-2024-004',
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    customerPhone: '+1 (555) 321-0987',
    tripName: 'Jasper Wildlife Tour',
    tripDate: '2024-01-20',
    tripTime: '08:00 AM',
    passengers: 3,
    totalAmount: 285,
    status: 'cancelled',
    paymentStatus: 'refunded',
    bookingDate: '2024-01-10',
    notes: 'Cancelled due to weather concerns',
    pickupLocation: 'Jasper Townsite'
  }
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800'
};

export default function BookingsManagement() {
  const { tenant, isLoading } = useTenant();
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tripName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
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
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                ${bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, booking ID, or trip..."
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
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.id}</h3>
                    <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                      {booking.status}
                    </Badge>
                    <Badge className={paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors]}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${booking.totalAmount}</p>
                    <p className="text-sm text-gray-600">{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{booking.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`mailto:${booking.customerEmail}`} className="text-blue-600 hover:text-blue-800">
                          {booking.customerEmail}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <a href={`tel:${booking.customerPhone}`} className="text-blue-600 hover:text-blue-800">
                          {booking.customerPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Trip Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{booking.tripName}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{booking.tripDate} at {booking.tripTime}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{booking.pickupLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Booked on {booking.bookingDate}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-6">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Send Email">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Call Customer">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Bookings will appear here as customers make reservations'}
          </p>
        </Card>
      )}
    </div>
  );
} 