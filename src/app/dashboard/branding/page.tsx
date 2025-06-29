'use client';

/**
 * TENANT BRANDING SYSTEM - COLOR USAGE GUIDE
 * 
 * This page allows tenants to customize their booking platform's brand colors.
 * Here's how each color is intended to be used throughout the platform:
 * 
 * 🎨 PRIMARY COLOR (--tenant-primary)
 *    • Main call-to-action buttons ("Book Now", "Search", "Submit")
 *    • Active navigation links and selected states
 *    • Primary icons and important interactive elements
 *    • Form focus states and selected inputs
 * 
 * ✨ ACCENT COLOR (--tenant-accent) 
 *    • Secondary buttons ("View Details", "Save", "Cancel")
 *    • Hover states and button highlights
 *    • Badge backgrounds and notification indicators
 *    • Decorative elements and dividers
 * 
 * 🎯 BACKGROUND COLOR (--tenant-background)
 *    • Main page background color
 *    • Card and modal backgrounds
 *    • Input field backgrounds
 *    • Content area backgrounds
 * 
 * 📝 FOREGROUND COLOR (--tenant-foreground)
 *    • Primary text color (headings, body text)
 *    • Dark icons and interface elements
 *    • Form labels and input text
 *    • Navigation text and menu items
 * 
 * 🔄 LEGACY SUPPORT (--tenant-secondary)
 *    • Maintained for backward compatibility
 *    • Gradually being phased out in favor of accent_color
 * 
 * CSS VARIABLES AVAILABLE:
 *    var(--tenant-primary)
 *    var(--tenant-accent) 
 *    var(--tenant-background)
 *    var(--tenant-foreground)
 *    var(--tenant-secondary) [legacy]
 *    var(--tenant-font)
 *    var(--tenant-custom-font) [custom uploaded fonts]
 */

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
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function BrandingManagement() {
  const { tenant, isLoading, refreshTenant } = useTenant();
  const { supabase } = useTenantSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [brandingSettings, setBrandingSettings] = useState({
    logo_url: tenant?.branding?.logo_url || '/images/black-pb-logo.png',
    primary_color: tenant?.branding?.primary_color || '#10B981',
    accent_color: tenant?.branding?.accent_color || '#059669',
    background_color: tenant?.branding?.background_color || '#FFFFFF',
    foreground_color: tenant?.branding?.foreground_color || '#111827',
    // Legacy support
    secondary_color: tenant?.branding?.secondary_color || '#059669',
    font_family: tenant?.branding?.font_family || 'Inter',
    custom_font_url: tenant?.branding?.custom_font_url || '',
    custom_font_name: tenant?.branding?.custom_font_name || '',
    custom_font_family: tenant?.branding?.custom_font_family || '',
    business_name: tenant?.name || 'ParkBus',
    tagline: 'Discover Amazing Adventures',
    contact_email: 'hello@parkbus.ca'
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [fontUploadStatus, setFontUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Custom Font'];

  // Track if we've initialized from tenant data to prevent constant resets
  const [isInitialized, setIsInitialized] = useState(false);

  // Update settings when tenant changes (but only on initial load)
  useEffect(() => {
    if (tenant && !isInitialized) {
      setBrandingSettings({
        logo_url: tenant.branding?.logo_url || '/images/black-pb-logo.png',
        primary_color: tenant.branding?.primary_color || '#10B981',
        accent_color: tenant.branding?.accent_color || '#059669',
        background_color: tenant.branding?.background_color || '#FFFFFF',
        foreground_color: tenant.branding?.foreground_color || '#111827',
        secondary_color: tenant.branding?.secondary_color || '#059669',
        font_family: tenant.branding?.font_family || 'Inter',
        custom_font_url: tenant.branding?.custom_font_url || '',
        custom_font_name: tenant.branding?.custom_font_name || '',
        custom_font_family: tenant.branding?.custom_font_family || '',
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
    root.style.setProperty('--tenant-accent', brandingSettings.accent_color);
    root.style.setProperty('--tenant-background', brandingSettings.background_color);
    root.style.setProperty('--tenant-foreground', brandingSettings.foreground_color);
    root.style.setProperty('--tenant-secondary', brandingSettings.secondary_color); // Legacy support
    
    // Handle font family - use custom font if available, otherwise use selected font
    let fontFamily = brandingSettings.font_family || 'Inter';
    
    // If custom font is configured, use it with proper fallbacks
    if (brandingSettings.font_family === 'Custom Font' && brandingSettings.custom_font_family) {
      fontFamily = `'${brandingSettings.custom_font_family}', 'Inter', sans-serif`;
    } else {
      // Use standard font with proper fallbacks
      if (fontFamily === 'Inter') fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      else if (fontFamily === 'Roboto') fontFamily = "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      else if (fontFamily === 'Open Sans') fontFamily = "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      else if (fontFamily === 'Poppins') fontFamily = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      else if (fontFamily === 'Montserrat') fontFamily = "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    
    root.style.setProperty('--tenant-font', fontFamily);
    console.log('🎨 Branding page set --tenant-font to:', fontFamily);
    
    // Generate custom font CSS if we have a custom font
    if (brandingSettings.custom_font_url && brandingSettings.custom_font_family) {
      const existingStyle = document.getElementById('custom-font-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = 'custom-font-style';
      style.textContent = `
        @font-face {
          font-family: '${brandingSettings.custom_font_family}';
          src: url('${brandingSettings.custom_font_url}') format('truetype'),
               url('${brandingSettings.custom_font_url}') format('opentype'),
               url('${brandingSettings.custom_font_url}') format('woff2'),
               url('${brandingSettings.custom_font_url}') format('woff');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }, [brandingSettings.primary_color, brandingSettings.accent_color, brandingSettings.background_color, brandingSettings.foreground_color, brandingSettings.secondary_color, brandingSettings.font_family, brandingSettings.custom_font_url, brandingSettings.custom_font_family]);

  const handleChange = (key: string, value: string) => {
    setBrandingSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase || !tenant?.id) {
      return;
    }

    // Validate file type
    const allowedTypes = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a valid font file (.ttf, .otf, .woff, .woff2)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Font file must be smaller than 5MB');
      return;
    }

    setFontUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Debug information
      console.log('🔤 Starting font upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        tenantId: tenant.id,
        hasSupabase: !!supabase
      });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `fonts/${tenant.id}/${timestamp}-${sanitizedName}`;

      console.log('🔤 Generated file path:', fileName);

      // Skip bucket verification since we know it exists - go straight to upload
      console.log('⬆️ Starting direct file upload to tenant-assets bucket...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Font upload error:', {
          uploadError,
          errorMessage: uploadError.message,
          tenantId: tenant?.id,
          fileName: fileName,
          fileSize: file.size,
          fullError: JSON.stringify(uploadError, null, 2)
        });
        throw uploadError;
      }

      console.log('✅ Font uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      console.log('🌐 Font public URL:', publicUrl);

      // Generate font family name from filename
      const fontFamilyName = file.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
        .replace(/^\d/, 'Font$&'); // Ensure doesn't start with number

      // Update branding settings
      setBrandingSettings(prev => ({
        ...prev,
        custom_font_url: publicUrl,
        custom_font_name: file.name,
        custom_font_family: fontFamilyName,
        font_family: 'Custom Font' // Auto-select custom font
      }));

      setHasChanges(true);
      setFontUploadStatus('success');
      setSaveStatus(null);

      // Clear success status after 3 seconds
      setTimeout(() => setFontUploadStatus('idle'), 3000);

    } catch (error) {
      console.error('❌ Font upload failed:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        tenantId: tenant?.id,
        fileName: file?.name,
        fileSize: file?.size
      });
      setFontUploadStatus('error');
      setTimeout(() => setFontUploadStatus('idle'), 3000);
    } finally {
      setUploadProgress(0);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomFont = () => {
    setBrandingSettings(prev => ({
      ...prev,
      custom_font_url: '',
      custom_font_name: '',
      custom_font_family: '',
      font_family: 'Inter' // Reset to default
    }));
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
        accent_color: brandingSettings.accent_color,
        background_color: brandingSettings.background_color,
        foreground_color: brandingSettings.foreground_color,
        secondary_color: brandingSettings.secondary_color, // Legacy support
        logo_url: brandingSettings.logo_url,
        font_family: brandingSettings.font_family,
        custom_font_url: brandingSettings.custom_font_url,
        custom_font_name: brandingSettings.custom_font_name,
        custom_font_family: brandingSettings.custom_font_family,
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
        accent_color: tenant.branding?.accent_color || '#059669',
        background_color: tenant.branding?.background_color || '#FFFFFF',
        foreground_color: tenant.branding?.foreground_color || '#111827',
        secondary_color: tenant.branding?.secondary_color || '#059669',
        font_family: tenant.branding?.font_family || 'Inter',
        custom_font_url: tenant.branding?.custom_font_url || '',
        custom_font_name: tenant.branding?.custom_font_name || '',
        custom_font_family: tenant.branding?.custom_font_family || '',
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

      {/* Font Upload Status */}
      {fontUploadStatus === 'uploading' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <Badge className="bg-blue-100 text-blue-800">
              Uploading font file...
            </Badge>
          </div>
        </div>
      )}

      {fontUploadStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <Badge className="bg-green-100 text-green-800">
              Font uploaded successfully! Don't forget to save your changes.
            </Badge>
          </div>
        </div>
      )}

      {fontUploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <Badge className="bg-red-100 text-red-800">
              Error uploading font. Please try again.
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
              Brand Colors
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <p className="text-xs text-gray-500 mb-2">Main buttons, links, and key interactive elements</p>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="#10B981"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <p className="text-xs text-gray-500 mb-2">Secondary buttons, highlights, and decorative elements</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <p className="text-xs text-gray-500 mb-2">Main page background and card backgrounds</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color</label>
                <p className="text-xs text-gray-500 mb-2">Card backgrounds and content areas that sit above the main background</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandingSettings.foreground_color}
                    onChange={(e) => handleChange('foreground_color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.foreground_color}
                    onChange={(e) => handleChange('foreground_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="#111827"
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
            <div className="space-y-6">
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

              {/* Custom Font Upload Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Custom Font Upload</label>
                  {brandingSettings.custom_font_name && (
                    <button
                      onClick={handleRemoveCustomFont}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
                
                {!brandingSettings.custom_font_name ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleFontUpload}
                      className="hidden"
                      disabled={fontUploadStatus === 'uploading'}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fontUploadStatus === 'uploading'}
                      className="flex items-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors w-full justify-center disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {fontUploadStatus === 'uploading' ? 'Uploading...' : 'Upload Font File'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports TTF, OTF, WOFF, WOFF2 files up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-green-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{brandingSettings.custom_font_name}</p>
                        <p className="text-xs text-green-600">Font Family: {brandingSettings.custom_font_family}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                  fontFamily: brandingSettings.font_family === 'Custom Font' && brandingSettings.custom_font_family 
                    ? brandingSettings.custom_font_family 
                    : brandingSettings.font_family
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
              
              <div 
                className="p-4"
                style={{ 
                  backgroundColor: brandingSettings.background_color,
                  fontFamily: brandingSettings.font_family === 'Custom Font' && brandingSettings.custom_font_family 
                    ? brandingSettings.custom_font_family 
                    : brandingSettings.font_family
                }}
              >
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
                      color: brandingSettings.accent_color,
                      borderColor: brandingSettings.accent_color 
                    }}
                  >
                    Learn More
                  </button>
                  <div className="text-center">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: brandingSettings.accent_color }}
                    >
                      Starting from $99
                    </span>
                  </div>
                  {brandingSettings.custom_font_name && (
                    <div className="text-center pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Using custom font: {brandingSettings.custom_font_family}
                      </p>
                    </div>
                  )}
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