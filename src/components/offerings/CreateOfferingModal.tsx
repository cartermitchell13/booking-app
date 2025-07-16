'use client';

import { useState } from 'react';
import { ProductType } from '@/types/products';
import { X } from 'lucide-react';

interface CreateOfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function CreateOfferingModal({ isOpen, onClose, onSubmit }: CreateOfferingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
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
      location: formData.location,
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
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Toronto, Vancouver, Calgary"
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