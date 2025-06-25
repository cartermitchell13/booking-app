'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, MoreHorizontal, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
        let tenantsData = [];
        try {
          const { data, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

          if (tenantsError) {
            // If tenants table doesn't exist, create mock data for demo
            if (tenantsError.code === 'PGRST116' || tenantsError.message.includes('relation')) {
              console.warn('Tenants table not found, using mock data for admin demo');
              tenantsData = [
                {
                  id: 'mock-parkbus-id',
                  name: 'ParkBus',
                  slug: 'parkbus',
                  domain: 'booking.parkbus.ca',
                  subscription_plan: 'enterprise',
                  subscription_status: 'active',
                  created_at: new Date().toISOString(),
                  branding: {
                    primary_color: '#10B981',
                    logo_url: '/images/black-pb-logo.png',
                  },
                  settings: {
                    timezone: 'America/Vancouver',
                    currency: 'CAD',
                  }
                },
                {
                  id: 'mock-rocky-id',
                  name: 'Rocky Mountain Tours',
                  slug: 'rockymountain',
                  domain: 'book.rockymountaintours.com',
                  subscription_plan: 'professional',
                  subscription_status: 'active',
                  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  branding: {
                    primary_color: '#DC2626',
                  },
                  settings: {
                    timezone: 'America/Denver',
                    currency: 'USD',
                  }
                },
                {
                  id: 'mock-adventure-id',
                  name: 'Adventure Bus Co',
                  slug: 'adventurebus',
                  subscription_plan: 'starter',
                  subscription_status: 'trial',
                  created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                  branding: {
                    primary_color: '#7C3AED',
                  },
                  settings: {
                    timezone: 'America/New_York',
                    currency: 'USD',
                  }
                }
              ];
            } else {
              throw tenantsError;
            }
          } else {
            tenantsData = data || [];
          }
        } catch (dbError) {
          console.warn('Database error, using mock tenants:', dbError);
          tenantsData = [
            {
              id: 'mock-parkbus-id',
              name: 'ParkBus',
              slug: 'parkbus',
              domain: 'booking.parkbus.ca',
              subscription_plan: 'enterprise',
              subscription_status: 'active',
              created_at: new Date().toISOString(),
              branding: {
                primary_color: '#10B981',
                logo_url: '/images/black-pb-logo.png',
              },
              settings: {
                timezone: 'America/Vancouver',
                currency: 'CAD',
              }
            }
          ];
        }
        setTenants(tenantsData);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600 mt-2">Manage all platform tenants and their configurations</p>
        </div>
        <Link
          href="/admin/tenants/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tenant
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tenants by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredTenants.length} of {tenants.length} tenants
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {tenant.branding?.logo_url ? (
                      <img 
                        src={tenant.branding.logo_url} 
                        alt={`${tenant.name} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>@{tenant.slug}</CardDescription>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status and Plan */}
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(tenant.subscription_status)}>
                  {tenant.subscription_status}
                </Badge>
                <Badge variant={getPlanBadgeVariant(tenant.subscription_plan)}>
                  {tenant.subscription_plan}
                </Badge>
              </div>

              {/* Domain */}
              {tenant.domain && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Domain:</span> {tenant.domain}
                </div>
              )}

              {/* Tenant Settings */}
              <div className="text-sm text-gray-600 space-y-1">
                {tenant.settings?.timezone && (
                  <div><span className="font-medium">Timezone:</span> {tenant.settings.timezone}</div>
                )}
                {tenant.settings?.currency && (
                  <div><span className="font-medium">Currency:</span> {tenant.settings.currency}</div>
                )}
              </div>

              {/* Created Date */}
              <div className="text-xs text-gray-500">
                Created {new Date(tenant.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Link
                  href={`/admin/tenants/${tenant.id}`}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Link>
                <Link
                  href={`https://${tenant.slug}.yourdomain.com`}
                  target="_blank"
                  className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Visit
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No tenants found' : 'No tenants yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first tenant'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/admin/tenants/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Tenant
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 font-medium">Error loading tenants</div>
            <div className="text-gray-500 text-sm mt-1">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 