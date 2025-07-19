import { useState, useEffect, useCallback, useRef } from 'react'
import { useTenant, useTenantSupabase } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'

export function useTrips() {
  const [trips, setTrips] = useState<TenantTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const loadingRef = useRef(false) // Prevent multiple simultaneous loads
  const cacheRef = useRef<{ tenantId: string; data: TenantTrip[]; timestamp: number } | null>(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProducts } = useTenantSupabase()

  // Load trips from database (using new products system)
  const loadTrips = useCallback(async (forceRefresh = false) => {
    if (!tenant || loadingRef.current) return

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && cacheRef.current && cacheRef.current.tenantId === tenant.id) {
      const cacheAge = Date.now() - cacheRef.current.timestamp
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached trip data, age:', Math.round(cacheAge / 1000), 'seconds')
        setTrips(cacheRef.current.data)
        setLoading(false)
        setError(undefined)
        return
      }
    }

    try {
      loadingRef.current = true
      setLoading(true)
      setError(undefined)
      console.log('Starting to load trips for tenant:', tenant?.id, tenant?.name)
      const tripData = await getProducts()
      console.log('Successfully loaded trip data:', tripData)
      
      // Cache the successful result
      if (tripData && tripData.length > 0) {
        cacheRef.current = {
          tenantId: tenant.id,
          data: tripData,
          timestamp: Date.now()
        }
        console.log('Cached trip data for tenant:', tenant.id)
      }
      
      setTrips(tripData || [])
    } catch (err: any) {
      console.error('Error loading trips (detailed):', {
        error: err,
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack,
        tenantId: tenant?.id,
        tenantName: tenant?.name
      })
      
      // If we have cached data, use it instead of showing error
      if (cacheRef.current && cacheRef.current.tenantId === tenant.id) {
        console.log('Database error, using cached data instead')
        setTrips(cacheRef.current.data)
        setError(undefined) // Don't show error if we have cached data
      } else {
        // Provide more specific error messages only if no cached data
        let errorMessage = 'Failed to load trips'
        if (err?.message?.includes('JWT')) {
          errorMessage = 'Authentication error - please refresh the page'
        } else if (err?.message?.includes('policy')) {
          errorMessage = 'Database access restricted - check authentication'
        } else if (err?.code === 'PGRST116') {
          errorMessage = 'Database permissions error - data access blocked'
        } else if (err?.message) {
          errorMessage = `Error: ${err.message}`
        }
        
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [tenant, getProducts])

  // Only load trips once per tenant, unless explicitly refreshed
  useEffect(() => {
    if (tenantLoading || !tenant) return
    
    // Check if we already have data for this tenant
    if (cacheRef.current && cacheRef.current.tenantId === tenant.id) {
      const cacheAge = Date.now() - cacheRef.current.timestamp
      if (cacheAge < CACHE_DURATION) {
        console.log('Tenant unchanged, using existing cached data')
        setTrips(cacheRef.current.data)
        setLoading(false)
        setError(undefined)
        return
      }
    }
    
    loadTrips()
  }, [tenantLoading, tenant?.id]) // Only depend on tenant ID, not the full tenant object

  return {
    trips,
    loading,
    error,
    tenantLoading,
    refetch: () => loadTrips(true) // Force refresh when manually called
  }
}
