'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Package,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

// Mock product data showcasing universal product system
const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Banff National Park Bus Tour',
    type: 'seat',
    status: 'active',
    price: 89,
    currency: 'CAD',
    description: 'Full day guided tour of Banff National Park',
    capacity: 24,
    duration: '8 hours',
    location: 'Banff, AB',
    instances: 12,
    bookings: 145,
    revenue: 12905,
    rating: 4.8,
    lastModified: '2024-01-15',
    features: ['WiFi', 'Lunch Included', 'Professional Guide', 'Photo Stops'],
    tags: ['Popular', 'Wildlife', 'Scenic']
  },
  {
    id: 'PROD-002',
    name: 'Lake Louise Day Trip',
    type: 'capacity',
    status: 'active',
    price: 125,
    currency: 'CAD',
    description: 'Scenic boat cruise on Lake Louise',
    capacity: 30,
    duration: '6 hours',
    location: 'Lake Louise, AB',
    instances: 8,
    bookings: 89,
    revenue: 11125,
    rating: 4.9,
    lastModified: '2024-01-18',
    features: ['Boat Tour', 'Refreshments', 'Photography', 'Small Group'],
    tags: ['Premium', 'Photography', 'Lake']
  },
  {
    id: 'PROD-003',
    name: 'Vancouver Food Walking Tour',
    type: 'open',
    status: 'active',
    price: 45,
    currency: 'CAD',
    description: 'Explore Vancouver\'s culinary scene on foot',
    capacity: null, // unlimited for open type
    duration: '3 hours',
    location: 'Vancouver, BC',
    instances: 20,
    bookings: 67,
    revenue: 3015,
    rating: 4.7,
    lastModified: '2024-01-12',
    features: ['Food Tastings', 'Local Guide', 'Walking Tour', 'Cultural Experience'],
    tags: ['Food', 'Cultural', 'Urban']
  },
  {
    id: 'PROD-004',
    name: 'Mountain Bike Rental',
    type: 'equipment',
    status: 'active',
    price: 35,
    currency: 'CAD',
    description: 'High-quality mountain bike rental with gear',
    capacity: 15, // number of bikes available
    duration: 'Daily',
    location: 'Whistler, BC',
    instances: 30,
    bookings: 156,
    revenue: 5460,
    rating: 4.6,
    lastModified: '2024-01-20',
    features: ['Helmet Included', 'Route Map', 'Maintenance Support', 'Trail Guide'],
    tags: ['Adventure', 'Self-Guided', 'Equipment']
  },
  {
    id: 'PROD-005',
    name: 'Photography Workshop',
    type: 'timeslot',
    status: 'draft',
    price: 180,
    currency: 'CAD',
    description: 'Professional landscape photography workshop',
    capacity: 8,
    duration: '4 hours',
    location: 'Moraine Lake, AB',
    instances: 4,
    bookings: 0,
    revenue: 0,
    rating: null,
    lastModified: '2024-01-22',
    features: ['Professional Instructor', 'Equipment Provided', 'Small Group', 'Certificate'],
    tags: ['New', 'Education', 'Photography']
  }
];

const productTypeColors = {
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

export default function ProductsManagement() {
  const { tenant, isLoading } = useTenant();
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || product.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'revenue':
          return b.revenue - a.revenue;
        case 'bookings':
          return b.bookings - a.bookings;
        case 'recent':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalBookings = products.reduce((sum, p) => sum + p.bookings, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
          <p className="text-gray-600 mt-1">
            Manage your tours, rentals, and experiences
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-4 h-4 mr-2" />
            Import Products
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
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
              placeholder="Search products, descriptions, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="bookings">Sort by Bookings</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={productTypeColors[product.type as keyof typeof productTypeColors]}>
                  {product.type}
                </Badge>
                <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                  {product.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title="More">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="font-medium">${product.price} {product.currency}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-1" />
                  <span>{product.capacity ? `${product.capacity} max` : 'Unlimited'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span>{product.duration}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                  <span>{product.location}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600">Instances</p>
                <p className="font-semibold text-gray-900">{product.instances}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Bookings</p>
                <p className="font-semibold text-gray-900">{product.bookings}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {product.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(product.rating))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500">Updated {product.lastModified}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first product to start offering tours and experiences'}
          </p>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </button>
        </Card>
      )}
    </div>
  );
} 