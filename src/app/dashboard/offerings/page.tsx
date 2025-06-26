'use client';

import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock trip data for demo
const mockTrips = [
  {
    id: '1',
    name: 'Banff National Park Bus Tour',
    description: 'Full day guided tour of Banff National Park with wildlife viewing',
    type: 'seat',
    price: 89,
    duration: '8 hours',
    capacity: 24,
    location: 'Banff, AB',
    image: '/images/banff-trip.jpg',
    status: 'active',
    bookings: 145,
    rating: 4.8,
    upcomingDepartures: [
      { date: '2024-01-20', time: '09:00 AM', booked: 18 },
      { date: '2024-01-21', time: '09:00 AM', booked: 12 },
      { date: '2024-01-22', time: '09:00 AM', booked: 8 }
    ]
  },
  {
    id: '2',
    name: 'Lake Louise Day Trip',
    description: 'Scenic day trip to the stunning Lake Louise',
    type: 'seat',
    price: 125,
    duration: '6 hours',
    capacity: 16,
    location: 'Lake Louise, AB',
    image: '/images/lake-louise.jpg',
    status: 'active',
    bookings: 89,
    rating: 4.9,
    upcomingDepartures: [
      { date: '2024-01-20', time: '10:00 AM', booked: 14 },
      { date: '2024-01-21', time: '10:00 AM', booked: 9 }
    ]
  },
  {
    id: '3',
    name: 'Vancouver Food Walking Tour',
    description: 'Explore Vancouver\'s best food spots on foot',
    type: 'open',
    price: 45,
    duration: '3 hours',
    capacity: null, // Unlimited for walking tours
    location: 'Vancouver, BC',
    image: '/images/vancouver-food.jpg',
    status: 'active',
    bookings: 234,
    rating: 4.7,
    upcomingDepartures: [
      { date: '2024-01-20', time: '02:00 PM', booked: 12 },
      { date: '2024-01-20', time: '06:00 PM', booked: 8 },
      { date: '2024-01-21', time: '02:00 PM', booked: 15 }
    ]
  },
  {
    id: '4',
    name: 'Jasper Wildlife Tour',
    description: 'Wildlife viewing and photography in Jasper National Park',
    type: 'seat',
    price: 95,
    duration: '5 hours',
    capacity: 12,
    location: 'Jasper, AB',
    image: '/images/jasper-wildlife.jpg',
    status: 'draft',
    bookings: 0,
    rating: null,
    upcomingDepartures: []
  }
];

export default function OfferingsManagement() {
  const { tenant, isLoading } = useTenant();
  const [offerings, setOfferings] = useState(mockTrips);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter offerings based on search and status
  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offering.status === statusFilter;
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
          <h1 className="text-2xl font-bold text-gray-900">Offering Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your tours, activities, and experiences
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create New Offering
        </button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search offerings by name or location..."
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Offering Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Offerings</p>
              <p className="text-2xl font-bold text-gray-900">{offerings.length}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Offerings</p>
              <p className="text-2xl font-bold text-gray-900">
                {offerings.filter(offering => offering.status === 'active').length}
              </p>
            </div>
            <Eye className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {offerings.reduce((sum, offering) => sum + offering.bookings, 0)}
              </p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {offerings.filter(offering => offering.rating).reduce((sum, offering, _, arr) => sum + (offering.rating || 0), 0) / offerings.filter(offering => offering.rating).length || 0}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Offerings List */}
      <div className="space-y-4">
        {filteredOfferings.map((offering) => (
          <Card key={offering.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{offering.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{offering.description}</p>
                    </div>
                    <Badge 
                      variant={offering.status === 'active' ? 'default' : 'secondary'}
                      className="ml-4"
                    >
                      {offering.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {offering.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {offering.duration}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${offering.price}
                    </div>
                    {offering.capacity && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {offering.capacity} max
                      </div>
                    )}
                    {offering.rating && (
                      <div className="flex items-center">
                        ⭐ {offering.rating} ({offering.bookings} bookings)
                      </div>
                    )}
                  </div>

                  {/* Upcoming Departures */}
                  {offering.upcomingDepartures.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Upcoming Departures:</p>
                      <div className="flex space-x-4">
                        {offering.upcomingDepartures.slice(0, 3).map((departure, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-2 text-xs">
                            <div className="font-medium">{departure.date}</div>
                            <div className="text-gray-600">{departure.time}</div>
                            <div className="text-blue-600">{departure.booked} booked</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOfferings.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offerings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first offering'}
          </p>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Offering
          </button>
        </Card>
      )}
    </div>
  );
} 