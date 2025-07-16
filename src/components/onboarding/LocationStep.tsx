import { countries } from '@/lib/onboarding-constants';
import { StepComponentProps } from '@/types/onboarding';

export function LocationStep({ formData, onInputChange }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Street Address *
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="Enter your business address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            State/Province *
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onInputChange('state', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
            placeholder="State or Province"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Country *
          </label>
          <select
            value={formData.country}
            onChange={(e) => onInputChange('country', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => onInputChange('zipCode', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
            placeholder="Postal/Zip Code"
          />
        </div>
      </div>
    </div>
  );
} 