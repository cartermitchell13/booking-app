'use client';

import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
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
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BrandingManagement() {
  const { tenant, isLoading, refreshTenant } = useTenant();
  const { supabase } = useTenantSupabase();
  
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat'];

  // Track if we've initialized from tenant data to prevent constant resets
  const [isInitialized, setIsInitialized] = useState(false);

  // Update settings when tenant changes (but only on initial load)
  useEffect(() => {
    if (tenant && !isInitialized) {
      setBrandingSettings({
        logo_url: tenant.branding?.logo_url || '/images/black-pb-logo.png',
        primary_color: tenant.branding?.primary_color || '#10B981',
        secondary_color: tenant.branding?.secondary_color || '#059669',
        font_family: tenant.branding?.font_family || 'Inter',
        business_name: tenant.name || 'ParkBus',
        tagline: 'Discover Amazing Adventures',
        contact_email: 'hello@parkbus.ca'
      });
      setIsInitialized(true);
    }
  }, [tenant, isInitialized]);

  // Apply branding changes in real-time for preview
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', brandingSettings.primary_color);
    root.style.setProperty('--tenant-secondary', brandingSettings.secondary_color);
    root.style.setProperty('--tenant-font', brandingSettings.font_family);
  }, [brandingSettings.primary_color, brandingSettings.secondary_color, brandingSettings.font_family]);

  const handleChange = (key: string, value: string) => {
    setBrandingSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    console.log('🔍 DEBUGGING SAVE:', {
      hasTenant: !!tenant,
      tenantId: tenant?.id,
      hasSupabase: !!supabase,
      supabaseInstance: supabase
    });

    console.log('🎨 Current brandingSettings state:', brandingSettings);
    console.log('🏢 Current tenant branding:', tenant?.branding);

    if (!tenant?.id || !supabase) {
      console.error('❌ Missing tenant or supabase:', { tenant: tenant?.id, supabase: !!supabase });
      setSaveStatus('error');
      return;
    }

    console.log('✅ Starting save process...');
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const updatedBranding = {
        ...tenant.branding, // Preserve other branding settings FIRST
        primary_color: brandingSettings.primary_color, // Then override with new values
        secondary_color: brandingSettings.secondary_color,
        logo_url: brandingSettings.logo_url,
        font_family: brandingSettings.font_family,
      };

      console.log('📝 Attempting to save branding:', {
        tenantId: tenant.id,
        updatedBranding,
        businessName: brandingSettings.business_name
      });

      // Update tenant branding in database
      console.log('📡 Making database call...');
      
      // Try direct REST API call instead of Supabase client
      console.log('🚀 Using direct REST API call...');
      console.log('🎯 Target tenant ID:', tenant.id);
      console.log('📤 Sending data:', {
        branding: updatedBranding,
        name: brandingSettings.business_name,
        updated_at: new Date().toISOString()
      });
      
      const response = await fetch(`https://zsdkqmlhnffoidwyygce.supabase.co/rest/v1/tenants?id=eq.${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          branding: updatedBranding,
          name: brandingSettings.business_name,
          updated_at: new Date().toISOString()
        })
      });

      console.log('📊 REST API response status:', response.status);
      console.log('📊 REST API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ REST API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 REST API result:', data);
      console.log('📊 Returned data length:', data.length);
      if (data.length > 0) {
        console.log('📊 First result branding:', data[0].branding);
        // Don't update local state - keep the current brandingSettings as they are
        // This prevents any conflicts with UI state
      }

      console.log('✅ Save successful!');
      // Mark as saved first to prevent state reset
      setHasChanges(false);
      setSaveStatus('success');
      
      // Skip refresh for now since direct API worked
      // if (refreshTenant) {
      //   console.log('🔄 Refreshing tenant context...');
      //   await refreshTenant();
      // }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('❌ Error saving branding:', error);
      setSaveStatus('error');
    } finally {
      console.log('🏁 Save process complete');
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (tenant) {
      setBrandingSettings({
        logo_url: tenant.branding?.logo_url || '/images/black-pb-logo.png',
        primary_color: tenant.branding?.primary_color || '#10B981',
        secondary_color: tenant.branding?.secondary_color || '#059669',
        font_family: tenant.branding?.font_family || 'Inter',
        business_name: tenant.name || 'ParkBus',
        tagline: 'Discover Amazing Adventures',
        contact_email: 'hello@parkbus.ca'
      });
      setHasChanges(false);
      setSaveStatus(null);
    }
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
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
            <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {hasChanges && !saveStatus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unsaved Changes - Don't forget to save!
          </Badge>
          </div>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <Badge className="bg-green-100 text-green-800">
              Branding settings saved successfully!
            </Badge>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <Badge className="bg-red-100 text-red-800">
              Error saving settings. Please try again.
            </Badge>
          </div>
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
                <div>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Logo
                </button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={brandingSettings.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="https://example.com/logo.png"
                />
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
                    className="w-full py-2 px-4 rounded-md text-white text-sm font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: brandingSettings.primary_color }}
                  >
                    Book Now
                  </button>
                  <button 
                    className="w-full py-2 px-4 rounded-md text-sm font-medium border transition-colors hover:bg-gray-50"
                    style={{ 
                      color: brandingSettings.primary_color,
                      borderColor: brandingSettings.primary_color 
                    }}
                  >
                    Learn More
                  </button>
                  <div className="text-center">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: brandingSettings.secondary_color }}
                    >
                      Starting from $99
                    </span>
                  </div>
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