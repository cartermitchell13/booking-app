'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, MoreHorizontal, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { GeistSans } from 'geist/font/sans';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  branding?: {
    primary_color?: string;
    logo_url?: string;
  };
  settings?: {
    timezone?: string;
    currency?: string;
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadTenants = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (tenantsError) {
          console.error('Error loading tenants:', tenantsError);
          throw new Error(`Failed to load tenants: ${tenantsError.message}`);
        }

        setTenants(tenantsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenants');
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [supabase]);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'suspended': return 'destructive';
      case 'cancelled': return 'outline';
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
            <h1 className="text-2xl font-semibold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform tenants and their configurations</p>
          </div>
          <Link
            href="/admin/tenants/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Tenant
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tenants by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredTenants.length} of {tenants.length} tenants
            </div>
          </div>
        </Card>

        {/* Tenants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      {tenant.branding?.logo_url ? (
                        <img 
                          src={tenant.branding.logo_url} 
                          alt={`${tenant.name} logo`}
                          className="w-8 h-8 object-contain rounded"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                      <p className="text-sm text-gray-500">@{tenant.slug}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Plan Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(tenant.subscription_status)}>
                    {tenant.subscription_status}
                  </Badge>
                  <Badge variant={getPlanBadgeVariant(tenant.subscription_plan)}>
                    {tenant.subscription_plan}
                  </Badge>
                </div>

                {/* Domain Info */}
                {tenant.domain && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Domain:</span> {tenant.domain}
                    </p>
                  </div>
                )}

                {/* Settings Info */}
                {(tenant.settings?.timezone || tenant.settings?.currency) && (
                  <div className="space-y-1">
                    {tenant.settings?.timezone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Timezone:</span> {tenant.settings.timezone}
                      </p>
                    )}
                    {tenant.settings?.currency && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Currency:</span> {tenant.settings.currency}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {new Date(tenant.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Tenant"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Tenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <Card className="p-12 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No tenants match your search criteria.' : 'Get started by creating your first tenant.'}
            </p>
            <Link
              href="/admin/tenants/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
} 