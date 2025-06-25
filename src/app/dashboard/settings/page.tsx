'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

export default function BusinessSettings() {
  const { tenant, isLoading } = useTenant();
  
  const [settings, setSettings] = useState({
    // Business Details
    businessName: tenant?.name || 'ParkBus',
    businessPhone: '+1 (555) 123-4567',
    businessEmail: tenant?.settings?.email_from || 'hello@parkbus.ca',
    businessAddress: '123 Adventure Street, Calgary, AB T2P 1A1',
    website: 'https://parkbus.ca',
    timezone: tenant?.settings?.timezone || 'America/Vancouver',
    currency: tenant?.settings?.currency || 'CAD',
    
    // Booking Settings
    advanceBookingDays: 90,
    cancellationPolicy: '24 hours',
    refundPolicy: 'full',
    minimumBookingNotice: 2,
    maxPassengersPerBooking: 10,
    requirePhoneNumber: true,
    requirePickupLocation: true,
    autoConfirmBookings: false,
    
    // Payment Settings
    acceptCreditCards: true,
    acceptPayPal: true,
    acceptBankTransfer: false,
    depositRequired: true,
    depositPercentage: 25,
    paymentTerms: 'immediate',
    
    // Notification Settings
    emailNewBookings: true,
    emailCancellations: true,
    emailReminders: true,
    smsNotifications: false,
    webhookUrl: '',
    
    // Operational Settings
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    operatingHours: { start: '08:00', end: '18:00' },
    seasonalOperation: false,
    seasonStart: '',
    seasonEnd: '',
    
    // Customer Settings
    allowGuestBookings: true,
    requireAccountCreation: false,
    loyaltyProgram: false,
    customerRatingSystem: true,
    publicReviews: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  const timezones = [
    'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 
    'America/Toronto', 'America/Halifax', 'America/St_Johns'
  ];

  const currencies = ['CAD', 'USD', 'EUR', 'GBP'];

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleOperatingDayChange = (day: string, checked: boolean) => {
    const newDays = checked 
      ? [...settings.operatingDays, day]
      : settings.operatingDays.filter(d => d !== day);
    handleChange('operatingDays', newDays);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-1">Configure your business operations and preferences</p>
        </div>
        <button 
          disabled={!hasChanges}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unsaved Changes - Don't forget to save!
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Business Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <textarea
                value={settings.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {currencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Booking Configuration
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking (days)</label>
                <input
                  type="number"
                  value={settings.advanceBookingDays}
                  onChange={(e) => handleChange('advanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Notice (hours)</label>
                <input
                  type="number"
                  value={settings.minimumBookingNotice}
                  onChange={(e) => handleChange('minimumBookingNotice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
              <select
                value={settings.cancellationPolicy}
                onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="24 hours">24 hours before departure</option>
                <option value="48 hours">48 hours before departure</option>
                <option value="72 hours">72 hours before departure</option>
                <option value="1 week">1 week before departure</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requirePhoneNumber}
                  onChange={(e) => handleChange('requirePhoneNumber', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Require phone number for bookings</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoConfirmBookings}
                  onChange={(e) => handleChange('autoConfirmBookings', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Auto-confirm bookings</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowGuestBookings}
                  onChange={(e) => handleChange('allowGuestBookings', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Allow guest bookings (no account required)</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.acceptCreditCards}
                    onChange={(e) => handleChange('acceptCreditCards', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Credit/Debit Cards</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.acceptPayPal}
                    onChange={(e) => handleChange('acceptPayPal', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">PayPal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.acceptBankTransfer}
                    onChange={(e) => handleChange('acceptBankTransfer', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Bank Transfer</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <select
                  value={settings.paymentTerms}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="immediate">Pay immediately</option>
                  <option value="departure">Pay at departure</option>
                  <option value="deposit">Deposit + balance</option>
                </select>
              </div>
              {settings.paymentTerms === 'deposit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit %</label>
                  <input
                    type="number"
                    value={settings.depositPercentage}
                    onChange={(e) => handleChange('depositPercentage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNewBookings}
                    onChange={(e) => handleChange('emailNewBookings', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">New bookings</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailCancellations}
                    onChange={(e) => handleChange('emailCancellations', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Cancellations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailReminders}
                    onChange={(e) => handleChange('emailReminders', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Trip reminders</span>
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">SMS notifications</span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="p-4 border-orange-200 bg-orange-50">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
          <div>
            <h4 className="font-medium text-orange-900">Important Security Notice</h4>
            <p className="text-sm text-orange-700 mt-1">
              Some settings may require verification or approval from our support team for security reasons.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 