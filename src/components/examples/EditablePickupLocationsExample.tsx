import React, { useState } from 'react';
import { EditablePickupLocations } from '@/components/ui/EditablePickupLocations';
import { PickupLocation } from '@/types/products';

const mockBranding = {
  primary_color: '#3B82F6',
  textOnForeground: '#1F2937',
  foreground_color: '#FFFFFF',
  accent_color: '#E5E7EB'
};

export const EditablePickupLocationsExample: React.FC = () => {
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([
    {
      name: 'Downtown Transit Station',
      address: '123 Main Street, Downtown',
      pickup_time_offset: 0
    },
    {
      name: 'Airport Terminal',
      address: '456 Airport Road, Terminal 1',
      pickup_time_offset: -30
    }
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editable Pickup Locations Example</h1>
      
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Pickup Locations</h2>
        <EditablePickupLocations
          pickupLocations={pickupLocations}
          onChange={setPickupLocations}
          branding={mockBranding}
          placeholder="Click to add pickup location"
          maxLocations={10}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Current Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(pickupLocations, null, 2)}
        </pre>
      </div>
    </div>
  );
};