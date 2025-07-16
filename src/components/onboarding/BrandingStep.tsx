import { StepComponentProps } from '@/types/onboarding';
import { DomainSetup } from './DomainSetup';

export function BrandingStep({ formData, onInputChange }: StepComponentProps) {
  return (
    <div className="space-y-6">
      {/* Domain Setup - Platform subdomain + Custom domain */}
      <DomainSetup
        formData={formData}
        onInputChange={onInputChange}
        // tenantId will be available after account creation in step 2
        tenantId={undefined} // TODO: Pass actual tenant ID when available
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => onInputChange('primaryColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => onInputChange('primaryColor', e.target.value)}
              className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
              placeholder="#10B981"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => onInputChange('secondaryColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={formData.secondaryColor}
              onChange={(e) => onInputChange('secondaryColor', e.target.value)}
              className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
              placeholder="#374151"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Logo URL
        </label>
        <input
          type="url"
          value={formData.logo}
          onChange={(e) => onInputChange('logo', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="https://yoursite.com/logo.png"
        />
        <p className="text-sm text-gray-500 mt-1">Optional: Add a logo URL (you can upload later)</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 
          className="font-semibold text-gray-800 mb-4"
          style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, letterSpacing: '-0.03em' }}
        >
          Preview
        </h3>
        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: formData.primaryColor }}>
          <div className="flex items-center justify-between mb-4">
            {formData.logo ? (
              <img src={formData.logo} alt="Logo" className="h-8" />
            ) : (
              <div className="font-bold text-lg" style={{ color: formData.primaryColor }}>
                {formData.businessName || 'Your Business'}
              </div>
            )}
            <button 
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Book Now
            </button>
          </div>
          <div className="text-gray-600 text-sm">
            This is how your booking platform will look to customers
          </div>
          {formData.useCustomDomain && formData.customDomain && (
            <div className="mt-2 text-xs text-blue-600">
              📍 Available at: booking.{formData.customDomain}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 