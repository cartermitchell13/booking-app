'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tenant, TenantContextType } from '@/types';
import { supabase } from './supabase';

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: undefined,
});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: React.ReactNode;
  initialTenant?: Tenant;
}

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null);
  const [isLoading, setIsLoading] = useState(!initialTenant);
  const [error, setError] = useState<string>();

  // Detect tenant from current domain/subdomain
  const detectTenant = async (): Promise<Tenant | null> => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured - using default ParkBus tenant');
        // Return mock ParkBus tenant for development
        return {
          id: 'mock-parkbus-id',
          slug: 'parkbus',
          name: 'ParkBus',
          branding: {
            primary_color: '#10B981',
            secondary_color: '#059669',
            logo_url: '/images/black-pb-logo.png',
            font_family: 'Inter'
          },
          settings: {
            timezone: 'America/Vancouver',
            currency: 'CAD',
            email_from: 'bookings@parkbus.ca'
          },
          subscription_plan: 'enterprise' as const,
          subscription_status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const hostname = window.location.hostname;
      
      // For development or admin routes, try to get tenant data, but fallback gracefully
      if (hostname === 'localhost' || hostname.includes('localhost')) {
        try {
          // First, check if tenants table exists by trying a simple query
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', 'parkbus')
            .single();
        
          if (error) {
            // If error is about missing table or RLS, return mock data
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('RLS')) {
              console.warn('Tenants table not found or RLS not configured, using mock data');
              return {
                id: 'mock-parkbus-id',
                slug: 'parkbus',
                name: 'ParkBus',
                branding: {
                  primary_color: '#10B981',
                  secondary_color: '#059669',
                  logo_url: '/images/black-pb-logo.png',
                  font_family: 'Inter'
                },
                settings: {
                  timezone: 'America/Vancouver',
                  currency: 'CAD',
                  email_from: 'bookings@parkbus.ca'
                },
                subscription_plan: 'enterprise' as const,
                subscription_status: 'active' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            throw error;
          }
          return data;
        } catch (dbError) {
          console.warn('Database query failed, using mock tenant:', dbError);
          return {
            id: 'mock-parkbus-id',
            slug: 'parkbus',
            name: 'ParkBus',
            branding: {
              primary_color: '#10B981',
              secondary_color: '#059669',
              logo_url: '/images/black-pb-logo.png',
              font_family: 'Inter'
            },
            settings: {
              timezone: 'America/Vancouver',
              currency: 'CAD',
              email_from: 'bookings@parkbus.ca'
            },
            subscription_plan: 'enterprise' as const,
            subscription_status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }

      // For production, try domain-based detection
      try {
        const { data, error } = await supabase
          .rpc('get_tenant_by_domain', { domain_input: hostname });

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
      } catch (rpcError) {
        console.warn('RPC function not found, trying direct query');
        
        // Fallback to direct table query
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .or(`domain.eq.${hostname},slug.eq.${hostname.split('.')[0]}`)
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error detecting tenant:', err);
      // Return mock tenant as last resort
      return {
        id: 'mock-parkbus-id',
        slug: 'parkbus',
        name: 'ParkBus',
        branding: {
          primary_color: '#10B981',
          secondary_color: '#059669',
          logo_url: '/images/black-pb-logo.png',
          font_family: 'Inter'
        },
        settings: {
          timezone: 'America/Vancouver',
          currency: 'CAD',
          email_from: 'bookings@parkbus.ca'
        },
        subscription_plan: 'enterprise' as const,
        subscription_status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  };

  // Load tenant on mount
  useEffect(() => {
    if (!initialTenant) {
      const loadTenant = async () => {
        setIsLoading(true);
        setError(undefined);
        
        try {
          const detectedTenant = await detectTenant();
          if (detectedTenant) {
            setTenant(detectedTenant);
          } else {
            setError('Tenant not found for this domain');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load tenant');
        } finally {
          setIsLoading(false);
        }
      };

      loadTenant();
    }
  }, [initialTenant]);

  // Switch tenant (for super admin use)
  const switchTenant = async (tenantId: string) => {
    if (!supabase) {
      setError('Database not configured');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      setTenant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch tenant');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh current tenant
  const refreshTenant = async () => {
    if (!tenant || !supabase) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant.id)
        .single();

      if (error) throw error;
      setTenant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const value: TenantContextType = {
    tenant,
    isLoading,
    error,
    switchTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// Hook to get tenant-aware Supabase client
export function useTenantSupabase() {
  const { tenant } = useTenant();
  
  // This could be enhanced to automatically add tenant_id to all queries
  // For now, we'll manually include tenant_id in queries
  return {
    supabase,
    tenantId: tenant?.id,
    
    // Helper method to query trips for current tenant
    getTrips: async () => {
      if (!tenant) throw new Error('No tenant context');
      if (!supabase) throw new Error('Database not configured');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    
    // Helper method to get trip by ID for current tenant
    getTripById: async (tripId: string) => {
      if (!tenant) throw new Error('No tenant context');
      if (!supabase) throw new Error('Database not configured');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // Helper method to create booking for current tenant
    createBooking: async (bookingData: any) => {
      if (!tenant) throw new Error('No tenant context');
      if (!supabase) throw new Error('Database not configured');
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          tenant_id: tenant.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  };
}

// Utility function to apply tenant branding
export function useTenantBranding() {
  const { tenant } = useTenant();
  
  useEffect(() => {
    if (!tenant?.branding) return;
    
    const root = document.documentElement;
    const branding = tenant.branding;
    
    // Apply CSS custom properties for theming
    if (branding.primary_color) {
      root.style.setProperty('--tenant-primary', branding.primary_color);
    }
    if (branding.secondary_color) {
      root.style.setProperty('--tenant-secondary', branding.secondary_color);
    }
    if (branding.font_family) {
      root.style.setProperty('--tenant-font', branding.font_family);
    }
    
    // Apply custom CSS if provided
    if (branding.custom_css) {
      const styleElement = document.createElement('style');
      styleElement.textContent = branding.custom_css;
      styleElement.id = 'tenant-custom-css';
      
      // Remove existing custom CSS
      const existingStyle = document.getElementById('tenant-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(styleElement);
    }
    
    // Update favicon if provided
    if (branding.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon_url;
      }
    }
    
    return () => {
      // Cleanup on unmount
      const customStyle = document.getElementById('tenant-custom-css');
      if (customStyle) {
        customStyle.remove();
      }
    };
  }, [tenant?.branding]);
  
  return tenant?.branding || {};
} 