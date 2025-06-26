'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    if (!tenant) return;
    
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
  
  // Helper method to query trips for current tenant
  const getTrips = useCallback(async () => {
    try {
      // For development and customer-facing pages, get all active trips
      // We'll filter by tenant in the UI layer
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      
      // If we have a tenant context, filter trips for that tenant
      // Otherwise return all trips (for multi-tenant browsing scenarios)
      if (tenant?.id) {
        return data?.filter(trip => trip.tenant_id === tenant.id) || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      // If there's an error (like RLS blocking), fall back to mock data
      console.warn('Falling back to mock trip data due to error:', error);
      return [
        {
          id: '1',
          tenant_id: tenant?.id || 'mock-tenant',
          title: 'Banff National Park Adventure',
          description: 'Experience the stunning beauty of Banff National Park with comfortable transportation and expert guides.',
          destination: 'Banff',
          departure_location: 'Calgary',
          departure_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          return_time: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
          price_adult: 12000,
          price_child: 8000,
          max_passengers: 45,
          available_seats: 38,
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          highlights: ['Lake Louise visit', 'Moraine Lake photo stop', 'Wildlife viewing'],
          included_items: ['Transportation', 'Professional guide', 'Park entry fees'],
          destination_lat: 51.1784, // Banff townsite coordinates
          destination_lng: -115.5708,
          departure_lat: 51.0447, // Calgary coordinates
          departure_lng: -114.0719,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          tenant_id: tenant?.id || 'mock-tenant',
          title: 'Jasper Wilderness Tour',
          description: 'Discover the untamed wilderness of Jasper National Park on this unforgettable journey.',
          destination: 'Jasper',
          departure_location: 'Edmonton',
          departure_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          return_time: new Date(Date.now() + 56 * 60 * 60 * 1000).toISOString(),
          price_adult: 14000,
          price_child: 9500,
          max_passengers: 40,
          available_seats: 35,
          image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
          highlights: ['Maligne Lake cruise', 'Columbia Icefield', 'Hot springs visit', 'Mountain wildlife'],
          included_items: ['Transportation', 'Professional guide', 'Boat cruise', 'Park entry fees', 'Hot springs access'],
          destination_lat: 52.8737, // Jasper townsite coordinates
          destination_lng: -118.0814,
          departure_lat: 53.5461, // Edmonton coordinates
          departure_lng: -113.4938,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          tenant_id: tenant?.id || 'mock-tenant',
          title: 'Vancouver Food Walking Tour',
          description: 'Explore Vancouver\'s best food spots on foot with a local guide.',
          destination: 'Vancouver',
          departure_location: 'Gastown',
          departure_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          return_time: new Date(Date.now() + 75 * 60 * 60 * 1000).toISOString(),
          price_adult: 4500,
          price_child: 3000,
          max_passengers: 20,
          available_seats: 12,
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          highlights: ['Local food tastings', 'Historic Gastown', 'Granville Market visit', 'Cultural insights'],
          included_items: ['Professional guide', 'Food tastings', 'Walking tour'],
          destination_lat: 49.2827, // Vancouver coordinates
          destination_lng: -123.1207,
          departure_lat: 49.2827, // Same as destination for walking tour
          departure_lng: -123.1207,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          tenant_id: tenant?.id || 'mock-tenant',
          title: 'Tofino Coastal Adventure',
          description: 'Experience the rugged beauty of Vancouver Island\'s west coast.',
          destination: 'Tofino',
          departure_location: 'Victoria',
          departure_time: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
          return_time: new Date(Date.now() + 106 * 60 * 60 * 1000).toISOString(),
          price_adult: 16500,
          price_child: 11000,
          max_passengers: 32,
          available_seats: 28,
          image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          highlights: ['Long Beach surfing', 'Hot Springs Cove', 'Whale watching', 'Ancient rainforest'],
          included_items: ['Transportation', 'Professional guide', 'Park entry fees', 'Equipment rental'],
          destination_lat: 49.1535, // Tofino coordinates
          destination_lng: -125.9065,
          departure_lat: 48.4284, // Victoria coordinates
          departure_lng: -123.3656,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  }, [tenant?.id]);
  
  // Helper method to get trip by ID for current tenant
  const getTripById = useCallback(async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      
      // If we have a tenant context, verify the trip belongs to this tenant
      if (tenant?.id && data?.tenant_id !== tenant.id) {
        console.warn('Trip does not belong to current tenant');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching trip by ID:', error);
      return null;
    }
  }, [tenant?.id]);
  
  // Helper method to create booking for current tenant
  const createBooking = useCallback(async (bookingData: any) => {
    if (!tenant) throw new Error('No tenant context');
    
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
  }, [tenant?.id]);
  
  return {
    supabase,
    tenantId: tenant?.id,
    getTrips,
    getTripById,
    createBooking,
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
