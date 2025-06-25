'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

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
        let tenants = [];
        try {
          const { data: tenantsData, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

          if (tenantsError) {
            // If tenants table doesn't exist, create mock data for demo
            if (tenantsError.code === 'PGRST116' || tenantsError.message.includes('relation')) {
              console.warn('Tenants table not found, using mock data for admin demo');
              tenants = [
                {
                  id: 'mock-parkbus-id',
                  name: 'ParkBus',
                  slug: 'parkbus',
                  subscription_plan: 'enterprise',
                  subscription_status: 'active',
                  created_at: new Date().toISOString(),
                },
                {
                  id: 'mock-rocky-id',
                  name: 'Rocky Mountain Tours',
                  slug: 'rockymountain',
                  subscription_plan: 'professional',
                  subscription_status: 'active',
                  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: 'mock-adventure-id',
                  name: 'Adventure Bus Co',
                  slug: 'adventurebus',
                  subscription_plan: 'starter',
                  subscription_status: 'trial',
                  created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                }
              ];
            } else {
              throw tenantsError;
            }
          } else {
            tenants = tenantsData || [];
          }
        } catch (dbError) {
          console.warn('Database error, using mock tenants:', dbError);
          tenants = [
            {
              id: 'mock-parkbus-id',
              name: 'ParkBus',
              slug: 'parkbus',
              subscription_plan: 'enterprise',
              subscription_status: 'active',
              created_at: new Date().toISOString(),
            }
          ];
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Failed to load dashboard</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of all tenants and platform metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTenants} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tenants</CardTitle>
          <CardDescription>
            Latest tenant registrations and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-gray-500">@{tenant.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'}
                  >
                    {tenant.subscription_plan}
                  </Badge>
                  <Badge 
                    variant={tenant.subscription_status === 'active' ? 'default' : 'destructive'}
                  >
                    {tenant.subscription_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 