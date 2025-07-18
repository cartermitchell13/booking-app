import React from 'react';
import { MapPin } from 'lucide-react';
import { ConfigComponentProps } from '../types/createOfferingTypes';

export const SeatBasedConfig: React.FC<ConfigComponentProps> = ({ config, updateConfig }) => {
  const addPickupLocation = () => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', [...locations, { 
      id: Date.now(),
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      pickupTime: '',
      isMainLocation: false
    }]);
  };

  const removePickupLocation = (id: number) => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', locations.filter((loc: any) => loc.id !== id));
  };

  const updatePickupLocation = (id: number, field: string, value: any) => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', locations.map((loc: any) => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  return (
    <div className="space-y-8">
      {/* Vehicle Configuration */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚌 Vehicle Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={config.vehicleType || ''}
              onChange={(e) => updateConfig('vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vehicle type</option>
              <option value="coach">Coach Bus</option>
              <option value="minibus">Mini Bus</option>
              <option value="shuttle">Shuttle Van</option>
              <option value="luxury">Luxury Coach</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
            <input
              type="number"
              value={config.totalSeats || ''}
              onChange={(e) => updateConfig('totalSeats', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accessible Seats</label>
            <input
              type="number"
              value={config.accessibleSeats || ''}
              onChange={(e) => updateConfig('accessibleSeats', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="space-y-2">
              {['wifi', 'ac', 'restroom', 'refreshments', 'audioSystem'].map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const amenities = config.amenities || [];
                      if (e.target.checked) {
                        updateConfig('amenities', [...amenities, amenity]);
                      } else {
                        updateConfig('amenities', amenities.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{amenity.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Locations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📍 Pickup Locations</h3>
          <button
            onClick={addPickupLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Location
          </button>
        </div>
        <div className="space-y-4">
          {(config.pickupLocations || []).map((location: any) => (
            <div key={location.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                  <input
                    type="text"
                    value={location.name}
                    onChange={(e) => updatePickupLocation(location.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Downtown Calgary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => updatePickupLocation(location.id, 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, Calgary, AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="time"
                    value={location.pickupTime}
                    onChange={(e) => updatePickupLocation(location.id, 'pickupTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={location.isMainLocation}
                    onChange={(e) => updatePickupLocation(location.id, 'isMainLocation', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Main pickup location</span>
                </label>
                <button
                  onClick={() => removePickupLocation(location.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {(!config.pickupLocations || config.pickupLocations.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>No pickup locations added yet. Click "Add Location" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Route Planning */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Route Planning</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Description</label>
            <textarea
              value={config.routeDescription || ''}
              onChange={(e) => updateConfig('routeDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the route, stops, and key attractions..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Travel Time</label>
              <input
                type="number"
                value={config.estimatedTravelTime || ''}
                onChange={(e) => updateConfig('estimatedTravelTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Stops</label>
              <input
                type="number"
                value={config.numberOfStops || ''}
                onChange={(e) => updateConfig('numberOfStops', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 