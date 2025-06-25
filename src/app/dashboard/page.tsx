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
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data for demo purposes
const mockMetrics = {
  totalBookings: 247,
  totalRevenue: 18420,
  activeTrips: 12,
  totalCustomers: 189,
  averageRating: 4.8,
  recentBookings: [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      tripName: 'Banff National Park Bus Tour',
      date: '2024-01-20',
      amount: 89,
      status: 'confirmed'
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      tripName: 'Lake Louise Day Trip',
      date: '2024-01-21',
      amount: 125,
      status: 'pending'
    },
    {
      id: '3',
      customerName: 'Emily Davis',
      tripName: 'Jasper Wildlife Tour',
      date: '2024-01-22',
      amount: 95,
      status: 'confirmed'
    }
  ],
  upcomingTrips: [
    {
      id: '1',
      name: 'Banff Morning Tour',
      date: '2024-01-20',
      time: '09:00 AM',
      capacity: 24,
      booked: 18,
      location: 'Banff National Park'
    },
    {
      id: '2',
      name: 'Lake Louise Sunset',
      date: '2024-01-20',
      time: '06:00 PM',
      capacity: 16,
      booked: 12,
      location: 'Lake Louise'
    }
  ]
};

export default function TenantDashboard() {
  const { tenant, isLoading } = useTenant();
  const [metrics, setMetrics] = useState(mockMetrics);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
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
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+8% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeTrips}</p>
              <p className="text-sm text-blue-600 mt-1">{metrics.upcomingTrips.length} scheduled today</p>
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
            <a href="/dashboard/bookings" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {metrics.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.customerName}</p>
                  <p className="text-sm text-gray-600">{booking.tripName}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${booking.amount}</p>
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Trips */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Trips</h3>
            <a href="/dashboard/trips" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {metrics.upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{trip.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {trip.booked}/{trip.capacity} seats
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {trip.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.location}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(trip.booked / trip.capacity) * 100}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {trip.capacity - trip.booked} seats remaining
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/dashboard/trips"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Create Trip</p>
          </a>
          <a 
            href="/dashboard/bookings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Bookings</p>
          </a>
          <a 
            href="/dashboard/customers"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Analytics</p>
          </a>
          <a 
            href="/dashboard/settings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Settings</p>
          </a>
        </div>
      </Card>
    </div>
  );
} 