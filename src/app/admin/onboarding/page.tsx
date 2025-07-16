'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  Clock, 
  CheckCircle, 
  Building, 
  Mail,
  Calendar,
  ArrowRight,
  Edit,
  Eye,
  Trash2,
  AlertCircle,
  Play
} from 'lucide-react';

interface OnboardingApplication {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string;
  phone?: string;
  business_type: 'tour_operator' | 'transportation' | 'activities' | 'rentals' | 'other';
  company_size: 'startup' | 'small' | 'medium' | 'enterprise';
  monthly_bookings_estimate: number;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'setup_in_progress' | 'completed';
  submitted_at: string;
  reviewed_at?: string;
  reviewer?: string;
  notes?: string;
  trial_requested: boolean;
  plan_preference: 'starter' | 'professional' | 'enterprise';
}

interface OnboardingStats {
  pending_applications: number;
  approved_this_month: number;
  average_approval_time_hours: number;
  conversion_rate: number;
}

export default function OnboardingPage() {
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [stats, setStats] = useState<OnboardingStats>({
    pending_applications: 0,
    approved_this_month: 0,
    average_approval_time_hours: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        // Mock onboarding application data
        const mockApplications: OnboardingApplication[] = [
          {
            id: 'app_1',
            company_name: 'Sunshine Tours',
            contact_email: 'sarah@sunshinetours.com',
            contact_name: 'Sarah Mitchell',
            phone: '+1-555-0123',
            business_type: 'tour_operator',
            company_size: 'small',
            monthly_bookings_estimate: 150,
            status: 'pending',
            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            trial_requested: true,
            plan_preference: 'professional',
          },
          {
            id: 'app_2',
            company_name: 'Metro Shuttle Services',
            contact_email: 'admin@metroshuttle.com',
            contact_name: 'David Chen',
            phone: '+1-555-0456',
            business_type: 'transportation',
            company_size: 'medium',
            monthly_bookings_estimate: 500,
            status: 'reviewing',
            submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: 'Admin Team',
            trial_requested: false,
            plan_preference: 'enterprise',
          },
          {
            id: 'app_3',
            company_name: 'Adventure Gear Rentals',
            contact_email: 'owner@adventuregear.com',
            contact_name: 'Lisa Rodriguez',
            business_type: 'rentals',
            company_size: 'startup',
            monthly_bookings_estimate: 75,
            status: 'approved',
            submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: 'Admin Team',
            notes: 'Great fit for our platform. Approved for Professional plan with 14-day trial.',
            trial_requested: true,
            plan_preference: 'professional',
          },
          {
            id: 'app_4',
            company_name: 'Harbor Cruise Lines',
            contact_email: 'info@harborcruise.com',
            contact_name: 'Michael Thompson',
            phone: '+1-555-0789',
            business_type: 'tour_operator',
            company_size: 'enterprise',
            monthly_bookings_estimate: 1200,
            status: 'setup_in_progress',
            submitted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: 'Admin Team',
            notes: 'Large enterprise client. Setting up custom Enterprise plan.',
            trial_requested: false,
            plan_preference: 'enterprise',
          },
          {
            id: 'app_5',
            company_name: 'Budget Tours Inc',
            contact_email: 'contact@budgettours.com',
            contact_name: 'James Wilson',
            business_type: 'tour_operator',
            company_size: 'small',
            monthly_bookings_estimate: 50,
            status: 'rejected',
            submitted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: 'Admin Team',
            notes: 'Business model not aligned with our platform requirements.',
            trial_requested: true,
            plan_preference: 'starter',
          }
        ];

        setApplications(mockApplications);

        // Calculate stats
        const pending = mockApplications.filter(app => app.status === 'pending').length;
        const approvedThisMonth = mockApplications.filter(app => 
          app.status === 'approved' || app.status === 'setup_in_progress' || app.status === 'completed'
        ).length;
        
        setStats({
          pending_applications: pending,
          approved_this_month: approvedThisMonth,
          average_approval_time_hours: 24,
          conversion_rate: 75,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load onboarding data');
      } finally {
        setLoading(false);
      }
    };

    loadOnboardingData();
  }, [supabase]);

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewing': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'setup_in_progress': return 'secondary';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatBusinessType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatCompanySize = (size: string) => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  const handleStatusChange = (applicationId: string, newStatus: OnboardingApplication['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: newStatus, 
            reviewed_at: new Date().toISOString(),
            reviewer: 'Admin Team'
          }
        : app
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Tenant Onboarding</h1>
            <p className="text-gray-600 mt-2">Manage new tenant applications and setup process</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Setup
          </button>
        </div>

        {/* Onboarding Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-gray-900">{stats.pending_applications}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved This Month</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-gray-900">{stats.approved_this_month}</div>
              <p className="text-xs text-gray-500 mt-1">New tenants</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Approval Time</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-gray-900">{stats.average_approval_time_hours}h</div>
              <p className="text-xs text-gray-500 mt-1">Average processing</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-gray-900">{stats.conversion_rate}%</div>
              <p className="text-xs text-gray-500 mt-1">Application to tenant</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="setup_in_progress">Setup In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="text-sm text-gray-500">
                {filteredApplications.length} applications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Onboarding Applications</CardTitle>
            <CardDescription className="text-gray-600">
              Manage tenant registration applications and setup process
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Company</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Contact</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Business Details</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Plan</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Submitted</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{application.company_name}</p>
                            <p className="text-sm text-gray-500">
                              {formatBusinessType(application.business_type)} • {formatCompanySize(application.company_size)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{application.contact_name}</p>
                          <p className="text-sm text-gray-500">{application.contact_email}</p>
                          {application.phone && (
                            <p className="text-sm text-gray-500">{application.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p><span className="font-medium text-gray-900">{application.monthly_bookings_estimate}</span> <span className="text-gray-500">bookings/month</span></p>
                          {application.trial_requested && (
                            <p className="text-blue-600 font-medium">Trial requested</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="font-medium">
                          {application.plan_preference.charAt(0).toUpperCase() + application.plan_preference.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {formatStatus(application.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedApplication(application)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(application.id, 'approved')}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(application.id, 'rejected')}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {application.status === 'approved' && (
                            <button 
                              onClick={() => handleStatusChange(application.id, 'setup_in_progress')}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Start Setup"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">Try adjusting your filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedApplication.company_name}</h2>
                  <button 
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-700">Name:</span> {selectedApplication.contact_name}</p>
                      <p><span className="font-medium text-gray-700">Email:</span> {selectedApplication.contact_email}</p>
                      {selectedApplication.phone && <p><span className="font-medium text-gray-700">Phone:</span> {selectedApplication.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Business Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-700">Type:</span> {formatBusinessType(selectedApplication.business_type)}</p>
                      <p><span className="font-medium text-gray-700">Size:</span> {formatCompanySize(selectedApplication.company_size)}</p>
                      <p><span className="font-medium text-gray-700">Monthly Bookings:</span> {selectedApplication.monthly_bookings_estimate}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Application Status</h3>
                  <div className="flex items-center space-x-4">
                    <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                      {formatStatus(selectedApplication.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(selectedApplication.submitted_at).toLocaleDateString()}
                    </span>
                    {selectedApplication.reviewed_at && (
                      <span className="text-sm text-gray-500">
                        Reviewed: {new Date(selectedApplication.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {selectedApplication.notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm">{selectedApplication.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => {
                          handleStatusChange(selectedApplication.id, 'rejected');
                          setSelectedApplication(null);
                        }}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => {
                          handleStatusChange(selectedApplication.id, 'approved');
                          setSelectedApplication(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <button 
                      onClick={() => {
                        handleStatusChange(selectedApplication.id, 'setup_in_progress');
                        setSelectedApplication(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Setup
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-red-600 font-medium mb-2">Error loading onboarding data</div>
              <div className="text-gray-500 text-sm">{error}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 