'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, Calendar, Building, Search, Filter } from 'lucide-react';
import { GeistSans } from 'geist/font/sans';

interface SubscriptionData {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  current_period_start: string;
  current_period_end: string;
  monthly_revenue: number;
  transaction_fee_percent: number;
  bookings_this_month: number;
  bookings_limit?: number;
  created_at: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        // Mock subscription data for demo
        const mockSubscriptions: SubscriptionData[] = [
          {
            id: 'sub_1',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            tenant_slug: 'parkbus',
            plan: 'enterprise',
            status: 'active',
            current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            monthly_revenue: 999,
            transaction_fee_percent: 2,
            bookings_this_month: 847,
            created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sub_2',
            tenant_id: 'mock-rocky-id',
            tenant_name: 'Rocky Mountain Tours',
            tenant_slug: 'rockymountain',
            plan: 'professional',
            status: 'active',
            current_period_start: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
            monthly_revenue: 299,
            transaction_fee_percent: 3,
            bookings_this_month: 234,
            bookings_limit: 1000,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sub_3',
            tenant_id: 'mock-adventure-id',
            tenant_name: 'Adventure Bus Co',
            tenant_slug: 'adventurebus',
            plan: 'starter',
            status: 'trial',
            current_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            monthly_revenue: 0,
            transaction_fee_percent: 5,
            bookings_this_month: 23,
            bookings_limit: 100,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sub_4',
            tenant_id: 'mock-demo-id',
            tenant_name: 'Demo Tours Inc',
            tenant_slug: 'demotours',
            plan: 'professional',
            status: 'past_due',
            current_period_start: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            monthly_revenue: 299,
            transaction_fee_percent: 3,
            bookings_this_month: 156,
            bookings_limit: 1000,
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ];

        setSubscriptions(mockSubscriptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [supabase]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      sub.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tenant_slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'past_due': return 'destructive';
      case 'cancelled': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'starter': return 'outline';
      default: return 'secondary';
    }
  };

  const formatPlan = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTotalRevenue = () => {
    return subscriptions.reduce((sum, sub) => sum + sub.monthly_revenue, 0);
  };

  const getAverageRevenue = () => {
    const total = getTotalRevenue();
    return subscriptions.length > 0 ? total / subscriptions.length : 0;
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'active').length;
  };

  const getTrialSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'trial').length;
  };

  const getDaysUntilPeriodEnd = (periodEnd: string) => {
    const endDate = new Date(periodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard ${GeistSans.className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard ${GeistSans.className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Monitor billing and subscription status across all tenants</p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">${getTotalRevenue().toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total MRR</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">${Math.round(getAverageRevenue()).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Average Revenue</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{getActiveSubscriptions()}</p>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{getTrialSubscriptions()}</p>
                <p className="text-sm text-gray-600">Trial Subscriptions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subscriptions by tenant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </Card>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.tenant_name}</h3>
                      <p className="text-sm text-gray-500">@{subscription.tenant_slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPlanBadgeVariant(subscription.plan)}>
                      {formatPlan(subscription.plan)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(subscription.status)}>
                      {formatStatus(subscription.status)}
                    </Badge>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">${subscription.monthly_revenue}</p>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">{subscription.bookings_this_month}</p>
                    <p className="text-sm text-gray-600">Bookings This Month</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">{subscription.transaction_fee_percent}%</p>
                    <p className="text-sm text-gray-600">Transaction Fee</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">
                      {getDaysUntilPeriodEnd(subscription.current_period_end)}
                    </p>
                    <p className="text-sm text-gray-600">Days Until Renewal</p>
                  </div>
                </div>

                {/* Billing Period */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Billing Period</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                  </div>
                </div>

                {/* Usage Limits (if applicable) */}
                {subscription.bookings_limit && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Booking Usage</span>
                    </div>
                    <div className="text-sm text-amber-800">
                      {subscription.bookings_this_month} / {subscription.bookings_limit} bookings
                      ({Math.round((subscription.bookings_this_month / subscription.bookings_limit) * 100)}% used)
                    </div>
                  </div>
                )}

                {/* Warning for past due */}
                {subscription.status === 'past_due' && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Payment is overdue. Subscription may be suspended soon.
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {filteredSubscriptions.length === 0 && (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No subscriptions match your current filters.'
                  : 'No subscriptions have been created yet.'
                }
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 