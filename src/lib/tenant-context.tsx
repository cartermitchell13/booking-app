'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Tenant, TenantContextType } from '@/types';
import { supabase } from './supabase';
import { getContrastingTextColor } from './utils';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // Get mock tenant data for development
  const getMockTenantData = useCallback((slug: string): Tenant => {
    console.log(`[TenantContext] Creating mock tenant data for slug: ${slug}`);
    
    // Return mock data based on slug
    if (slug === 'parkbus') {
      return {
        id: '20ee5f83-1019-46c7-9382-05a6f1ded9bf', // Real tenant ID from database
        slug: 'parkbus',
        name: 'ParkBus',
        domain: undefined,
        domain_verified: false,
        branding: {
          primary_color: '#21452e',
          accent_color: '#637752',
          background_color: '#f9f7f1',
          foreground_color: '#faf6e1',
          secondary_color: '#637752',
          logo_url: '/images/black-pb-logo.png',
          font_family: 'Custom Font',
          custom_font_family: 'CultivatedMindTrueNorth',
          custom_font_name: 'Cultivated Mind - True North.otf',
          custom_font_url: 'https://zsdkqmlhnffoidwyygce.supabase.co/storage/v1/object/public/tenant-assets/fonts/20ee5f83-1019-46c7-9382-05a6f1ded9bf/1751218694875-CultivatedMind-TrueNorth.otf'
        },
        settings: {
          timezone: 'America/Vancouver',
          currency: 'CAD',
          email_from: 'bookings@parkbus.ca'
        },
        subscription_plan: 'enterprise',
        subscription_status: 'active',
        trial_ends_at: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    // Generic mock tenant for unknown slugs
    return {
      id: `mock-${slug}-id`,
      slug: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      domain: undefined,
      domain_verified: false,
      branding: {
        primary_color: '#3B82F6',
        accent_color: '#1D4ED8',
        background_color: '#FFFFFF',
        foreground_color: '#111827',
        secondary_color: '#1D4ED8',
        logo_url: undefined,
        font_family: 'Inter'
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        email_from: `bookings@${slug}.com`
      },
      subscription_plan: 'starter',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }, []);

  // Detect tenant from current domain/subdomain with middleware header support
  const detectTenant = useCallback(async (): Promise<Tenant | null> => {
    try {
      // Get hostname without port number
      const hostname = window.location.hostname;
      
      // Parse subdomain from hostname  
      const parts = hostname.split('.');
      const subdomain = parts.length > 1 ? parts[0] : null;
      
      console.log(`[TenantContext] Detecting tenant for hostname: ${hostname}, parts: ${JSON.stringify(parts)}, subdomain: ${subdomain}`);
      
      // For development with .localhost subdomains
      if (hostname.includes('localhost')) {
        let tenantSlug = null; // No default fallback - use null for generic branding
        
        // Check for subdomain (e.g., parkbus.localhost:3000)
        if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'localhost') {
          tenantSlug = subdomain;
          console.log(`[TenantContext] Using subdomain: ${tenantSlug}`);
        } else {
          // Check for tenant parameter in URL for backward compatibility
          const urlParams = new URLSearchParams(window.location.search);
          const tenantParam = urlParams.get('tenant');
          if (tenantParam) {
            tenantSlug = tenantParam;
            console.log(`[TenantContext] Using URL parameter: ${tenantSlug}`);
          }
        }
        
        // If no tenant slug found, return null for generic branding
        if (!tenantSlug) {
          console.log(`[TenantContext] No tenant slug found, returning null for generic branding`);
          return null;
        }
        
        try {
          console.log(`[TenantContext] Attempting database query for tenantSlug: ${tenantSlug}`);
          
          // Add a small delay to ensure connection is ready (debug page works perfectly)
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Create a timeout promise (increased to 5 seconds to match working debug)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
          });
          
          // Create the database query promise
          const queryPromise = supabase
            .from('tenants')
            .select('*')
            .eq('slug', tenantSlug)
            .single();
          
          // Race the query against the timeout
          const result = await Promise.race([queryPromise, timeoutPromise]);
          const { data, error } = result as any;
          
          console.log(`[TenantContext] Database query completed:`, { data, error });
        
          if (error) {
            console.log(`[TenantContext] Database error, using mock data:`, error.message);
            return getMockTenantData(tenantSlug);
          }
          
          if (data) {
            console.log(`[TenantContext] Found tenant in database: ${data.name}`);
            return data;
          } else {
            console.log(`[TenantContext] No tenant found in database, using mock data for: ${tenantSlug}`);
            return getMockTenantData(tenantSlug);
          }
        } catch (dbError) {
          console.warn(`[TenantContext] Database query failed, using mock tenant for: ${tenantSlug}`, dbError);
          return getMockTenantData(tenantSlug);
        }
      }

      // For production with custom domains
      try {
        // Check if this is a custom domain (like booking.parkbus.com)
        // Enhanced logic: Look for tenants where the hostname matches either:
        // 1. Their exact custom domain (booking.parkbus.com)  
        // 2. Or contains their root domain (parkbus.com) as custom subdomain
        const { data: customDomainData, error: customError } = await supabase
          .from('tenants')
          .select('*')
          .or(`domain.eq.${hostname},domain.eq.${hostname.split('.').slice(1).join('.')}`)
          .eq('domain_verified', true)
          .single();

        if (!customError && customDomainData) {
          console.log('[TenantContext] Found tenant via custom domain:', customDomainData.name);
          return customDomainData;
        }

        // Fallback to platform subdomain detection (like parkbus.yourplatform.com)
        if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
          const { data: subdomainData, error: subdomainError } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', subdomain)
            .single();

          if (!subdomainError && subdomainData) {
            console.log('[TenantContext] Found tenant via platform subdomain:', subdomainData.name);
            return subdomainData;
          }
        }

        // Try the RPC function as last resort
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_tenant_by_domain', { domain_input: hostname });

        if (!rpcError && rpcData && rpcData.length > 0) {
          console.log('[TenantContext] Found tenant via RPC function:', rpcData[0].name);
          return rpcData[0];
        }

        console.warn(`[TenantContext] No tenant found for hostname: ${hostname}`);
        return null;
      } catch (err) {
        console.warn('[TenantContext] Error in tenant detection:', err);
        return null;
      }
    } catch (err) {
      console.error('[TenantContext] Error detecting tenant:', err);
      // Return mock tenant as last resort - check for subdomain or default to parkbus
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      if (hostname.includes('localhost')) {
        const parts = hostname.split('.');
        const subdomain = parts.length > 1 ? parts[0] : null;
        const tenantSlug = (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'localhost') ? subdomain : 'parkbus';
        return getMockTenantData(tenantSlug);
      }
      return getMockTenantData('parkbus');
    }
  }, [getMockTenantData]);

  // Load tenant on mount and on path change
  useEffect(() => {
    if (!initialTenant) {
      const loadTenant = async () => {
        setIsLoading(true);
        setError(undefined);
        
        try {
          // Ensure we're fully client-side and DOM is ready
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.log('[TenantContext] Not ready - window or document undefined');
            return;
          }
          
          // Small delay to ensure everything is initialized
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const detectedTenant = await detectTenant();
          if (detectedTenant) {
            setTenant(detectedTenant);
          } else {
            setError('Tenant not found for this domain');
          }
        } catch (err) {
          console.error('[TenantContext] Error loading tenant:', err);
          setError(err instanceof Error ? err.message : 'Failed to load tenant');
        } finally {
          setIsLoading(false);
        }
      };

      loadTenant();
    }
  }, [initialTenant, detectTenant]); // Remove pathname dependency to prevent reloading on navigation

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
  const refreshTenant = useCallback(async () => {
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
  }, [tenant]);

  const value: TenantContextType = {
    tenant,
    isLoading,
    error,
    switchTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      <BrandingApplier tenant={tenant} />
      {children}
    </TenantContext.Provider>
  );
}
// Hook to get tenant-aware Supabase client
export function useTenantSupabase() {
  const { tenant } = useTenant();
  
  // Helper method to query trips for current tenant with optional search filters
  const getTrips = useCallback(async (filters?: {
    origin?: string;
    destination?: string;
    dateFrom?: string;
    dateTo?: string;
    passengers?: number;
    searchQuery?: string;
  }) => {
    try {
      // Build the query with filters
      let query = supabase
        .from('trips')
        .select('*')
        .eq('status', 'active');
      
      // Add tenant filter if we have a tenant context
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      // Add search filters
      if (filters?.origin) {
        query = query.ilike('departure_location', `%${filters.origin}%`);
      }
      
      if (filters?.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('departure_time', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('departure_time', filters.dateTo);
      }
      
      if (filters?.passengers) {
        query = query.gte('available_seats', filters.passengers);
      }
      
      if (filters?.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,destination.ilike.%${filters.searchQuery}%`);
      }
      
      // Execute query with ordering
      const { data, error } = await query.order('departure_time', { ascending: true });
      
      if (error) throw error;
      
      // If no trips found for this tenant, try without tenant filter for development
      if ((!data || data.length === 0) && tenant?.id) {
        console.log('No trips found for tenant, trying without tenant filter for development...');
        
        // Build query again without tenant filter
        let fallbackQuery = supabase
          .from('trips')
          .select('*')
          .eq('status', 'active');
        
        // Add search filters (same as above)
        if (filters?.origin) {
          fallbackQuery = fallbackQuery.ilike('departure_location', `%${filters.origin}%`);
        }
        
        if (filters?.destination) {
          fallbackQuery = fallbackQuery.ilike('destination', `%${filters.destination}%`);
        }
        
        if (filters?.dateFrom) {
          fallbackQuery = fallbackQuery.gte('departure_time', filters.dateFrom);
        }
        
        if (filters?.dateTo) {
          fallbackQuery = fallbackQuery.lte('departure_time', filters.dateTo);
        }
        
        if (filters?.passengers) {
          fallbackQuery = fallbackQuery.gte('available_seats', filters.passengers);
        }
        
        if (filters?.searchQuery) {
          fallbackQuery = fallbackQuery.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,destination.ilike.%${filters.searchQuery}%`);
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery.order('departure_time', { ascending: true });
        
        if (fallbackError) throw fallbackError;
        
        console.log('Fallback query found trips:', fallbackData?.length || 0);
        return fallbackData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      
      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes('JWT')) {
          throw new Error('Authentication failed - please refresh the page');
        } else if (error.message.includes('policy')) {
          throw new Error('Access denied - please check your permissions');
        } else if (error.message.includes('network')) {
          throw new Error('Network error - please check your connection');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
      
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

  // Helper method to get unique locations from products
  const getLocations = useCallback(async () => {
    try {
      // Query products table for current tenant
      let query = supabase
        .from('products')
        .select('name, location, product_data')
        .eq('status', 'active');
      
      // Add tenant filter if we have a tenant context
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      const { data: products, error } = await query;
      
      if (error) throw error;
      
      console.log('Found products:', products?.length || 0);
      
      // Extract unique departure locations from products (not destination names)
      const allLocationNames = new Set<string>();
      
      products?.forEach(product => {
        // Add location from the new location column (primary source for departure locations)
        if (product.location && product.location.trim()) {
          allLocationNames.add(product.location.trim());
        }
        
        // Add departure location from product_data (fallback)
        if (product.product_data?.departure_location && product.product_data.departure_location.trim()) {
          allLocationNames.add(product.product_data.departure_location.trim());
        }
        
        // Add pickup locations from product_data (specific pickup points)
        if (product.product_data?.pickup_locations && Array.isArray(product.product_data.pickup_locations)) {
          product.product_data.pickup_locations.forEach((pickup: any) => {
            if (pickup.name && pickup.name.trim()) {
              allLocationNames.add(pickup.name.trim());
            }
          });
        }
      });
      
      // Create location objects with consistent structure and unique IDs
      const locations = Array.from(allLocationNames).map((locationName, index) => ({
        id: `location-${index}`,
        name: locationName,
        slug: locationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        city: locationName, // For compatibility with LocationSelect component
        province: '', // Could be enhanced with province detection
        latitude: 0, // Could be enhanced with geocoding
        longitude: 0,
        created_at: new Date().toISOString()
      }));
      
      // Sort locations alphabetically
      locations.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('getLocations returning:', locations);
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
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
  
  // Helper method to get products with instances (real data from new system)
  const getProducts = useCallback(async () => {
    if (!tenant?.id) {
      console.log('No tenant ID, returning empty array');
      return [];
    }

    console.log('Loading products for tenant:', tenant.id, tenant.name);

    try {
      // For mock tenant ID, use the real ParkBus tenant ID
      const actualTenantId = tenant.id === 'mock-parkbus-id' 
        ? '20ee5f83-1019-46c7-9382-05a6f1ded9bf' 
        : tenant.id;

      console.log('Using actual tenant ID:', actualTenantId);

      // Get products with their available instances for this tenant
      // Note: RLS temporarily disabled for development
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          product_instances (
            id,
            start_time,
            end_time,
            max_quantity,
            available_quantity
          )
        `)
        .eq('tenant_id', actualTenantId)
        .order('created_at', { ascending: false });

      // Enhanced error handling
      if (error) {
        console.error('Supabase query error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          data: error
        });
        
        // Check if it's an RLS/auth error
        if (error.message?.includes('policy')) {
          console.error('RLS Policy error - user may not be authenticated or policy is blocking access');
        }
        
        throw error;
      }

      console.log(`Successfully loaded ${products?.length || 0} products`);
      
      if (!products || products.length === 0) {
        console.warn('No products found for tenant:', actualTenantId);
        return [];
      }

            // Transform products to match the TenantTrip interface
      const transformed = products.map(product => ({
        id: product.id,
        tenant_id: actualTenantId,
        title: product.name,
        description: product.description || '',
        location: product.location || product.product_data?.departure_location || 'Location',
        destination: product.name, // The product name IS the destination
        departure_location: product.location || product.product_data?.departure_location || 'Departure Location',
        departure_time: product.product_instances?.[0]?.start_time || new Date().toISOString(),
        return_time: product.product_instances?.[0]?.end_time,
        price_adult: product.base_price,
        price_child: Math.round(product.base_price * 0.7), // 30% discount for children
        max_passengers: product.product_instances?.reduce((total: number, instance: any) => 
          total + (instance.max_quantity || 0), 0) || 50,
        available_seats: product.product_instances?.reduce((total: number, instance: any) => 
          total + (instance.available_quantity || 0), 0) || 0,
        image_url: product.image_url,
        highlights: product.product_data?.highlights || [],
        included_items: product.product_data?.what_included || [],
        destination_lat: product.product_data?.destination_lat || product.product_data?.destination_info?.latitude || 0,
        destination_lng: product.product_data?.destination_lng || product.product_data?.destination_info?.longitude || 0,
        departure_lat: 0,
        departure_lng: 0,
        status: 'active' as const,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));

      console.log('Transformed products:', transformed);
      return transformed;

    } catch (error: any) {
      // Enhanced error logging
      console.error('Error fetching products:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        tenantId: tenant?.id,
        tenantName: tenant?.name
      });
      
      // Try to determine error type
      if (error?.message?.includes('JWT')) {
        console.error('JWT/Authentication error - check if user is properly authenticated');
      } else if (error?.message?.includes('policy')) {
        console.error('RLS Policy error - check database policies and tenant context');
      } else if (error?.message?.includes('permission')) {
        console.error('Permission error - check user roles and database permissions');
      } else if (error?.code === 'PGRST116') {
        console.error('PostgREST error - likely RLS policy blocking access');
      }
      
      throw error;
    }
  }, [tenant, supabase]);

  // Helper method to get single product by ID (for booking page)
  const getProductById = useCallback(async (productId: string) => {
    if (!tenant?.id) {
      console.log('No tenant ID, returning null');
      return null;
    }

    console.log('Loading product by ID:', productId, 'for tenant:', tenant.id, tenant.name);

    try {
      // For mock tenant ID, use the real ParkBus tenant ID
      const actualTenantId = tenant.id === 'mock-parkbus-id' 
        ? '20ee5f83-1019-46c7-9382-05a6f1ded9bf' 
        : tenant.id;

      console.log('Using actual tenant ID:', actualTenantId);

      // Get single product with its instances
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_instances (
            id,
            start_time,
            end_time,
            max_quantity,
            available_quantity
          )
        `)
        .eq('id', productId)
        .eq('tenant_id', actualTenantId)
        .single();

      if (error) {
        console.error('Error fetching product by ID:', error);
        throw error;
      }

      if (!product) {
        console.warn('Product not found:', productId);
        return null;
      }

      // Transform single product to match TenantTrip interface
      const transformed = {
        id: product.id,
        tenant_id: actualTenantId,
        title: product.name,
        description: product.description || '',
        destination: product.product_data?.departure_location || 'Destination',
        departure_location: product.product_data?.departure_location || 'Departure Location',
        departure_time: product.product_instances?.[0]?.start_time || new Date().toISOString(),
        return_time: product.product_instances?.[0]?.end_time,
        price_adult: product.base_price,
        price_child: Math.round(product.base_price * 0.7), // 30% discount for children
        max_passengers: product.product_instances?.reduce((total: number, instance: any) => 
          total + (instance.max_quantity || 0), 0) || 50,
        available_seats: product.product_instances?.reduce((total: number, instance: any) => 
          total + (instance.available_quantity || 0), 0) || 0,
        image_url: product.image_url,
        highlights: product.product_data?.highlights || [],
        included_items: product.product_data?.what_included || [],
        destination_lat: product.product_data?.destination_lat || product.product_data?.destination_info?.latitude || 0,
        destination_lng: product.product_data?.destination_lng || product.product_data?.destination_info?.longitude || 0,
        departure_lat: 0,
        departure_lng: 0,
        status: 'active' as const,
        created_at: product.created_at,
        updated_at: product.updated_at
      };

      console.log('Successfully loaded product:', transformed);
      return transformed;

    } catch (error: any) {
      console.error('Error fetching product by ID:', {
        error,
        message: error?.message,
        productId,
        tenantId: tenant?.id
      });
      return null;
    }
  }, [tenant, supabase]);

  return {
    supabase,
    tenantId: tenant?.id,
    getTrips,
    getTripById,
    getLocations,
    createBooking,
    getProducts, // New function for real product data
    getProductById, // New function for single product lookup
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
    if (branding.accent_color) {
      root.style.setProperty('--tenant-accent', branding.accent_color);
    }
    if (branding.background_color) {
      root.style.setProperty('--tenant-background', branding.background_color);
    }
    if (branding.foreground_color) {
      root.style.setProperty('--tenant-foreground', branding.foreground_color);
    }
    // Legacy support
    if (branding.secondary_color) {
      root.style.setProperty('--tenant-secondary', branding.secondary_color);
    }
    // Font family is handled by BrandingApplier component to avoid conflicts
    // with custom font loading logic
    
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
  
  const branding = tenant?.branding || {};
  
  // Helper function to get optimal text color for any background
  const getOptimalTextColor = (backgroundColor?: string) => {
    return getContrastingTextColor(backgroundColor || '#FFFFFF');
  };
  
  // Helper function to get heading font weight class
  const getHeadingWeight = () => {
    const weight = branding.heading_font_weight || 
                   (branding.prefer_light_headings ? 'semibold' : 'bold');
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-bold';
    }
  };
  
  return {
    ...branding,
    // Helper functions
    getOptimalTextColor,
    getHeadingWeight,
    headingWeightClass: getHeadingWeight(),
    textOnForeground: getOptimalTextColor(branding.foreground_color),
    textOnBackground: getOptimalTextColor(branding.background_color),
    textOnPrimary: getOptimalTextColor(branding.primary_color),
    textOnAccent: getOptimalTextColor(branding.accent_color),
  };
}

// Apply branding styles to the document
const BrandingApplier: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  useEffect(() => {
    if (tenant?.branding) {
      const root = document.documentElement;
      const branding = tenant.branding;
      
      console.log('🎨 Applying tenant branding:', {
        tenantName: tenant.name,
        fontFamily: branding.font_family,
        customFontFamily: branding.custom_font_family,
        customFontUrl: branding.custom_font_url,
        customFontName: branding.custom_font_name
      });
      
      // Apply color CSS variables
      root.style.setProperty('--tenant-primary', branding.primary_color || '#10B981');
      root.style.setProperty('--tenant-accent', branding.accent_color || '#059669');
      root.style.setProperty('--tenant-background', branding.background_color || '#FFFFFF');
      root.style.setProperty('--tenant-foreground', branding.foreground_color || '#111827');
      root.style.setProperty('--tenant-secondary', branding.secondary_color || '#059669'); // Legacy support
      
      // Apply font weight preference for headings
      const headingWeight = branding.heading_font_weight || 
                           (branding.prefer_light_headings ? 'semibold' : 'bold');
      
      // Map to CSS font-weight values for direct CSS usage
      const cssWeightMap: Record<string, string> = {
        'normal': '400',
        'medium': '500', 
        'semibold': '600',
        'bold': '700'
      };
      
      root.style.setProperty('--tenant-heading-weight', headingWeight);
      root.style.setProperty('--tenant-heading-weight-value', cssWeightMap[headingWeight] || '700');
      console.log('🎨 Setting heading font weight:', headingWeight);
      
      // Handle font family - use custom font if available, otherwise use selected font
      let fontFamily = branding.font_family || 'Inter';
      
      // If custom font is configured, use it
      if (branding.font_family === 'Custom Font' && branding.custom_font_family && branding.custom_font_url) {
        fontFamily = `'${branding.custom_font_family}', 'Inter', sans-serif`;
        console.log('🔤 Using custom font:', fontFamily);
        
        // Generate custom font CSS
        const existingStyle = document.getElementById('tenant-custom-font-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Detect font format from URL
        const url = branding.custom_font_url;
        let format = 'opentype'; // default
        if (url.includes('.woff2')) format = 'woff2';
        else if (url.includes('.woff')) format = 'woff';
        else if (url.includes('.ttf')) format = 'truetype';
        else if (url.includes('.otf')) format = 'opentype';
        
        const style = document.createElement('style');
        style.id = 'tenant-custom-font-style';
        style.textContent = `
          @font-face {
            font-family: '${branding.custom_font_family}';
            src: url('${branding.custom_font_url}') format('${format}');
            font-display: swap;
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
        
        console.log('🔤 Added custom font CSS:', style.textContent);
        
        // Test if font loads successfully
        const testDiv = document.createElement('div');
        testDiv.style.fontFamily = `'${branding.custom_font_family}', monospace`;
        testDiv.style.position = 'absolute';
        testDiv.style.visibility = 'hidden';
        testDiv.style.fontSize = '100px';
        testDiv.innerHTML = 'Test';
        document.body.appendChild(testDiv);
        
        // Check if font loaded after a brief delay
        setTimeout(() => {
          const computedStyle = window.getComputedStyle(testDiv);
          const actualFont = computedStyle.fontFamily;
          console.log('🔤 Font loading test:', {
            expected: branding.custom_font_family,
            actual: actualFont,
            loaded: actualFont.includes(branding.custom_font_family || '')
          });
          document.body.removeChild(testDiv);
        }, 100);
        
      } else {
        // Remove custom font style if no custom font is set
        const existingStyle = document.getElementById('tenant-custom-font-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Use standard font with proper fallbacks
        if (fontFamily === 'Inter') fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        else if (fontFamily === 'Roboto') fontFamily = "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        else if (fontFamily === 'Open Sans') fontFamily = "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        else if (fontFamily === 'Poppins') fontFamily = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        else if (fontFamily === 'Montserrat') fontFamily = "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        
        console.log('🔤 Using standard font:', fontFamily);
      }
      
      root.style.setProperty('--tenant-font', fontFamily);
      console.log('🔤 Set --tenant-font CSS variable to:', fontFamily);
      
      // Apply custom CSS if provided
      if (branding.custom_css) {
        const existingCustomCSS = document.getElementById('tenant-custom-css');
        if (existingCustomCSS) {
          existingCustomCSS.remove();
        }
        
        const customStyle = document.createElement('style');
        customStyle.id = 'tenant-custom-css';
        customStyle.textContent = branding.custom_css;
        document.head.appendChild(customStyle);
      }
    }
  }, [tenant]);

  return null;
}; 
