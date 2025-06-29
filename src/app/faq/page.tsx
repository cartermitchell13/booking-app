'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  BookOpen,
  CreditCard,
  Users,
  MapPin,
  MessageCircle,
  Home
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export default function FAQPage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'booking', name: 'Booking & Reservations', icon: BookOpen },
    { id: 'payment', name: 'Payment & Billing', icon: CreditCard },
    { id: 'account', name: 'Account Management', icon: Users },
    { id: 'travel', name: 'Travel Information', icon: MapPin }
  ];

  const faqItems: FAQItem[] = [
    // Booking & Reservations
    {
      id: 'how-to-book',
      question: 'How do I make a booking?',
      answer: 'To make a booking, browse our available trips, select your desired trip, choose your travel dates and number of passengers, then follow the step-by-step booking process. You\'ll need to provide passenger information, review your booking details, and complete payment to confirm your reservation.',
      category: 'booking',
      keywords: ['book', 'reservation', 'trip', 'select', 'dates', 'passengers']
    },
    {
      id: 'modify-booking',
      question: 'Can I modify or cancel my booking?',
      answer: 'Yes, you can modify certain aspects of your booking up to 48 hours before your trip departure. Log into your account, go to "My Bookings", and select the booking you wish to modify. Cancellation policies vary by trip type - please check the specific cancellation terms for your booking.',
      category: 'booking',
      keywords: ['modify', 'cancel', 'change', 'dates', 'policy', 'refund']
    },
    {
      id: 'group-booking',
      question: 'Do you offer group discounts?',
      answer: 'Yes! We offer special rates for groups of 8 or more passengers. Group discounts range from 10-20% depending on the trip and group size. Contact our support team to discuss group booking options and receive a custom quote for your group.',
      category: 'booking',
      keywords: ['group', 'discount', 'bulk', 'large', 'corporate', 'family']
    },
    {
      id: 'booking-confirmation',
      question: 'When will I receive my booking confirmation?',
      answer: 'You\'ll receive an immediate booking confirmation email once your payment is processed successfully. If you don\'t receive it within 15 minutes, please check your spam folder or contact our support team. You can also view your booking confirmation in your account dashboard.',
      category: 'booking',
      keywords: ['confirmation', 'email', 'receipt', 'proof', 'ticket']
    },

    // Payment & Billing
    {
      id: 'payment-methods',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are processed securely using industry-standard encryption. Payment is required in full at the time of booking unless otherwise specified.',
      category: 'payment',
      keywords: ['payment', 'credit card', 'paypal', 'visa', 'mastercard', 'secure']
    },
    {
      id: 'refund-policy',
      question: 'What is your refund policy?',
      answer: 'Our refund policy varies by trip type and timing: Full refund for cancellations 7+ days before departure, 50% refund for 48-72 hours before, and no refund for cancellations within 48 hours. Weather-related cancellations receive full refunds or trip rescheduling options.',
      category: 'payment',
      keywords: ['refund', 'cancel', 'money back', 'policy', 'weather', 'reschedule']
    },
    {
      id: 'payment-failed',
      question: 'My payment failed. What should I do?',
      answer: 'If your payment fails, please verify your card details are correct and that you have sufficient funds. Try using a different payment method or card. If the issue persists, contact your bank to ensure they\'re not blocking the transaction, then try again or contact our support team.',
      category: 'payment',
      keywords: ['payment failed', 'declined', 'error', 'card', 'bank', 'block']
    },
    {
      id: 'receipt',
      question: 'Can I get a receipt for my booking?',
      answer: 'Yes, a detailed receipt is automatically sent to your email after successful payment. You can also download receipts from your account dashboard under "My Bookings". Receipts include all booking details, payment information, and can be used for expense reports.',
      category: 'payment',
      keywords: ['receipt', 'invoice', 'expense', 'download', 'email', 'proof']
    },

    // Account Management
    {
      id: 'create-account',
      question: 'Do I need to create an account to book?',
      answer: 'While you can make a booking as a guest, creating an account allows you to easily manage your bookings, view your trip history, save favorite trips, and receive personalized recommendations. Account creation is free and takes less than a minute.',
      category: 'account',
      keywords: ['account', 'register', 'guest', 'signup', 'profile', 'benefits']
    },
    {
      id: 'forgot-password',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within a few minutes. Follow the link to create a new password. If you don\'t receive the email, check your spam folder or contact support.',
      category: 'account',
      keywords: ['password', 'reset', 'forgot', 'login', 'email', 'access']
    },
    {
      id: 'update-profile',
      question: 'How do I update my profile information?',
      answer: 'Log into your account and click on "Profile" or "Account Settings". You can update your personal information, contact details, emergency contacts, and preferences. Make sure to save your changes before leaving the page.',
      category: 'account',
      keywords: ['profile', 'update', 'personal', 'information', 'contact', 'settings']
    },

    // Travel Information
    {
      id: 'what-to-bring',
      question: 'What should I bring on my trip?',
      answer: 'Bring comfortable walking shoes, weather-appropriate clothing, water bottle, snacks, camera, and any personal medications. Specific packing lists are provided in your booking confirmation email and vary by trip type and season. Check the weather forecast before departure.',
      category: 'travel',
      keywords: ['bring', 'pack', 'clothing', 'shoes', 'weather', 'items', 'essentials']
    },
    {
      id: 'pickup-locations',
      question: 'Where are the pickup locations?',
      answer: 'Pickup locations vary by trip and are clearly specified in your booking confirmation. Common pickup points include downtown transit stations, hotels, and designated meeting spots. Exact addresses and arrival instructions are sent 24-48 hours before your trip.',
      category: 'travel',
      keywords: ['pickup', 'location', 'meeting', 'address', 'where', 'departure']
    },
    {
      id: 'weather-policy',
      question: 'What happens if there\'s bad weather?',
      answer: 'Safety is our priority. Trips may be cancelled or modified due to severe weather conditions. You\'ll be notified as soon as possible and offered a full refund or the option to reschedule. Monitor your email and phone for weather-related updates.',
      category: 'travel',
      keywords: ['weather', 'rain', 'snow', 'cancel', 'safety', 'reschedule', 'conditions']
    },
    {
      id: 'accessibility',
      question: 'Are your trips accessible for people with disabilities?',
      answer: 'We strive to accommodate all guests. Accessibility varies by trip type and destination. Please contact us before booking to discuss specific needs and ensure we can provide appropriate accommodations. We\'ll work with you to find suitable trip options.',
      category: 'travel',
      keywords: ['accessibility', 'wheelchair', 'disability', 'accommodate', 'special needs']
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
    >
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                {tenant?.branding?.logo_url ? (
                  <img
                    className="h-10 w-auto"
                    src={tenant.branding.logo_url}
                    alt={tenant.name}
                  />
                ) : (
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: branding.primary_color || '#10B981' }}
                  >
                    {tenant?.name || 'BookingApp'}
                  </div>
                )}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/contact"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: branding.primary_color || '#10B981',
                  color: branding.textOnPrimary || '#FFFFFF'
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50"
                style={{ 
                  borderColor: branding.primary_color || '#10B981',
                  color: branding.primary_color || '#10B981'
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50"
                style={{ 
                  borderColor: branding.accent_color || '#059669',
                  color: branding.accent_color || '#059669'
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <HelpCircle 
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ 
                color: branding.textOnBackground || '#111827',
                fontFamily: `var(--tenant-font, 'Inter')`
              }}
            >
              Frequently Asked Questions
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: branding.textOnBackground || '#6B7280' }}
            >
              Find quick answers to common questions about {tenant?.name || 'our booking platform'}. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: branding.primary_color || '#10B981' }}
              />
              <input
                type="text"
                placeholder="Search FAQ..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 text-lg focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all duration-200"
                style={{ 
                  borderColor: branding.accent_color || '#059669',
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  color: branding.textOnForeground || '#111827'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: isActive ? (branding.primary_color || '#10B981') : (branding.foreground_color || '#FFFFFF'),
                      color: isActive ? (branding.textOnPrimary || '#FFFFFF') : (branding.textOnForeground || '#111827'),
                      border: `2px solid ${isActive ? (branding.primary_color || '#10B981') : (branding.accent_color || '#059669')}`
                    }}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <Card 
                    key={item.id}
                    className="transition-all duration-200 hover:shadow-lg"
                    style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
                  >
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-lg pr-4"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          {item.question}
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronUp 
                            className="h-5 w-5 flex-shrink-0"
                            style={{ color: branding.primary_color || '#10B981' }}
                          />
                        ) : (
                          <ChevronDown 
                            className="h-5 w-5 flex-shrink-0"
                            style={{ color: branding.primary_color || '#10B981' }}
                          />
                        )}
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <p 
                          className="text-base leading-relaxed"
                          style={{ color: branding.textOnForeground || '#6B7280' }}
                        >
                          {item.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}>
                <CardContent className="text-center py-12">
                  <Search 
                    className="h-16 w-16 mx-auto mb-4 opacity-50"
                    style={{ color: branding.textOnForeground || '#6B7280' }}
                  />
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: branding.textOnForeground || '#111827' }}
                  >
                    No FAQs found
                  </h3>
                  <p 
                    className="mb-6"
                    style={{ color: branding.textOnForeground || '#6B7280' }}
                  >
                    Try different keywords or browse all categories. Still can't find what you need?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: branding.primary_color || '#10B981',
                      color: branding.textOnPrimary || '#FFFFFF'
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Section */}
          <div 
            className="mt-12 p-8 rounded-2xl text-center"
            style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
          >
            <MessageCircle 
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ color: branding.textOnForeground || '#111827' }}
            >
              Didn't find your answer?
            </h3>
            <p 
              className="text-lg mb-6 max-w-2xl mx-auto"
              style={{ color: branding.textOnForeground || '#6B7280' }}
            >
              Our support team is here to help with any questions not covered in our FAQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: branding.primary_color || '#10B981',
                  color: branding.textOnPrimary || '#FFFFFF'
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg border-2 transition-all duration-200 hover:bg-opacity-10"
                style={{ 
                  borderColor: branding.primary_color || '#10B981',
                  color: branding.primary_color || '#10B981',
                  backgroundColor: 'transparent'
                }}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Browse Help Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 