'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Upload, 
  Eye, 
  Save,
  RotateCcw,
  Image,
  Type,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { useState } from 'react';

export default function BrandingManagement() {
  const { tenant, isLoading } = useTenant();
  
  const [brandingSettings, setBrandingSettings] = useState({
    logo_url: tenant?.branding?.logo_url || '/images/black-pb-logo.png',
    primary_color: tenant?.branding?.primary_color || '#10B981',
    secondary_color: tenant?.branding?.secondary_color || '#059669',
    font_family: tenant?.branding?.font_family || 'Inter',
    business_name: tenant?.name || 'ParkBus',
    tagline: 'Discover Amazing Adventures',
    contact_email: 'hello@parkbus.ca'
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);

  const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat'];

  const handleChange = (key: string, value: string) => {
    setBrandingSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Customization</h1>
          <p className="text-gray-600 mt-1">Customize your booking site's appearance</p>
        </div>
        <div className="flex space-x-3">
          <button 
            disabled={!hasChanges}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button 
            disabled={!hasChanges}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unsaved Changes - Don't forget to save!
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Logo & Assets */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Logo & Assets
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={brandingSettings.logo_url} 
                  alt="Logo"
                  className="w-12 h-12 object-contain border border-gray-200 rounded"
                />
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Logo
                </button>
              </div>
            </div>
          </Card>

          {/* Colors */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Colors
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Typography & Business Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Typography & Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={brandingSettings.font_family}
                  onChange={(e) => handleChange('font_family', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={brandingSettings.business_name}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={brandingSettings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live Preview
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={`border border-gray-300 rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div 
                className="p-4 border-b"
                style={{ 
                  backgroundColor: brandingSettings.primary_color,
                  fontFamily: brandingSettings.font_family 
                }}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={brandingSettings.logo_url} 
                    alt="Logo"
                    className="w-8 h-8 object-contain bg-white rounded p-1"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-sm">{brandingSettings.business_name}</h4>
                    <p className="text-white/80 text-xs">{brandingSettings.tagline}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white">
                <div className="space-y-3">
                  <button 
                    className="w-full py-2 px-4 rounded-md text-white text-sm font-medium"
                    style={{ backgroundColor: brandingSettings.primary_color }}
                  >
                    Book Now
                  </button>
                  <button 
                    className="w-full py-2 px-4 rounded-md text-sm font-medium border"
                    style={{ 
                      color: brandingSettings.primary_color,
                      borderColor: brandingSettings.primary_color 
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              Preview shows how your branding appears to customers
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
} 