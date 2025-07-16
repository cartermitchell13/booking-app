'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, CreditCard, TrendingUp, AlertCircle, Calendar, DollarSign, MapPin } from 'lucide-react';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalBookings: number;
  monthlyRevenue: number;
  pendingApprovals: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
  });
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        // Load tenants data
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (tenantsError) {
          console.error('Error loading tenants:', tenantsError);
          throw new Error(`Failed to load tenants: ${tenantsError.message}`);
        }

        // Calculate basic stats
        const totalTenants = tenants?.length || 0;
        const activeTenants = tenants?.filter(t => t.subscription_status === 'active').length || 0;

        // For now, we'll use mock data for bookings and revenue
        // In a real implementation, these would come from actual booking/payment tables
        const totalBookings = Math.floor(Math.random() * 1000) + 500;
        const monthlyRevenue = Math.floor(Math.random() * 50000) + 25000;
        const pendingApprovals = Math.floor(Math.random() * 10);

        setStats({
          totalTenants,
          activeTenants,
          totalBookings,
          monthlyRevenue,
          pendingApprovals,
        });

        setRecentTenants(tenants?.slice(0, 5) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load dashboard</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of all tenants and platform metrics.
          </p>
        </div>
        <Badge 
          variant="default"
          className="text-sm"
        >
          Super Admin Access
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
              <p className="text-sm text-green-600 mt-1">{stats.activeTenants} active</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-green-600 mt-1">+15% from last month</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+20% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              <p className="text-sm text-yellow-600 mt-1">Require attention</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tenants</h3>
            <a href="/admin/tenants" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {recentTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-600">@{tenant.slug}</p>
                    <p className="text-xs text-gray-500">{new Date(tenant.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={tenant.subscription_plan === 'enterprise' ? 'default' : 'secondary'}
                    className="text-xs mb-1"
                  >
                    {tenant.subscription_plan}
                  </Badge>
                  <div>
                    <Badge 
                      variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tenant.subscription_status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Platform Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Platform Activity</h3>
            <a href="/admin/support" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">New Support Ticket</p>
                  <p className="text-sm text-gray-600">Payment integration issue</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  High Priority
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Tenant Registration</p>
                  <p className="text-sm text-gray-600">Rocky Mountain Tours signed up</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Plan Upgrade</p>
                  <p className="text-sm text-gray-600">ParkBus upgraded to Enterprise</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <Badge variant="default" className="text-xs">
                  Revenue
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 