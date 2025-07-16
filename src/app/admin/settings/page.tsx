'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { GeistSans } from 'geist/font/sans';

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
    <div className={`min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard ${GeistSans.className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600 mt-1">Configure global platform settings and preferences</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* General Settings */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Basic platform configuration</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.general.platform_name}
                  onChange={(e) => handleSettingChange('general', 'platform_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.support_email}
                  onChange={(e) => handleSettingChange('general', 'support_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Timezone
                </label>
                <select
                  value={settings.general.default_timezone}
                  onChange={(e) => handleSettingChange('general', 'default_timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.general.default_currency}
                  onChange={(e) => handleSettingChange('general', 'default_currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={settings.general.maintenance_mode}
                onChange={(e) => handleSettingChange('general', 'maintenance_mode', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
              <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
                Enable Maintenance Mode
              </label>
              {settings.general.maintenance_mode && (
                <Badge variant="destructive" className="ml-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Billing Settings */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Billing & Payments</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure billing and payment processing</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  value={settings.billing.stripe_publishable_key}
                  onChange={(e) => handleSettingChange('billing', 'stripe_publishable_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.billing.invoice_prefix}
                  onChange={(e) => handleSettingChange('billing', 'invoice_prefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Trial Days
                </label>
                <input
                  type="number"
                  value={settings.billing.default_trial_days}
                  onChange={(e) => handleSettingChange('billing', 'default_trial_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="365"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Fee (%)
                </label>
                <input
                  type="number"
                  value={settings.billing.transaction_fee_percentage}
                  onChange={(e) => handleSettingChange('billing', 'transaction_fee_percentage', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Platform security and authentication settings</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.security.password_min_length}
                  onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="6"
                  max="32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.max_login_attempts}
                  onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="3"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.session_timeout_minutes}
                  onChange={(e) => handleSettingChange('security', 'session_timeout_minutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="1440"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="require_email_verification"
                checked={settings.security.require_email_verification}
                onChange={(e) => handleSettingChange('security', 'require_email_verification', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
              <label htmlFor="require_email_verification" className="text-sm font-medium text-gray-700">
                Require Email Verification for New Users
              </label>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure automated email notifications</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Welcome Email</label>
                <p className="text-sm text-gray-500">Send welcome email to new users</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.welcome_email_enabled}
                onChange={(e) => handleSettingChange('notifications', 'welcome_email_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Trial Expiry Notifications</label>
                <p className="text-sm text-gray-500">Notify tenants before trial expires</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.trial_expiry_notifications}
                onChange={(e) => handleSettingChange('notifications', 'trial_expiry_notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Payment Failure Notifications</label>
                <p className="text-sm text-gray-500">Notify when payments fail</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.payment_failure_notifications}
                onChange={(e) => handleSettingChange('notifications', 'payment_failure_notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">System Updates</label>
                <p className="text-sm text-gray-500">Notify tenants about platform updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.system_updates_enabled}
                onChange={(e) => handleSettingChange('notifications', 'system_updates_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Platform Limits */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Platform Limits</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Set platform-wide resource limits</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tenants
                </label>
                <input
                  type="number"
                  value={settings.limits.max_tenants}
                  onChange={(e) => handleSettingChange('limits', 'max_tenants', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Users Per Tenant
                </label>
                <input
                  type="number"
                  value={settings.limits.max_users_per_tenant}
                  onChange={(e) => handleSettingChange('limits', 'max_users_per_tenant', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Bookings Per Month
                </label>
                <input
                  type="number"
                  value={settings.limits.max_bookings_per_month}
                  onChange={(e) => handleSettingChange('limits', 'max_bookings_per_month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Rate Limit (per hour)
                </label>
                <input
                  type="number"
                  value={settings.limits.api_rate_limit_per_hour}
                  onChange={(e) => handleSettingChange('limits', 'api_rate_limit_per_hour', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 