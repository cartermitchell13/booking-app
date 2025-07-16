'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Globe, 
  Palette, 
  CreditCard,
  Shield,
  TrendingUp,
  Server
} from 'lucide-react';
import './landing-page.css'; // Import the scoped CSS

const features = [
  {
    icon: Globe,
    title: 'Your Own Booking Website',
    description: 'Get a complete white-label booking platform with your branding, domain, and identity.'
  },
  {
    icon: Palette,
    title: 'Full Brand Customization',
    description: 'Upload your logo, set brand colors, and customize the look and feel to match your business.'
  },
  {
    icon: Users,
    title: 'Advanced Customer Management',
    description: 'Track bookings, see customer history, and manage all your user data in one place.'
  },
  {
    icon: CreditCard,
    title: 'Secure Online Payments',
    description: 'Accept payments from anywhere in the world with secure, industry-standard processing.'
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Your data is protected with bank-level security, tenant isolation, and automated backups.'
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Reporting',
    description: 'Get valuable insights into your performance, track revenue, and understand customer trends.'
  }
];

const plans = [
  {
    name: 'Starter',
    price: 99,
    description: 'For new operators testing the waters.',
    features: [
      'Up to 100 bookings/month',
      'Basic branding customization',
      'Standard integrations',
      '5% transaction fee'
    ],
    recommended: false
  },
  {
    name: 'Professional',
    price: 299,
    description: 'For growing businesses ready to scale.',
    features: [
      'Up to 1,000 bookings/month',
      'Full branding customization',
      'Custom domain support',
      'Advanced integrations',
      '3% transaction fee'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 999,
    description: 'For established operators at scale.',
    features: [
      'Unlimited bookings',
      'Dedicated support & infrastructure',
      'White-label mobile app (add-on)',
      'API access',
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
    quote: 'This platform transformed our business. We went from manual bookings to a professional, scalable system in just one day.',
    rating: 5
  },
  {
    name: 'Mike Rodriguez',
    company: 'Rocky Mountain Tours',
    role: 'Operations Manager',
    quote: 'The universal product system supports our boat tours and equipment rentals perfectly. It\'s a game changer for operators with diverse offerings.',
    rating: 5
  },
  {
    name: 'Emily Chen',
    company: 'Adventure Bus Co.',
    role: 'CEO',
    quote: 'Customer support is amazing, and the white-label features make it look like our own custom-built platform. Our customers love it.',
    rating: 5
  }
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border`} style={{ borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-block font-semibold px-3 py-1 text-sm rounded-full ${className}`} style={{ backgroundColor: 'rgba(21, 30, 63, 0.05)', color: 'var(--primary)' }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState('Professional');

  return (
    <div className="landing-page-theme min-h-screen">
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Server size={24} style={{ color: 'var(--primary)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>TourPlatform</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="font-medium" style={{ color: 'var(--textMuted)' }}>Features</Link>
              <Link href="#pricing" className="font-medium" style={{ color: 'var(--textMuted)' }}>Pricing</Link>
              <Link href="#testimonials" className="font-medium" style={{ color: 'var(--textMuted)' }}>Testimonials</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="font-medium hidden sm:block" style={{ color: 'var(--textMuted)' }}>
                Sign In
              </Link>
              <Link href="/register/operator" 
                    className="text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primaryHover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative section-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
            <Badge>✨ Launch Your Tour Business in Minutes</Badge>
            <h1 className="text-5xl md:text-7xl font-bold my-6 leading-tight">
              The Modern<br/>
              <span style={{ color: 'var(--primary)' }}>Booking Platform</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto" style={{ color: 'var(--textMuted)' }}>
              Join hundreds of tour operators who use our white-label platform to manage bookings, 
              customize their brand, and scale their business.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register/operator" 
                    className="flex items-center text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors shadow-md"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primaryHover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm" style={{ color: 'var(--textMuted)' }}>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" style={{ color: 'var(--success)' }}/>
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" style={{ color: 'var(--success)' }}/>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need to Run Your Business
              </h2>
              <p className="text-lg" style={{ color: 'var(--textMuted)' }}>
                A professional, scalable, and customizable platform out of the box.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title}>
                  <div className="flex items-center space-x-4 mb-2">
                     <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'rgba(21, 30, 63, 0.05)'}}>
                       <feature.icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                     </div>
                     <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="pl-16" style={{ color: 'var(--textMuted)' }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 section-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg" style={{ color: 'var(--textMuted)' }}>
                Choose the plan that fits your business. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative p-8 rounded-2xl border ${plan.recommended ? 'border-primary' : ''}`} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)'}}>
                   {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="text-white px-4 py-1 text-sm font-semibold rounded-full" style={{ backgroundColor: 'var(--primary)' }}>Most Popular</div>
                    </div>
                  )}
                  
                  <div className="text-left mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="mb-4" style={{ color: 'var(--textMuted)' }}>{plan.description}</p>
                    <div className="text-5xl font-bold mb-1">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--success)' }}/>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors text-white`}
                    style={{ 
                      backgroundColor: plan.recommended ? 'var(--primary)' : 'var(--text)',
                    }}
                  >
                    {plan.recommended ? 'Get Started' : 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="diagonal-section">
          <div className="section-content">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Loved by Tour Operators Worldwide
                </h2>
                <p className="text-lg text-gray-300">
                  Our platform is trusted by businesses of all sizes, from solo guides to enterprise teams.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.name} className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5" style={{ color: '#FFC700' }} fill="#FFC700"/>
                      ))}
                    </div>
                    <p className="italic mb-6 text-base" style={{ color: 'var(--text)' }}>"{testimonial.quote}"</p>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm" style={{ color: 'var(--textMuted)' }}>{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 section-gradient">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--primary)' }}>
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to Grow Your Business?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Start your 30-day free trial today. No credit card required, cancel anytime.
              </p>
              <Link href="/register/operator"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-md w-full sm:w-auto"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}>
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text)' }}>Solutions</h3>
              <ul className="mt-4 space-y-4" style={{ color: 'var(--textMuted)' }}>
                <li><a href="#" className="hover:text-primary">Booking Engine</a></li>
                <li><a href="#" className="hover:text-primary">White-Label</a></li>
                <li><a href="#" className="hover:text-primary">Analytics</a></li>
                <li><a href="#" className="hover:text-primary">Payments</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text)' }}>Support</h3>
              <ul className="mt-4 space-y-4" style={{ color: 'var(--textMuted)' }}>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Documentation</a></li>
                <li><a href="#" className="hover:text-primary">Guides</a></li>
                <li><a href="#" className="hover:text-primary">API Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text)' }}>Company</h3>
              <ul className="mt-4 space-y-4" style={{ color: 'var(--textMuted)' }}>
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Jobs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text)' }}>Legal</h3>
              <ul className="mt-4 space-y-4" style={{ color: 'var(--textMuted)' }}>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--textMuted)' }}>&copy; 2024 TourPlatform. All rights reserved.</p>
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Server size={20} style={{ color: 'var(--textMuted)' }} />
                <span className="font-bold" style={{ color: 'var(--textMuted)' }}>TourPlatform</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 