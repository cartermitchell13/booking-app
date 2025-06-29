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
  AlertCircle,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product, ProductType } from '@/types/products';

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

// Create New Offering Form Component
function CreateOfferingModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product_type: 'seat' as ProductType,
    base_price: '',
    currency: 'CAD',
    category: 'tour',
    image_url: '',
    tags: '',
    // Specific fields for different product types
    vehicle_type: '',
    total_seats: '',
    pickup_locations: '',
    vessel_type: '',
    total_capacity: '',
    tour_type: 'guided',
    duration_hours: '',
    difficulty_level: 'easy',
    equipment_type: '',
    session_type: 'class',
    max_participants: '',
    skill_level_required: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to proper format
    const productData = {
      name: formData.name,
      description: formData.description,
      product_type: formData.product_type,
      base_price: parseInt(formData.base_price) * 100, // Convert to cents
      currency: formData.currency,
      category: formData.category,
      image_url: formData.image_url || null,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      status: 'active',
      product_data: getProductTypeData(),
      availability_data: {
        schedule_type: 'custom',
        advance_booking_days: 7
      },
      booking_rules: {
        cancellation_policy: '24_hours',
        weather_policy: 'rain_or_shine'
      }
    };

    onSubmit(productData);
  };

  const getProductTypeData = () => {
    switch (formData.product_type) {
      case 'seat':
        return {
          vehicle_type: formData.vehicle_type,
          total_seats: parseInt(formData.total_seats) || 24,
          amenities: [],
          pickup_locations: formData.pickup_locations ? 
            formData.pickup_locations.split(',').map(loc => ({
              name: loc.trim(),
              address: loc.trim(),
              pickup_time_offset: 0
            })) : []
        };
      case 'capacity':
        return {
          vessel_type: formData.vessel_type,
          total_capacity: parseInt(formData.total_capacity) || 30,
          amenities: []
        };
      case 'open':
        return {
          tour_type: formData.tour_type,
          duration_hours: parseFloat(formData.duration_hours) || 3,
          difficulty_level: formData.difficulty_level,
          included_items: []
        };
      case 'equipment':
        return {
          equipment_type: formData.equipment_type,
          equipment_specifications: {},
          included_gear: []
        };
      case 'timeslot':
        return {
          session_type: formData.session_type,
          duration_minutes: (parseFloat(formData.duration_hours) || 2) * 60,
          max_participants: parseInt(formData.max_participants) || 8,
          skill_level_required: formData.skill_level_required
        };
      default:
        return {};
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Offering</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offering Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Banff National Park Bus Tour"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type *
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value as ProductType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="seat">Seat-based (Bus tours, trains)</option>
                <option value="capacity">Capacity-based (Boats, venues)</option>
                <option value="open">Open (Walking tours, events)</option>
                <option value="equipment">Equipment (Rentals, gear)</option>
                <option value="timeslot">Timeslot (Classes, workshops)</option>
                <option value="package">Package (Multi-activity bundles)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe your offering..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price * (in {formData.currency})
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="99.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tour">Tour</option>
                <option value="rental">Rental</option>
                <option value="activity">Activity</option>
                <option value="transport">Transport</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {/* Product Type Specific Fields */}
          {formData.product_type === 'seat' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-4">Seat-based Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Coach Bus, School Bus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="24"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Locations (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.pickup_locations}
                  onChange={(e) => setFormData({ ...formData, pickup_locations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Union Station, Etobicoke GO"
                />
              </div>
            </div>
          )}

          {formData.product_type === 'capacity' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-gray-900 mb-4">Capacity-based Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vessel/Venue Type
                  </label>
                  <input
                    type="text"
                    value={formData.vessel_type}
                    onChange={(e) => setFormData({ ...formData, vessel_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Boat, Hall, Venue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.total_capacity}
                    onChange={(e) => setFormData({ ...formData, total_capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.product_type === 'open' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold text-gray-900 mb-4">Open Tour Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Type
                  </label>
                  <select
                    value={formData.tour_type}
                    onChange={(e) => setFormData({ ...formData, tour_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="guided">Guided</option>
                    <option value="self_guided">Self-guided</option>
                    <option value="audio_guided">Audio-guided</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.product_type === 'equipment' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-orange-50">
              <h3 className="font-semibold text-gray-900 mb-4">Equipment Rental Configuration</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type
                </label>
                <input
                  type="text"
                  value={formData.equipment_type}
                  onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Mountain Bike, Kayak, Camping Gear"
                />
              </div>
            </div>
          )}

          {formData.product_type === 'timeslot' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-pink-50">
              <h3 className="font-semibold text-gray-900 mb-4">Timeslot Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Type
                  </label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="class">Class</option>
                    <option value="workshop">Workshop</option>
                    <option value="consultation">Consultation</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adventure, Popular, Wildlife"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Offering
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OfferingsManagement() {
  const { tenant, isLoading } = useTenant();
  const supabase = useTenantSupabase();
  const [offerings, setOfferings] = useState(mockOfferings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter offerings based on search, status, and type
  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offering.status === statusFilter;
    const matchesType = typeFilter === 'all' || offering.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateOffering = async (productData: any) => {
    if (!tenant || !supabase) {
      alert('Please ensure you are logged in and tenant is loaded');
      return;
    }

    setIsCreating(true);
    try {
      // Insert the product into the database using the raw Supabase client
      const { data: product, error } = await supabase.supabase
        .from('products')
        .insert([{
          tenant_id: tenant.id,
          ...productData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        alert('Failed to create offering: ' + error.message);
        return;
      }

      console.log('Product created successfully:', product);

      // Add to local state for immediate UI update
      const newOffering = {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.product_type,
        price: product.base_price / 100, // Convert from cents
        currency: product.currency,
        duration: product.product_data?.duration_hours ? `${product.product_data.duration_hours} hours` : 'TBD',
        capacity: product.product_data?.total_seats || product.product_data?.total_capacity || product.product_data?.max_participants || null,
        location: 'TBD', // You might want to add location to the form
        image: product.image_url || '/images/placeholder.jpg',
        status: product.status,
        bookings: 0,
        revenue: 0,
        rating: null,
        instances: 0,
        lastModified: new Date().toISOString().split('T')[0],
        features: [],
        tags: product.tags || []
      };

      setOfferings(prev => [newOffering, ...prev]);
      setShowCreateModal(false);
      alert('Offering created successfully!');
    } catch (error) {
      console.error('Error creating offering:', error);
      alert('Failed to create offering. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

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
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isCreating}
        >
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

      {/* Create Offering Modal */}
      <CreateOfferingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOffering}
      />
    </div>
  );
} 