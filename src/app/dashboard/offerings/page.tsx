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
  Filter,
  Package,
  Copy,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Enhanced mock data showcasing universal product system
const mockOfferings = [
  {
    id: 'OFFER-001',
    name: 'Banff National Park Bus Tour',
    description: 'Full day guided tour of Banff National Park with wildlife viewing',
    type: 'seat',
    price: 89,
    currency: 'CAD',
    duration: '8 hours',
    capacity: 24,
    location: 'Banff, AB',
    image: '/images/banff-trip.jpg',
    status: 'active',
    bookings: 145,
    revenue: 12905,
    rating: 4.8,
    instances: 12,
    lastModified: '2024-01-15',
    features: ['WiFi', 'Lunch Included', 'Professional Guide', 'Photo Stops'],
    tags: ['Popular', 'Wildlife', 'Scenic']
  },
  {
    id: 'OFFER-002',
    name: 'Lake Louise Boat Cruise',
    description: 'Scenic boat cruise on the stunning Lake Louise',
    type: 'capacity',
    price: 125,
    currency: 'CAD',
    duration: '6 hours',
    capacity: 30,
    location: 'Lake Louise, AB',
    image: '/images/lake-louise.jpg',
    status: 'active',
    bookings: 89,
    revenue: 11125,
    rating: 4.9,
    instances: 8,
    lastModified: '2024-01-18',
    features: ['Boat Tour', 'Refreshments', 'Photography', 'Small Group'],
    tags: ['Premium', 'Photography', 'Lake']
  },
  {
    id: 'OFFER-003',
    name: 'Vancouver Food Walking Tour',
    description: 'Explore Vancouver\'s culinary scene on foot',
    type: 'open',
    price: 45,
    currency: 'CAD',
    duration: '3 hours',
    capacity: null, // unlimited for open type
    location: 'Vancouver, BC',
    image: '/images/vancouver-food.jpg',
    status: 'active',
    bookings: 67,
    revenue: 3015,
    rating: 4.7,
    instances: 20,
    lastModified: '2024-01-12',
    features: ['Food Tastings', 'Local Guide', 'Walking Tour', 'Cultural Experience'],
    tags: ['Food', 'Cultural', 'Urban']
  },
  {
    id: 'OFFER-004',
    name: 'Mountain Bike Rental',
    description: 'High-quality mountain bike rental with gear',
    type: 'equipment',
    price: 35,
    currency: 'CAD',
    duration: 'Daily',
    capacity: 15, // number of bikes available
    location: 'Whistler, BC',
    image: '/images/bike-rental.jpg',
    status: 'active',
    bookings: 156,
    revenue: 5460,
    rating: 4.6,
    instances: 30,
    lastModified: '2024-01-20',
    features: ['Helmet Included', 'Route Map', 'Maintenance Support', 'Trail Guide'],
    tags: ['Adventure', 'Self-Guided', 'Equipment']
  },
  {
    id: 'OFFER-005',
    name: 'Photography Workshop',
    description: 'Professional landscape photography workshop',
    type: 'timeslot',
    price: 180,
    currency: 'CAD',
    duration: '4 hours',
    capacity: 8,
    location: 'Moraine Lake, AB',
    image: '/images/photography-workshop.jpg',
    status: 'draft',
    bookings: 0,
    revenue: 0,
    rating: null,
    instances: 4,
    lastModified: '2024-01-22',
    features: ['Professional Instructor', 'Equipment Provided', 'Small Group', 'Certificate'],
    tags: ['New', 'Education', 'Photography']
  }
];

// Product type colors for visual distinction
const offeringTypeColors = {
  seat: 'bg-blue-100 text-blue-800',
  capacity: 'bg-green-100 text-green-800',
  open: 'bg-purple-100 text-purple-800',
  equipment: 'bg-orange-100 text-orange-800',
  package: 'bg-indigo-100 text-indigo-800',
  timeslot: 'bg-pink-100 text-pink-800'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800'
};

export default function OfferingsManagement() {
  const { tenant, isLoading } = useTenant();
  const [offerings, setOfferings] = useState(mockOfferings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter offerings based on search, status, and type
  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offering.status === statusFilter;
    const matchesType = typeFilter === 'all' || offering.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
          <h1 className="text-2xl font-bold text-gray-900">Offerings & Products</h1>
          <p className="text-gray-600 mt-1">
            Manage all your offerings - tours, equipment, classes, packages, and more
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
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="seat">Seat-based</option>
              <option value="capacity">Capacity</option>
              <option value="open">Open</option>
              <option value="equipment">Equipment</option>
              <option value="package">Package</option>
              <option value="timeslot">Timeslot</option>
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
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${offerings.reduce((sum, offering) => sum + (offering.revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
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

                  {/* Offering Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge className={offeringTypeColors[offering.type as keyof typeof offeringTypeColors]}>
                        {offering.type}
                      </Badge>
                      <Badge className={statusColors[offering.status as keyof typeof statusColors]}>
                        {offering.status}
                      </Badge>
                      {offering.revenue > 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          ${offering.revenue.toLocaleString()} revenue
                        </span>
                      )}
                    </div>
                    {offering.instances && (
                      <span className="text-sm text-gray-500">
                        {offering.instances} instances
                      </span>
                    )}
                  </div>
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