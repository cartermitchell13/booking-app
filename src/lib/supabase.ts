import { createClient } from '@supabase/supabase-js'

// Use placeholder values for development if environment variables aren't set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create the client if we have real credentials
const hasRealCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = hasRealCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We'll handle auth sessions manually if needed
      },
    })
  : null

// Database function calls with proper error handling
export const searchTrips = async (
  originId: string,
  destinationId: string,
  outboundDate: string,
  inboundDate?: string
) => {
  if (!supabase) {
    console.warn('Supabase not configured - using mock data')
    // Return mock data for development
    return {
      outbound_trips: [],
      inbound_trips: [],
      total_count: 0
    }
  }

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
  if (!supabase) {
    console.warn('Supabase not configured - using mock data')
    // Return mock locations for development
    return [
      {
        id: '1',
        name: 'Toronto Union Station',
        slug: 'toronto-union',
        city: 'Toronto',
        province: 'ON',
        latitude: 43.6426,
        longitude: -79.3871,
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Banff Town',
        slug: 'banff-town',
        city: 'Banff',
        province: 'AB',
        latitude: 51.1784,
        longitude: -115.5708,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Algonquin Park Visitor Centre',
        slug: 'algonquin-park',
        city: 'Whitney',
        province: 'ON',
        latitude: 45.5377,
        longitude: -78.3706,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Jasper Railway Station',
        slug: 'jasper-station',
        city: 'Jasper',
        province: 'AB',
        latitude: 52.8737,
        longitude: -118.0814,
        created_at: new Date().toISOString()
      }
    ]
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching locations:', error)
    throw error
  }

  return data
}

export const getTripBySlug = async (slug: string) => {
  if (!supabase) {
    console.warn('Supabase not configured - using mock data')
    return null
  }

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