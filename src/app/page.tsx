'use client'

import { SearchBar } from '@/components/search-bar'
import { MapPin, Shield, Clock, Users, ChevronRight, ChevronLeft, Star, Heart, Share } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'

export default function HomePage() {
  const featuredScrollRef = useRef<HTMLDivElement>(null)
  const todayScrollRef = useRef<HTMLDivElement>(null)
  const [trips, setTrips] = useState<TenantTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getTrips } = useTenantSupabase()
  const branding = useTenantBranding()

  // Load trips from database
  useEffect(() => {
    if (tenantLoading || !tenant) return

    const loadTrips = async () => {
      try {
        setLoading(true)
        const tripData = await getTrips()
        setTrips(tripData || [])
      } catch (err) {
        console.error('Error loading trips:', err)
        setError('Failed to load trips')
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [tenant, tenantLoading, getTrips])

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Format date for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Split trips into featured and today's trips
  const featuredTrips = trips.slice(0, 6)
  const upcomingTrips = trips.slice(0, 6) // For now, show same trips as "today's" trips

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Tenant not found</p>
          <p className="text-gray-600">Please check your domain configuration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Image
                src={branding.logo_url || "/images/black-pb-logo.png"}
                alt={tenant.name}
                width={160}
                height={42}
                className="h-10 w-auto"
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="transition-colors" style={{ color: branding.secondary_color || '#637752' }}>Destinations</a>
              <a href="#" className="transition-colors" style={{ color: branding.secondary_color || '#637752' }}>About</a>
              <a href="#" className="transition-colors" style={{ color: branding.secondary_color || '#637752' }}>Support</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          <SearchBar />
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trips...</p>
            </div>
          </div>
        )}

        {/* Featured Adventure Trips */}
        {!loading && featuredTrips.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl flex items-center" style={{ color: '#21452e' }}>
                {tenant.name} Originals
                <ChevronRight className="w-5 h-5 ml-2" />
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft(featuredScrollRef)}
                  className="p-2 rounded-full border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: branding.secondary_color || '#637752', color: branding.secondary_color || '#637752' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollRight(featuredScrollRef)}
                  className="p-2 rounded-full border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: branding.secondary_color || '#637752', color: branding.secondary_color || '#637752' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={featuredScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredTrips.map((trip) => (
                <div key={trip.id} className="flex-none w-80 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="relative">
                    <Image
                      src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
                      alt={trip.title}
                      width={320}
                      height={240}
                      className="w-full h-60 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: branding.primary_color || '#10B981' }}
                      >
                        Original
                      </span>
                    </div>
                    <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {trip.destination}
                    </p>
                    <p className="text-gray-700 text-sm mb-4">
                      {trip.description || "Experience the beauty of nature with our guided adventure."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Full Day
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(trip.price_adult)}
                        </p>
                        <p className="text-sm text-gray-600">per person</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/booking/${trip.id}`} className="flex-1">
                        <button 
                          className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                          style={{ backgroundColor: branding.primary_color || '#10B981' }}
                        >
                          Book Now
                        </button>
                      </Link>
                      <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Trips */}
        {!loading && upcomingTrips.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl flex items-center" style={{ color: '#21452e' }}>
                Today in {trips[0]?.destination || 'Banff'} & Area
                <ChevronRight className="w-5 h-5 ml-2" />
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollLeft(todayScrollRef)}
                  className="p-2 rounded-full border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: branding.secondary_color || '#637752', color: branding.secondary_color || '#637752' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollRight(todayScrollRef)}
                  className="p-2 rounded-full border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: branding.secondary_color || '#637752', color: branding.secondary_color || '#637752' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={todayScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {upcomingTrips.map((trip) => (
                <div key={`today-${trip.id}`} className="flex-none w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex">
                    <div className="w-20 p-4 flex flex-col items-center justify-center border-r border-gray-100">
                      <span className="text-lg font-bold text-gray-900">
                        {formatTime(trip.departure_time)}
                      </span>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-3">
                        <Image
                          src={trip.image_url || "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=200&h=150&fit=crop&crop=center"}
                          alt={trip.title}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                            {trip.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {trip.destination}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">
                              {formatPrice(trip.price_adult)}
                            </span>
                            <span className="text-xs text-orange-600 font-medium">
                              {trip.available_seats} spots left
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/booking/${trip.id}`} className="block mt-3">
                        <button 
                          className="w-full py-2 px-3 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                          style={{ backgroundColor: branding.primary_color || '#10B981' }}
                        >
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips available</h3>
              <p className="text-gray-600">Check back soon for new adventures!</p>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "SSL encryption and secure payment processing"
              },
              {
                icon: Clock,
                title: "On-Time Guarantee",
                description: "Reliable departures with real-time tracking"
              },
              {
                icon: Users,
                title: "50K+ Happy Travelers",
                description: "Join thousands who've discovered nature with us"
              },
              {
                icon: MapPin,
                title: "20+ Destinations",
                description: "Explore Canada's most stunning locations"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#faf6e1' }}>
                  <feature.icon className="w-6 h-6" style={{ color: '#21452e' }} />
                </div>
                <h3 className="mb-2" style={{ color: '#21452e' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: '#637752' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(250, 246, 225, 0.3) 0%, transparent 100%)' }}></div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#21452e', color: '#faf6e1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/images/black-pb-logo.png"
                  alt="ParkBus"
                  width={120}
                  height={32}
                  className="h-8 w-auto filter brightness-0 invert"
                />
              </div>
              <p style={{ color: '#faf6e1', opacity: 0.8 }}>
                Connecting you with Canada's most beautiful destinations through sustainable travel.
              </p>
            </div>
            <div>
              <h3 className="mb-4">Destinations</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Banff National Park</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Jasper National Park</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Algonquin Park</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Tofino</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Help Center</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Contact Us</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Cancellation</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Safety</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>About Us</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Careers</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Press</a></li>
                <li><a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Sustainability</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8" style={{ borderColor: '#637752' }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p style={{ color: '#faf6e1', opacity: 0.8 }}>
                © 2024 ParkBus. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Privacy</a>
                <a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Terms</a>
                <a href="#" className="hover:underline" style={{ color: '#faf6e1', opacity: 0.8 }}>Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
