'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, Calendar, Building } from 'lucide-react';

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

  const filteredSubscriptions = subscriptions.filter(sub => 
    statusFilter === 'all' || sub.status === statusFilter
  );

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
    return filteredSubscriptions.reduce((sum, sub) => sum + sub.monthly_revenue, 0);
  };

  const getAverageRevenue = () => {
    const total = getTotalRevenue();
    return filteredSubscriptions.length > 0 ? total / filteredSubscriptions.length : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Monitor billing and subscription status across all tenants</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(getAverageRevenue()).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per tenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter(s => s.status === 'trial').length} in trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'past_due' || s.status === 'suspended').length}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="text-sm text-gray-500">
              {filteredSubscriptions.length} subscriptions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            Billing details and subscription status for all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Usage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Next Billing</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{subscription.tenant_name}</p>
                          <p className="text-sm text-gray-500">@{subscription.tenant_slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getPlanBadgeVariant(subscription.plan)}>
                        {formatPlan(subscription.plan)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(subscription.status)}>
                        {formatStatus(subscription.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">${subscription.monthly_revenue}</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <span className="font-medium">{subscription.bookings_this_month}</span>
                        {subscription.bookings_limit && (
                          <span className="text-gray-500"> / {subscription.bookings_limit}</span>
                        )}
                        <div className="text-gray-500">bookings</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium">{subscription.transaction_fee_percent}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
              <p className="text-gray-500">Try adjusting your filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 font-medium">Error loading subscriptions</div>
            <div className="text-gray-500 text-sm mt-1">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 