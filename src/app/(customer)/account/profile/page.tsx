'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { PageLoading } from '@/components/ui';
import { 
  User,
  Mail,
  Phone,
  Lock,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
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

export default function ProfilePage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      if (!supabase) {
        router.push('/login?redirect=/account/profile');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?redirect=/account/profile');
          return;
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .single();

        if (userError || !userData) {
          router.push('/login?redirect=/account/profile');
          return;
        }

        setUser(userData);
        setProfileData({
          first_name: userData.first_name || 'John',
          last_name: userData.last_name || 'Doe',
          email: userData.email || 'john.doe@example.com',
          phone: userData.phone || '+1 (555) 123-4567'
        });

      } catch (err) {
        console.error('Auth/profile check error:', err);
        router.push('/login?redirect=/account/profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [router, tenant?.id]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone || null
        })
        .eq('id', user.id)
        .eq('tenant_id', tenant?.id);

      if (error) {
        setErrorMessage('Failed to update profile. Please try again.');
        console.error('Profile update error:', error);
      } else {
        setSuccessMessage('Profile updated successfully!');
        setUser(prev => prev ? { ...prev, ...profileData } : null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Update password in Supabase Auth
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
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to update password. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <PageLoading message="Loading your profile..." />;
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Profile Settings</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">Manage your personal information and security</p>
              </div>
            </div>
            {user && (
              <div className="hidden sm:block text-sm text-gray-600 ml-4">
                {user.first_name} {user.last_name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-green-800 font-medium leading-relaxed">{successMessage}</div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-red-800 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
            
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                </div>
                <form onSubmit={handleProfileUpdate} className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        autoComplete="given-name"
                        inputMode="text"
                        required
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                        className="block w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                        style={{ 
                          borderColor: profileData.first_name ? (tenant?.branding?.primary_color || '#10B981') : ''
                        }}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        autoComplete="family-name"
                        inputMode="text"
                        required
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                        className="block w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                        style={{ 
                          borderColor: profileData.last_name ? (tenant?.branding?.primary_color || '#10B981') : ''
                        }}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="block w-full min-h-[48px] pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                        style={{ 
                          borderColor: profileData.email ? (tenant?.branding?.primary_color || '#10B981') : ''
                        }}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
                      Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        pattern="[+]?[\d\s\(\)\-]+"
                        className="block w-full min-h-[48px] pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200"
                        style={{ 
                          borderColor: profileData.phone ? (tenant?.branding?.primary_color || '#10B981') : ''
                        }}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto inline-flex justify-center items-center min-h-[48px] px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        backgroundColor: tenant?.branding?.primary_color || '#10B981'
                      }}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-3" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Change */}
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </h3>
                </div>
                <form onSubmit={handlePasswordUpdate} className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="current_password" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
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
                      <label htmlFor="new_password" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
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
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-900 mb-2 sm:mb-1">
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
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full sm:w-auto inline-flex justify-center items-center min-h-[48px] px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: tenant?.branding?.primary_color || '#10B981' }}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-3" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Account Information Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.created_at && formatDate(user.created_at)}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Need help with your account? Contact our{' '}
                    <Link href="/help" className="font-medium" style={{ color: tenant?.branding?.primary_color || '#10B981' }}>
                      support team
                    </Link>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Link
                    href="/account/bookings"
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">View Booking History</div>
                    <div className="text-xs text-gray-500 mt-1">See all your past and upcoming trips</div>
                  </Link>
                  
                  <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900">Download Data</div>
                    <div className="text-xs text-gray-500 mt-1">Export your account information</div>
                  </button>
                  
                  <button className="w-full text-left p-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                    <div className="text-sm font-medium text-red-900">Delete Account</div>
                    <div className="text-xs text-red-500 mt-1">Permanently remove your account</div>
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