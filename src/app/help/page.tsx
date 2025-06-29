'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Search, 
  BookOpen, 
  CreditCard, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronRight,
  HelpCircle,
  Calendar,
  Shield,
  Settings,
  Home
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  articles: HelpArticle[];
}

export default function HelpPage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const [searchQuery, setSearchQuery] = useState('');

  // Help categories with articles
  const helpCategories: HelpCategory[] = [
    {
      id: 'booking',
      name: 'Booking & Reservations',
      description: 'Everything about making and managing your bookings',
      icon: BookOpen,
      articles: [
        {
          id: 'how-to-book',
          title: 'How to make a booking',
          description: 'Step-by-step guide to booking your trip',
          category: 'booking',
          readTime: '3 min'
        },
        {
          id: 'modify-booking',
          title: 'Modifying your booking',
          description: 'How to change dates, passenger details, or cancel',
          category: 'booking',
          readTime: '4 min'
        },
        {
          id: 'group-bookings',
          title: 'Group bookings',
          description: 'Booking for groups and special requirements',
          category: 'booking',
          readTime: '5 min'
        }
      ]
    },
    {
      id: 'payment',
      name: 'Payment & Billing',
      description: 'Payment methods, refunds, and billing questions',
      icon: CreditCard,
      articles: [
        {
          id: 'payment-methods',
          title: 'Accepted payment methods',
          description: 'What payment options are available',
          category: 'payment',
          readTime: '2 min'
        },
        {
          id: 'refund-policy',
          title: 'Refund policy',
          description: 'Understanding our cancellation and refund terms',
          category: 'payment',
          readTime: '4 min'
        },
        {
          id: 'payment-issues',
          title: 'Payment troubleshooting',
          description: 'Resolving payment errors and failed transactions',
          category: 'payment',
          readTime: '3 min'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account Management',
      description: 'Managing your profile and account settings',
      icon: Users,
      articles: [
        {
          id: 'create-account',
          title: 'Creating an account',
          description: 'Sign up and set up your profile',
          category: 'account',
          readTime: '2 min'
        },
        {
          id: 'update-profile',
          title: 'Updating your profile',
          description: 'Change personal information and preferences',
          category: 'account',
          readTime: '3 min'
        },
        {
          id: 'password-reset',
          title: 'Reset your password',
          description: 'How to reset or change your password',
          category: 'account',
          readTime: '2 min'
        }
      ]
    },
    {
      id: 'travel',
      name: 'Travel Information',
      description: 'Trip details, locations, and what to expect',
      icon: MapPin,
      articles: [
        {
          id: 'what-to-bring',
          title: 'What to bring on your trip',
          description: 'Packing lists and essential items',
          category: 'travel',
          readTime: '4 min'
        },
        {
          id: 'pickup-locations',
          title: 'Pickup locations and times',
          description: 'Where and when to meet for your trip',
          category: 'travel',
          readTime: '3 min'
        },
        {
          id: 'weather-cancellation',
          title: 'Weather and cancellations',
          description: 'What happens if weather affects your trip',
          category: 'travel',
          readTime: '3 min'
        }
      ]
    }
  ];

  // Filter articles based on search query
  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  const allArticles = helpCategories.flatMap(cat => cat.articles);
  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                href="/"
                className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50"
                style={{ 
                  borderColor: branding.primary_color || '#10B981',
                  color: branding.primary_color || '#10B981'
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <HelpCircle 
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: branding.textOnBackground || '#111827' }}
            >
              How can we help you?
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: branding.textOnBackground || '#6B7280' }}
            >
              Find answers to common questions and get the support you need for your {tenant?.name || 'booking'} experience.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: branding.primary_color || '#10B981' }}
              />
              <input
                type="text"
                placeholder="Search for help articles..."
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/contact"
              className="group p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
            >
              <MessageCircle 
                className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ color: branding.primary_color || '#10B981' }}
              />
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: branding.textOnForeground || '#111827' }}
              >
                Contact Support
              </h3>
              <p 
                className="text-sm"
                style={{ color: branding.textOnForeground || '#6B7280' }}
              >
                Get personalized help from our support team
              </p>
            </Link>

            <Link
              href="/faq"
              className="group p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
            >
              <HelpCircle 
                className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ color: branding.primary_color || '#10B981' }}
              />
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: branding.textOnForeground || '#111827' }}
              >
                FAQ
              </h3>
              <p 
                className="text-sm"
                style={{ color: branding.textOnForeground || '#6B7280' }}
              >
                Quick answers to frequently asked questions
              </p>
            </Link>

            <Link
              href="/account"
              className="group p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
            >
              <Users 
                className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ color: branding.primary_color || '#10B981' }}
              />
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: branding.textOnForeground || '#111827' }}
              >
                My Account
              </h3>
              <p 
                className="text-sm"
                style={{ color: branding.textOnForeground || '#6B7280' }}
              >
                Manage your bookings and profile settings
              </p>
            </Link>
          </div>

          {/* Help Categories or Search Results */}
          {searchQuery ? (
            <div>
              <h2 
                className="text-2xl font-bold mb-8"
                style={{ color: branding.textOnBackground || '#111827' }}
              >
                Search Results ({filteredArticles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Card 
                    key={article.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
                  >
                    <CardHeader>
                      <CardTitle 
                        className="text-lg group-hover:text-opacity-80 transition-all duration-200"
                        style={{ color: branding.textOnForeground || '#111827' }}
                      >
                        {article.title}
                      </CardTitle>
                      <CardDescription style={{ color: branding.textOnForeground || '#6B7280' }}>
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span 
                          className="text-sm"
                          style={{ color: branding.primary_color || '#10B981' }}
                        >
                          {article.readTime} read
                        </span>
                        <ChevronRight 
                          className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
                          style={{ color: branding.primary_color || '#10B981' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <Search 
                    className="h-16 w-16 mx-auto mb-4 opacity-50"
                    style={{ color: branding.textOnBackground || '#6B7280' }}
                  />
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: branding.textOnBackground || '#111827' }}
                  >
                    No results found
                  </h3>
                  <p 
                    className="mb-6"
                    style={{ color: branding.textOnBackground || '#6B7280' }}
                  >
                    Try different keywords or browse our help categories below.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: branding.primary_color || '#10B981',
                      color: branding.textOnPrimary || '#FFFFFF'
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 
                className="text-2xl font-bold mb-8"
                style={{ color: branding.textOnBackground || '#111827' }}
              >
                Browse Help Topics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {helpCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className="hover:shadow-xl transition-all duration-200"
                      style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
                    >
                      <CardHeader>
                        <div className="flex items-center mb-4">
                          <IconComponent 
                            className="h-8 w-8 mr-4"
                            style={{ color: branding.primary_color || '#10B981' }}
                          />
                          <div>
                            <CardTitle 
                              className="text-xl"
                              style={{ color: branding.textOnForeground || '#111827' }}
                            >
                              {category.name}
                            </CardTitle>
                            <CardDescription style={{ color: branding.textOnForeground || '#6B7280' }}>
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.articles.map((article) => (
                            <div 
                              key={article.id}
                              className="flex justify-between items-center p-3 rounded-lg hover:bg-opacity-50 cursor-pointer transition-all duration-200 group"
                              style={{ backgroundColor: `${branding.accent_color || '#059669'}10` }}
                            >
                              <div className="flex-1">
                                <h4 
                                  className="font-medium group-hover:text-opacity-80 transition-all duration-200"
                                  style={{ color: branding.textOnForeground || '#111827' }}
                                >
                                  {article.title}
                                </h4>
                                <p 
                                  className="text-sm mt-1"
                                  style={{ color: branding.textOnForeground || '#6B7280' }}
                                >
                                  {article.readTime} read
                                </p>
                              </div>
                              <ChevronRight 
                                className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
                                style={{ color: branding.primary_color || '#10B981' }}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Still Need Help Section */}
          <div 
            className="mt-16 p-8 rounded-2xl text-center"
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
              Still need help?
            </h3>
            <p 
              className="text-lg mb-6 max-w-2xl mx-auto"
              style={{ color: branding.textOnForeground || '#6B7280' }}
            >
              Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
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
                <Mail className="h-5 w-5 mr-2" />
                Send us a message
              </Link>
              <a
                href={`tel:${tenant?.phone || '1-800-555-0199'}`}
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg border-2 transition-all duration-200 hover:bg-opacity-10"
                style={{ 
                  borderColor: branding.primary_color || '#10B981',
                  color: branding.primary_color || '#10B981',
                  backgroundColor: 'transparent'
                }}
              >
                <Phone className="h-5 w-5 mr-2" />
                Call {tenant?.phone || '1-800-555-0199'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 