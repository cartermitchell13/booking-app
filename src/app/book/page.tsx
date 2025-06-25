'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/search-bar'
import { MapPin, Calendar, Users, ArrowRight, Star, Clock, Mountain } from 'lucide-react'
import Image from 'next/image'
import { useSearch } from '@/lib/search-context'

interface DestinationInfo {
  name: string
  location: string
  image: string
  description: string
  highlights: string[]
  rating: number
  duration: string
}

// Mock destination data - in real app this would come from your CMS/API
const destinationData: Record<string, DestinationInfo> = {
  'banff': {
    name: 'Banff National Park',
    location: 'Alberta, Canada',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    description: 'Experience the breathtaking beauty of the Canadian Rockies with towering peaks, pristine lakes, and abundant wildlife.',
    highlights: ['Lake Louise', 'Moraine Lake', 'Banff Townsite', 'Bow Valley Parkway'],
    rating: 4.9,
    duration: 'Full Day Tours Available'
  },
  'jasper': {
    name: 'Jasper National Park',
    location: 'Alberta, Canada',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    description: 'Discover dark skies, ancient glaciers, and incredible wildlife in Canada\'s largest Rocky Mountain national park.',
    highlights: ['Maligne Lake', 'Athabasca Falls', 'Dark Sky Preserve', 'Columbia Icefield'],
    rating: 4.8,
    duration: 'Multi-Day Adventures'
  },
  'tofino': {
    name: 'Tofino',
    location: 'British Columbia, Canada',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
    description: 'Rugged coastlines, ancient rainforests, and world-class surfing on Vancouver Island\'s wild west coast.',
    highlights: ['Long Beach', 'Hot Springs Cove', 'Whale Watching', 'Clayoquot Sound'],
    rating: 4.7,
    duration: 'Day & Multi-Day Tours'
  }
}

export default function BookPage() {
  const searchParams = useSearchParams()
  const search = useSearch()
  const [destination, setDestination] = useState<DestinationInfo | null>(null)

  useEffect(() => {
    // Get destination from URL parameter
    const destinationParam = searchParams.get('destination')
    if (destinationParam && destinationData[destinationParam]) {
      setDestination(destinationData[destinationParam])
      
      // Pre-populate search if we have the destination ID
      // In real app, you'd map destination name to location ID
      // search.setDestinationId(destinationId)
    }

    // Pre-populate other search params if provided
    const dateParam = searchParams.get('date')
    const passengersParam = searchParams.get('passengers')
    const departureParam = searchParams.get('departure')

    if (dateParam) {
      search.setOutboundDate(dateParam)
    }
    if (passengersParam) {
      search.setPassengers(parseInt(passengersParam) || 1)
    }
    // Handle departure location if provided
    // if (departureParam) search.setOriginId(departureId)
  }, [searchParams, search])

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: '#21452e' }}>
            Choose Your Adventure
          </h1>
          <p className="text-gray-600 mb-8">Select a destination to start booking your trip</p>
          <SearchBar />
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
                src="/images/black-pb-logo.png"
                alt="ParkBus"
                width={160}
                height={42}
                className="h-10 w-auto"
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="transition-colors" style={{ color: '#637752' }}>Destinations</a>
              <a href="#" className="transition-colors" style={{ color: '#637752' }}>About</a>
              <a href="#" className="transition-colors" style={{ color: '#637752' }}>Support</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Destination Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Destination Info */}
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2" style={{ color: '#637752' }} />
                <span className="text-sm font-medium" style={{ color: '#637752' }}>
                  {destination.location}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#21452e' }}>
                Book Your Trip to {destination.name}
              </h1>
              
              <p className="text-lg text-gray-700 mb-6">
                {destination.description}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{destination.rating}</span>
                  <span className="text-gray-600 ml-1">rating</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{destination.duration}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className="font-semibold mb-3" style={{ color: '#21452e' }}>
                  Experience Highlights:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {destination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <Mountain className="w-4 h-4 mr-2" style={{ color: '#637752' }} />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center text-sm font-medium" style={{ color: '#637752' }}>
                <span>Complete your booking below</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Destination Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  width={600}
                  height={450}
                  className="w-full h-[450px] object-cover"
                />
              </div>
              
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Starting from</p>
                    <p className="text-2xl font-bold" style={{ color: '#21452e' }}>$89</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#637752' }}>Next departure</p>
                    <p className="text-sm text-gray-600">Tomorrow, 8:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search/Booking Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: '#21452e' }}>
            Find Your Perfect Trip
          </h2>
          <p className="text-gray-600">
            Choose your travel dates and preferences to see available departures
          </p>
        </div>
        
        <SearchBar />
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#faf6e1' }}>
              <MapPin className="w-6 h-6" style={{ color: '#21452e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#21452e' }}>Expert Local Guides</h3>
            <p className="text-sm text-gray-600">
              Professional guides with deep knowledge of local history and wildlife
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#faf6e1' }}>
              <Users className="w-6 h-6" style={{ color: '#21452e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#21452e' }}>Small Groups</h3>
            <p className="text-sm text-gray-600">
              Maximum 12 passengers for a more personal and intimate experience
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#faf6e1' }}>
              <Calendar className="w-6 h-6" style={{ color: '#21452e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#21452e' }}>Flexible Booking</h3>
            <p className="text-sm text-gray-600">
              Free cancellation up to 24 hours before departure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 