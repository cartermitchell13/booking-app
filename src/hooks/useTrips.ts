import { useState, useEffect, useCallback, useRef } from 'react'
import { useTenant, useTenantSupabase } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'

export function useTrips() {
  const [trips, setTrips] = useState<TenantTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const loadingRef = useRef(false) // Prevent multiple simultaneous loads

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProducts } = useTenantSupabase()

  // Load trips from database (using new products system)
  const loadTrips = useCallback(async () => {
    if (!tenant || loadingRef.current) return

    try {
      loadingRef.current = true
      setLoading(true)
      setError(undefined)
      console.log('Starting to load trips for tenant:', tenant?.id, tenant?.name)
      const tripData = await getProducts()
      console.log('Successfully loaded trip data:', tripData)
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
      
      // Provide more specific error messages
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
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [tenant, getProducts])

  useEffect(() => {
    if (tenantLoading || !tenant) return
    loadTrips()
  }, [tenantLoading, tenant, loadTrips])

  return {
    trips,
    loading,
    error,
    tenantLoading,
    refetch: loadTrips // Allow manual refetch
  }
} 