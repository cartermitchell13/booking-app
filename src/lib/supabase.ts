import { createClient } from '@supabase/supabase-js'

// Hardcode the values for now to bypass env variable issues
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

console.log('[Supabase] Initializing client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We'll handle auth sessions manually if needed
  },
  global: {
    headers: {
      'x-client-info': 'parkbus-app',
    },
  },
})

// Note: Removed connection test from here since it was causing timing issues during app startup
// The debug page proved the connection works fine when called at the right time

// Database function calls with proper error handling
export const searchTrips = async (
  originId: string,
  destinationId: string,
  outboundDate: string,
  inboundDate?: string
) => {
  const { data, error } = await supabase.rpc('rpc_search_trips', {
    origin_id: originId,
    destination_id: destinationId,
    outbound_date: outboundDate,
    inbound_date: inboundDate || null,
  })

  if (error) {
    console.error('Error searching trips:', error)
    throw error
  }

  return data
}

export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching locations:', error)
    throw error
  }

  return data || []
}

export const getTripBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      origin:locations!trips_origin_id_fkey(*),
      destination:locations!trips_destination_id_fkey(*)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching trip:', error)
    throw error
  }

  return data
} 