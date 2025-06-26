'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Globe, 
  Palette, 
  CreditCard,
  Shield,
  Zap,
  Clock,
  HeartHandshake,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Globe,
    title: 'Your Own Booking Website',
    description: 'Complete white-label booking platform with your branding'
  },
  {
    icon: Palette,
    title: 'Full Customization',
    description: 'Upload your logo, set colors, and match your brand perfectly'
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Track bookings, manage customers, and grow your business'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Accept payments online with industry-standard security'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with data isolation and backups'
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Reports',
    description: 'Track performance, revenue, and customer insights'
  }
];

const plans = [
  {
    name: 'Starter',
    price: 99,
    description: 'Perfect for small tour operators',
    features: [
      'Up to 100 bookings/month',
      'Basic branding customization',
      'Email support',
      'Standard integrations',
      '5% transaction fee'
    ],
    recommended: false
  },
  {
    name: 'Professional',
    price: 299,
    description: 'Most popular for growing businesses',
    features: [
      'Up to 1,000 bookings/month',
      'Full branding customization',
      'Priority support',
      'Advanced integrations',
      'Custom domain included',
      '3% transaction fee'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 999,
    description: 'For established tour operators',
    features: [
      'Unlimited bookings',
      'Dedicated database option',
      'White-label mobile app',
      'API access',
      'Dedicated support',
      '2% transaction fee'
    ],
    recommended: false
  }
];

const testimonials = [
  {
    name: 'Sarah Thompson',
    company: 'ParkBus',
    role: 'Founder',
    quote: 'This platform transformed our business. We went from manual bookings to a professional system in just one day.',
    rating: 5
  },
  {
    name: 'Mike Rodriguez',
    company: 'Rocky Mountain Tours',
    role: 'Operations Manager',
    quote: 'The universal product system supports our boat tours and equipment rentals perfectly. Game changer!',
    rating: 5
  },
  {
    name: 'Emily Chen',
    company: 'Adventure Bus Co.',
    role: 'CEO',
    quote: 'Customer support is amazing, and the white-label features make it look like our own custom platform.',
    rating: 5
  }
];

export default function OnboardingLanding() {
  const [selectedPlan, setSelectedPlan] = useState('Professional');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">TourPlatform</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Sign In
              </Link>
              <Link href="/onboard/register" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-6">
            ✨ Launch Your Tour Business Online in Minutes
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Complete
            <span className="text-blue-600 block">Booking Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join hundreds of tour operators who trust our platform to manage bookings, 
            customize their brand, and grow their business. Get started in under 10 minutes.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-gray-700">30-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-gray-700">No setup fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-gray-700">Cancel anytime</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/onboard/register" 
                  className="flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="flex items-center bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
              <Clock className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Tour Business
          </h2>
          <p className="text-xl text-gray-600">
            Professional features that scale with your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business size
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-8 relative ${plan.recommended ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-2">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={`/onboard/register?plan=${plan.name.toLowerCase()}`}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.recommended 
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                Start {plan.name} Plan
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Tour Operators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Tour Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of successful tour operators. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/onboard/register" 
                  className="flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Link>
            <button className="flex items-center text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              <HeartHandshake className="w-5 h-5 mr-2" />
              Talk to Sales
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • Setup in under 10 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-4">TourPlatform</div>
            <p className="text-gray-400 mb-6">
              The complete booking platform for tour operators
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/support" className="hover:text-white">Support</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 