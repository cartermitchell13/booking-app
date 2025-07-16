'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'
import { 
  MapPin, Clock, Users, Star, Heart, Share, Calendar, 
  ArrowLeft, CheckCircle, Info, Phone, Mail, Camera,
  ChevronLeft, ChevronRight, X 
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReviewList } from '@/components/reviews/ReviewList';
import { AverageRating } from '@/components/reviews/AverageRating';

export default function TripDetailPage() {
  const params = useParams()
  const tripId = params.id as string
  
  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProductById, getProducts } = useTenantSupabase()
  const branding = useTenantBranding()

  // State
  const [trip, setTrip] = useState<TenantTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [relatedTrips, setRelatedTrips] = useState<TenantTrip[]>([])

  // Sample images for gallery
  const tripImages = [
    trip?.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&h=600&fit=crop&crop=center"
  ]

  // Load trip data (using new products system)
  useEffect(() => {
    if (tenantLoading || !tenant || !tripId) return

    const loadTrip = async () => {
      try {
        setLoading(true)
        setError(undefined)
        console.log('Loading trip details with ID:', tripId)
        
        // Load the specific trip using new product system
        const foundTrip = await getProductById(tripId)
        console.log('Trip details loaded:', foundTrip)
        
        if (foundTrip) {
          setTrip(foundTrip)
          
          // Load related trips (all trips, then filter)
          try {
            const allTrips = await getProducts()
            const related = allTrips?.filter(t => 
              t.id !== tripId && 
              t.destination === foundTrip.destination &&
              t.status === 'active'
            ).slice(0, 3) || []
            setRelatedTrips(related)
          } catch (relatedErr) {
            console.warn('Could not load related trips:', relatedErr)
            // Don't fail the main trip loading if related trips fail
          }
        } else {
          setError('Trip not found')
        }
      } catch (err) {
        console.error('Error loading trip:', err)
        setError('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [tenant, tenantLoading, tripId, getProductById, getProducts])

  // Format functions
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Gallery navigation
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % tripImages.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + tripImages.length) % tripImages.length)
  }

  if (tenantLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: branding.primary_color || '#10B981' }}
          ></div>
          <p style={{ color: branding.textOnBackground }}>Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#DC2626' }}>{error || 'Trip not found'}</p>
          <Link href="/">
            <button 
              className="px-6 py-3 rounded-lg transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: branding.primary_color || '#10B981',
                color: branding.textOnPrimary 
              }}
            >
              Browse All Trips
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
      {/* Header */}
      <header className="relative z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5" style={{ color: branding.textOnBackground }} />
              <Image
                src={branding.logo_url || "/images/black-pb-logo.png"}
                alt={tenant?.name || "Logo"}
                width={160}
                height={42}
                className="h-10 w-auto"
              />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                Trips
              </Link>
              <a href="#" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                About
              </a>
              <a href="#" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                Support
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={tripImages[selectedImageIndex]}
                  alt={trip.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  className="object-cover cursor-pointer"
                  onClick={() => setShowLightbox(true)}
                />
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute top-4 right-4 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition-colors"
                  style={{ 
                    backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                    color: branding.textOnForeground 
                  }}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  View Gallery
                </button>
                
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 hover:opacity-90 transition-colors"
                  style={{ 
                    backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                    color: branding.textOnForeground 
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 hover:opacity-90 transition-colors"
                  style={{ 
                    backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                    color: branding.textOnForeground 
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto">
                {tripImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor: selectedImageIndex === index 
                        ? branding.primary_color || '#10B981'
                        : '#E5E7EB'
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${trip.title} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Info */}
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                backgroundColor: branding.foreground_color || '#FFFFFF',
                borderColor: branding.accent_color || '#E5E7EB'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-extrabold" style={{ color: branding.textOnForeground }}>
                  {trip.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Heart className="w-6 h-6" style={{ color: branding.textOnForeground }}/>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share className="w-6 h-6" style={{ color: branding.textOnForeground }}/>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <AverageRating tripId={tripId} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-6 py-4 border-t border-b">
                <div>
                  <p className="flex items-center mb-2" style={{ color: branding.textOnForeground }}>
                    <MapPin className="w-5 h-5 mr-2" />
                    {trip.destination}
                  </p>
                  <div className="flex items-center gap-4 text-sm" style={{ color: branding.textOnForeground }}>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>4.9 (127 reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Departs {formatTime(trip.departure_time)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="p-2 border border-gray-200 rounded-lg hover:opacity-70 transition-colors"
                    style={{ color: branding.textOnForeground }}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2 border border-gray-200 rounded-lg hover:opacity-70 transition-colors"
                    style={{ color: branding.textOnForeground }}
                  >
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-lg leading-relaxed" style={{ color: branding.textOnForeground }}>
                {trip.description || "Experience the beauty of nature with our expertly guided adventure tour. Discover breathtaking landscapes, learn about local wildlife, and create memories that will last a lifetime."}
              </p>
            </div>

            {/* Highlights */}
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                backgroundColor: branding.foreground_color || '#FFFFFF',
                borderColor: branding.accent_color || '#637752'
              }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ 
                color: branding.textOnForeground,
                fontFamily: `var(--tenant-font, 'Inter')`
              }}>Trip Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(trip.highlights || [
                  "Guided nature walks with expert naturalists",
                  "Scenic mountain and lake views",
                  "Wildlife spotting opportunities", 
                  "Professional photography tips",
                  "Small group experience (max 20 people)",
                  "All safety equipment provided"
                ]).map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle 
                      className="w-5 h-5 flex-shrink-0 mt-0.5" 
                      style={{ color: branding.primary_color || '#10B981' }}
                    />
                    <span style={{ color: branding.textOnForeground }}>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                backgroundColor: branding.foreground_color || '#FFFFFF',
                borderColor: branding.accent_color || '#637752'
              }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ 
                color: branding.textOnForeground,
                fontFamily: `var(--tenant-font, 'Inter')`
              }}>What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(trip.included_items || [
                  "Professional guide",
                  "Transportation to/from meeting point",
                  "Safety equipment and helmets",
                  "Light refreshments and water",
                  "Digital photo package",
                  "Certificate of completion"
                ]).map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle 
                      className="w-5 h-5 flex-shrink-0 mt-0.5" 
                      style={{ color: branding.primary_color || '#10B981' }}
                    />
                    <span style={{ color: branding.textOnForeground }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewList tripId={tripId} />

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Booking Card */}
              <div 
                className="rounded-2xl p-6 border-2 shadow-lg"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-1" style={{ color: branding.textOnForeground }}>
                    {formatPrice(trip.price_adult)}
                  </div>
                  <div style={{ color: branding.textOnForeground }}>per person</div>
                  {trip.price_child && (
                    <div className="text-sm mt-1" style={{ color: branding.textOnForeground }}>
                      Children: {formatPrice(trip.price_child)}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: branding.textOnForeground }}>Available spots:</span>
                    <span className="font-medium" style={{ color: branding.primary_color || '#10B981' }}>{trip.available_seats} remaining</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: branding.textOnForeground }}>Departure:</span>
                    <span className="font-medium" style={{ color: branding.textOnForeground }}>{formatTime(trip.departure_time)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: branding.textOnForeground }}>Duration:</span>
                    <span className="font-medium" style={{ color: branding.textOnForeground }}>Full Day</span>
                  </div>
                </div>

                <Link href={`/booking/${trip.id}`}>
                  <button 
                    className="w-full py-4 px-6 font-semibold text-lg rounded-xl transition-colors hover:opacity-90 mb-4"
                    style={{ 
                      backgroundColor: branding.primary_color || '#10B981',
                      color: branding.textOnPrimary 
                    }}
                  >
                    Book This Trip
                  </button>
                </Link>

                <div className="text-center text-sm" style={{ color: branding.textOnForeground }}>
                  <p>Free cancellation up to 24 hours</p>
                  <p>No booking fees • Secure payment</p>
                </div>
              </div>

              {/* Contact Info */}
              <div 
                className="rounded-2xl p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <h3 className="font-semibold mb-4" style={{ color: branding.textOnForeground }}>Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" style={{ color: branding.primary_color || '#10B981' }} />
                    <span style={{ color: branding.textOnForeground }}>1-800-PARKBUS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">support@{tenant?.slug || 'company'}.com</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More trips in {trip.destination}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTrips.map((relatedTrip) => (
                <Link key={relatedTrip.id} href={`/trip/${relatedTrip.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative">
                      <Image
                        src={relatedTrip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
                        alt={relatedTrip.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{relatedTrip.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{relatedTrip.description?.slice(0, 100)}...</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{formatPrice(relatedTrip.price_adult)}</span>
                        <span className="text-sm text-gray-600">{relatedTrip.available_seats} spots left</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={tripImages[selectedImageIndex]}
              alt={trip.title}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
              {selectedImageIndex + 1} / {tripImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 