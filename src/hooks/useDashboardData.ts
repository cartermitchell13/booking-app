import { useState, useEffect, useCallback, useRef } from 'react'
import { useTenant, useTenantSupabase } from '@/lib/tenant-context'

interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  activeProducts: number;
  totalCustomers: number;
  averageRating: number;
  recentBookings: Array<{
    id: string;
    customerName: string;
    productName: string;
    date: string;
    amount: number;
    status: string;
  }>;
  upcomingInstances: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
    capacity: number;
    booked: number;
    location: string;
  }>;
}

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false) // Prevent multiple simultaneous loads
  const cacheRef = useRef<{ tenantId: string; data: DashboardMetrics; timestamp: number } | null>(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProducts, supabase } = useTenantSupabase()

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!tenant?.id || !supabase || loadingRef.current) return

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && cacheRef.current && cacheRef.current.tenantId === tenant.id) {
      const cacheAge = Date.now() - cacheRef.current.timestamp
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached dashboard data, age:', Math.round(cacheAge / 1000), 'seconds')
        setMetrics(cacheRef.current.data)
        setLoading(false)
        setError(null)
        return
      }
    }

    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)

      // For mock tenant ID, use the real ParkBus tenant ID
      const actualTenantId = tenant.id === 'mock-parkbus-id' 
        ? '20ee5f83-1019-46c7-9382-05a6f1ded9bf' 
        : tenant.id

      // Fetch products with timeout protection
      const products = await getProducts()
      
      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          products!inner (
            name,
            product_instances (
              start_time,
              end_time
            )
          )
        `)
        .eq('tenant_id', actualTenantId)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
      }

      // Calculate metrics
      const totalBookings = bookings?.length || 0
      const totalRevenue = bookings?.reduce((sum, booking) => 
        booking.status !== 'cancelled' ? sum + (booking.total_amount || 0) : sum, 0
      ) || 0
      const activeProducts = products?.filter((p: any) => p.status === 'active').length || 0
      
      // Get unique customers
      const uniqueCustomers = new Set(bookings?.map(b => b.user_id).filter(Boolean)).size

      // Format recent bookings
      const recentBookings = (bookings || []).slice(0, 5).map(booking => ({
        id: booking.booking_reference || booking.id,
        customerName: booking.customer_name || 'Guest Customer',
        productName: booking.products?.name || 'Unknown Product',
        date: new Date(booking.created_at).toLocaleDateString(),
        amount: (booking.total_amount || 0) / 100, // Convert from cents
        status: booking.status || 'pending'
      }))

      // Get upcoming product instances
      const { data: upcomingInstances, error: instancesError } = await supabase
        .from('product_instances')
        .select(`
          *,
          products!inner (
            name,
            tenant_id
          )
        `)
        .eq('products.tenant_id', actualTenantId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5)

      if (instancesError) {
        console.error('Error fetching instances:', instancesError)
      }

      const formattedUpcoming = (upcomingInstances || []).map(instance => ({
        id: instance.id,
        name: instance.products?.name || 'Unknown Product',
        date: new Date(instance.start_time).toLocaleDateString(),
        time: new Date(instance.start_time).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        capacity: instance.max_quantity || 0,
        booked: (instance.max_quantity || 0) - (instance.available_quantity || 0),
        location: 'Location TBD' // Could be enhanced with location data
      }))

      const dashboardData: DashboardMetrics = {
        totalBookings,
        totalRevenue: totalRevenue / 100, // Convert from cents
        activeProducts,
        totalCustomers: uniqueCustomers,
        averageRating: 4.8, // Could be calculated from reviews if available
        recentBookings,
        upcomingInstances: formattedUpcoming
      }

      // Cache the successful result
      cacheRef.current = {
        tenantId: tenant.id,
        data: dashboardData,
        timestamp: Date.now()
      }
      console.log('Cached dashboard data for tenant:', tenant.id)

      setMetrics(dashboardData)

    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      
      // If we have cached data, use it instead of showing error
      if (cacheRef.current && cacheRef.current.tenantId === tenant.id) {
        console.log('Dashboard error, using cached data instead')
        setMetrics(cacheRef.current.data)
        setError(null) // Don't show error if we have cached data
      } else {
        setError(err.message || 'Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [tenant, getProducts, supabase])

  // Only load dashboard data once per tenant, unless explicitly refreshed
  useEffect(() => {
    if (tenantLoading || !tenant?.id || !supabase) return
    
    // Check if we already have data for this tenant
    if (cacheRef.current && cacheRef.current.tenantId === tenant.id) {
      const cacheAge = Date.now() - cacheRef.current.timestamp
      if (cacheAge < CACHE_DURATION) {
        console.log('Tenant unchanged, using existing cached dashboard data')
        setMetrics(cacheRef.current.data)
        setLoading(false)
        setError(null)
        return
      }
    }
    
    loadDashboardData()
  }, [tenantLoading, tenant?.id, supabase]) // Only depend on tenant ID, not the full tenant object

  return {
    metrics,
    loading,
    error,
    tenantLoading,
    refetch: () => loadDashboardData(true) // Force refresh when manually called
  }
}
