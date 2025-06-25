'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  CreditCard, 
  Database,
  Bell,
  Users,
  Save,
  AlertCircle
} from 'lucide-react';

interface PlatformSettings {
  general: {
    platform_name: string;
    support_email: string;
    default_timezone: string;
    default_currency: string;
    maintenance_mode: boolean;
  };
  billing: {
    stripe_publishable_key: string;
    default_trial_days: number;
    transaction_fee_percentage: number;
    invoice_prefix: string;
  };
  notifications: {
    welcome_email_enabled: boolean;
    trial_expiry_notifications: boolean;
    payment_failure_notifications: boolean;
    system_updates_enabled: boolean;
  };
  security: {
    password_min_length: number;
    require_email_verification: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
  };
  limits: {
    max_tenants: number;
    max_users_per_tenant: number;
    max_bookings_per_month: number;
    api_rate_limit_per_hour: number;
  };
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platform_name: 'Multi-Tenant Booking Platform',
      support_email: 'support@yoursaas.com',
      default_timezone: 'UTC',
      default_currency: 'USD',
      maintenance_mode: false,
    },
    billing: {
      stripe_publishable_key: 'pk_test_...',
      default_trial_days: 14,
      transaction_fee_percentage: 3.5,
      invoice_prefix: 'INV',
    },
    notifications: {
      welcome_email_enabled: true,
      trial_expiry_notifications: true,
      payment_failure_notifications: true,
      system_updates_enabled: false,
    },
    security: {
      password_min_length: 8,
      require_email_verification: true,
      session_timeout_minutes: 480,
      max_login_attempts: 5,
    },
    limits: {
      max_tenants: 1000,
      max_users_per_tenant: 100,
      max_bookings_per_month: 10000,
      api_rate_limit_per_hour: 1000,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (category: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure global platform settings and preferences</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.general.platform_name}
                onChange={(e) => handleSettingChange('general', 'platform_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.general.support_email}
                onChange={(e) => handleSettingChange('general', 'support_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Timezone
              </label>
              <select
                value={settings.general.default_timezone}
                onChange={(e) => handleSettingChange('general', 'default_timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={settings.general.default_currency}
                onChange={(e) => handleSettingChange('general', 'default_currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintenance_mode"
              checked={settings.general.maintenance_mode}
              onChange={(e) => handleSettingChange('general', 'maintenance_mode', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
              Enable Maintenance Mode
            </label>
            {settings.general.maintenance_mode && (
              <Badge variant="destructive">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <CardTitle>Billing Settings</CardTitle>
          </div>
          <CardDescription>Payment and subscription configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                value={settings.billing.stripe_publishable_key}
                onChange={(e) => handleSettingChange('billing', 'stripe_publishable_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pk_test_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Trial Days
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={settings.billing.default_trial_days}
                onChange={(e) => handleSettingChange('billing', 'default_trial_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.billing.transaction_fee_percentage}
                onChange={(e) => handleSettingChange('billing', 'transaction_fee_percentage', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={settings.billing.invoice_prefix}
                onChange={(e) => handleSettingChange('billing', 'invoice_prefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.security.password_min_length}
                onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                value={settings.security.session_timeout_minutes}
                onChange={(e) => handleSettingChange('security', 'session_timeout_minutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.max_login_attempts}
                onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="require_email_verification"
              checked={settings.security.require_email_verification}
              onChange={(e) => handleSettingChange('security', 'require_email_verification', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="require_email_verification" className="text-sm font-medium text-gray-700">
              Require Email Verification
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Platform Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <CardTitle>Platform Limits</CardTitle>
          </div>
          <CardDescription>System-wide resource limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tenants
              </label>
              <input
                type="number"
                min="1"
                value={settings.limits.max_tenants}
                onChange={(e) => handleSettingChange('limits', 'max_tenants', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Users per Tenant
              </label>
              <input
                type="number"
                min="1"
                value={settings.limits.max_users_per_tenant}
                onChange={(e) => handleSettingChange('limits', 'max_users_per_tenant', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Bookings per Month
              </label>
              <input
                type="number"
                min="100"
                value={settings.limits.max_bookings_per_month}
                onChange={(e) => handleSettingChange('limits', 'max_bookings_per_month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Rate Limit (per hour)
              </label>
              <input
                type="number"
                min="100"
                value={settings.limits.api_rate_limit_per_hour}
                onChange={(e) => handleSettingChange('limits', 'api_rate_limit_per_hour', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Notice */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-orange-800 font-medium">You have unsaved changes</p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Now'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 