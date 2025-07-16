import { businessTypes } from '@/lib/onboarding-constants';
import { StepComponentProps } from '@/types/onboarding';

export function BusinessInfoStep({ formData, onInputChange }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Business Name *
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => onInputChange('businessName', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="Enter your business name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Business Type *
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => onInputChange('businessType', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
        >
          <option value="">Select your business type</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange('website', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Business Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500 resize-none"
          placeholder="Tell us about your business and the experiences you offer..."
        />
      </div>
    </div>
  );
} 