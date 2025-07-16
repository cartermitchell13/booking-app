'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { PageLoading } from '@/components/ui';
import { 
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  Download,
  Trash2,
  Key
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email_verified: boolean;
  created_at: string;
}

interface SecurityActivity {
  id: string;
  type: 'login' | 'password_change' | 'profile_update';
  device: string;
  location: string;
  timestamp: string;
  ip_address: string;
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    email_notifications: true,
    login_alerts: true,
    marketing_emails: false,
    account_activity_emails: true
  });

  // Mock security activity data - in real app, this would come from API
  const [securityActivity] = useState<SecurityActivity[]>([
    {
      id: '1',
      type: 'login',
      device: 'iPhone 15 Pro',
      location: 'Toronto, ON',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      ip_address: '192.168.1.100'
    },
    {
      id: '2',
      type: 'profile_update',
      device: 'MacBook Pro',
      location: 'Toronto, ON',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      ip_address: '192.168.1.101'
    },
    {
      id: '3',
      type: 'login',
      device: 'Chrome Browser',
      location: 'Vancouver, BC',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      ip_address: '10.0.0.1'
    }
  ]);

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      if (!supabase) {
        router.push('/login?redirect=/account/security');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?redirect=/account/security');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .single();

        if (userError || !userData) {
          router.push('/login?redirect=/account/security');
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Auth/profile check error:', err);
        router.push('/login?redirect=/account/security');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [router, tenant?.id]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) {
        setErrorMessage('Failed to update password. Please try again.');
        console.error('Password update error:', error);
      } else {
        setSuccessMessage('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to update password. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // In a real app, this would update user preferences in the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccessMessage('Security preferences updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage('Failed to update security preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getActivityIcon = (type: SecurityActivity['type']) => {
    switch (type) {
      case 'login':
        return <Smartphone className="h-5 w-5" />;
      case 'password_change':
        return <Key className="h-5 w-5" />;
      case 'profile_update':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: SecurityActivity['type']) => {
    switch (type) {
      case 'login':
        return tenant?.branding?.primary_color || '#10B981';
      case 'password_change':
        return tenant?.branding?.accent_color || '#059669';
      case 'profile_update':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading security settings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center min-w-0 flex-1">
              <Link
                href="/account"
                className="mr-3 sm:mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Back to account"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Security & Privacy</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">Manage your account security and privacy settings</p>
              </div>
            </div>
            {user && (
              <div className="hidden sm:block text-sm text-gray-600 ml-4">
                <Shield className="h-4 w-4 inline mr-1" />
                Secure Account
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-green-800 font-medium leading-relaxed">{successMessage}</div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-red-800 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Password Security */}
            <div className="bg-white shadow-lg rounded-xl border-2" style={{ borderColor: tenant?.branding?.accent_color || '#059669' }}>
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2" style={{ color: tenant?.branding?.primary_color || '#10B981' }} />
                  Password Security
                </h3>
                <p className="text-sm text-gray-600 mt-1">Keep your account secure with a strong password</p>
              </div>
              <form onSubmit={handlePasswordUpdate} className="p-4 sm:p-6 space-y-5">
                <div>
                  <label htmlFor="current_password" className="block text-base sm:text-sm font-semibold text-gray-900 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="current_password"
                      name="current_password"
                      autoComplete="current-password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="block w-full min-h-[48px] pr-12 pl-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                      style={{ '--tw-ring-color': tenant?.branding?.primary_color || '#10B981' } as any}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[48px] min-w-[48px] focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-lg"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-base sm:text-sm font-semibold text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new_password"
                      name="new_password"
                      autoComplete="new-password"
                      required
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="block w-full min-h-[48px] pr-12 pl-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                      style={{ '--tw-ring-color': tenant?.branding?.primary_color || '#10B981' } as any}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[48px] min-w-[48px] focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-lg"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-base sm:text-sm font-semibold text-gray-900 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_password"
                      name="confirm_password"
                      autoComplete="new-password"
                      required
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="block w-full min-h-[48px] pr-12 pl-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                      style={{ '--tw-ring-color': tenant?.branding?.primary_color || '#10B981' } as any}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[48px] min-w-[48px] focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-lg"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex justify-center items-center min-h-[48px] px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: tenant?.branding?.primary_color || '#10B981',
                    '--tw-ring-color': tenant?.branding?.primary_color || '#10B981'
                  } as any}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Privacy Preferences */}
            <div className="bg-white shadow-lg rounded-xl border-2" style={{ borderColor: tenant?.branding?.accent_color || '#059669' }}>
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" style={{ color: tenant?.branding?.accent_color || '#059669' }} />
                  Privacy Preferences
                </h3>
                <p className="text-sm text-gray-600 mt-1">Control how we communicate with you</p>
              </div>
              <form onSubmit={handleSecuritySettingsUpdate} className="p-4 sm:p-6 space-y-5">
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive booking confirmations and updates' },
                    { key: 'login_alerts', label: 'Login Alerts', desc: 'Get notified of new device logins' },
                    { key: 'account_activity_emails', label: 'Account Activity', desc: 'Security and account change notifications' },
                    { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Promotional offers and newsletters' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 pt-1">
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            securitySettings[setting.key as keyof typeof securitySettings] 
                              ? 'bg-blue-600' 
                              : 'bg-gray-200'
                          }`}
                          style={{ 
                            backgroundColor: securitySettings[setting.key as keyof typeof securitySettings] 
                              ? tenant?.branding?.primary_color || '#10B981' 
                              : '#E5E7EB',
                            '--tw-ring-color': tenant?.branding?.primary_color || '#10B981'
                          } as any}
                          onClick={() => setSecuritySettings(prev => ({
                            ...prev,
                            [setting.key]: !prev[setting.key as keyof typeof prev]
                          }))}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              securitySettings[setting.key as keyof typeof securitySettings] 
                                ? 'translate-x-6' 
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-base font-semibold text-gray-900 cursor-pointer">
                          {setting.label}
                        </label>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {setting.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex justify-center items-center min-h-[48px] px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: tenant?.branding?.accent_color || '#059669',
                    '--tw-ring-color': tenant?.branding?.accent_color || '#059669'
                  } as any}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Saving Preferences...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      Save Preferences
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-white shadow-lg rounded-xl border-2" style={{ borderColor: tenant?.branding?.accent_color || '#059669' }}>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" style={{ color: tenant?.branding?.primary_color || '#10B981' }} />
                Recent Security Activity
              </h3>
              <p className="text-sm text-gray-600 mt-1">Monitor your account activity for security</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {securityActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-4 p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div 
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                    >
                      <div style={{ color: getActivityColor(activity.type) }}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900 capitalize">
                          {activity.type.replace('_', ' ')}
                        </p>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          Device: {activity.device}
                        </p>
                        <p className="text-sm text-gray-600">
                          Location: {activity.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          IP: {activity.ip_address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Security Actions</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Activity Log
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 border-2 border-red-300 rounded-lg text-sm font-semibold text-red-700 hover:border-red-400 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Suspicious Activity
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Data & Privacy */}
          <div className="bg-white shadow-lg rounded-xl border-2" style={{ borderColor: tenant?.branding?.accent_color || '#059669' }}>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2" style={{ color: tenant?.branding?.accent_color || '#059669' }} />
                Data & Privacy
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manage your data and account privacy</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 rounded-lg border-2 border-gray-100">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Download Your Data</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Get a copy of all your personal data and account information
                    </p>
                  </div>
                  <button className="min-h-[44px] px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Request
                  </button>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg border-2 border-red-100">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button className="min-h-[44px] px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 