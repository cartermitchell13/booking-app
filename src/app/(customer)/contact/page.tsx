'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Home,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

export default function ContactPage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Booking Support' },
    { value: 'payment', label: 'Payment Issue' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'partnership', label: 'Partnership Inquiry' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create support ticket in database
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant?.id,
          subject: formData.subject,
          category: formData.category,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          description: formData.message,
          priority: 'medium', // Default priority
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit support ticket');
      }

      const result = await response.json();
      console.log('Support ticket created:', result);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'general',
          message: ''
        });
      }, 5000);
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setIsSubmitting(false);
      // You could add error state handling here
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
      >
        <Card 
          className="max-w-md w-full mx-4 text-center"
          style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
        >
          <CardContent className="pt-8 pb-8">
            <CheckCircle 
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: branding.textOnForeground || '#111827' }}
            >
              Message Sent Successfully!
            </h2>
            <p 
              className="mb-6"
              style={{ color: branding.textOnForeground || '#6B7280' }}
            >
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: branding.primary_color || '#10B981',
                color: branding.textOnPrimary || '#FFFFFF'
              }}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Back to Help Center
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
    >
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <MessageCircle 
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: branding.textOnBackground || '#111827' }}
            >
              Contact Support
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: branding.textOnBackground || '#6B7280' }}
            >
              Get in touch with our support team. We're here to help with any questions or concerns about your {tenant?.name || 'booking'} experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Contact Methods */}
                <Card style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}>
                  <CardHeader>
                    <CardTitle 
                      className="text-xl"
                      style={{ color: branding.textOnForeground || '#111827' }}
                    >
                      Get in Touch
                    </CardTitle>
                    <CardDescription style={{ color: branding.textOnForeground || '#6B7280' }}>
                      Multiple ways to reach our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail 
                        className="h-6 w-6 mt-1"
                        style={{ color: branding.primary_color || '#10B981' }}
                      />
                      <div>
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Email Support
                        </h4>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: branding.textOnForeground || '#6B7280' }}
                        >
                          Get detailed help via email
                        </p>
                        <a 
                          href={`mailto:support@${tenant?.domain || 'example.com'}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: branding.primary_color || '#10B981' }}
                        >
                          support@{tenant?.domain || 'example.com'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone 
                        className="h-6 w-6 mt-1"
                        style={{ color: branding.primary_color || '#10B981' }}
                      />
                      <div>
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Phone Support
                        </h4>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: branding.textOnForeground || '#6B7280' }}
                        >
                          Speak directly with our team
                        </p>
                        <a 
                          href="tel:1-800-555-0199"
                          className="text-sm font-medium hover:underline"
                          style={{ color: branding.primary_color || '#10B981' }}
                        >
                          1-800-555-0199
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Clock 
                        className="h-6 w-6 mt-1"
                        style={{ color: branding.primary_color || '#10B981' }}
                      />
                      <div>
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Business Hours
                        </h4>
                        <p 
                          className="text-sm"
                          style={{ color: branding.textOnForeground || '#6B7280' }}
                        >
                          Monday - Friday: 9:00 AM - 6:00 PM<br />
                          Saturday: 10:00 AM - 4:00 PM<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Help */}
                <Card style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}>
                  <CardHeader>
                    <CardTitle 
                      className="text-xl"
                      style={{ color: branding.textOnForeground || '#111827' }}
                    >
                      Need Quick Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link
                      href="/help"
                      className="block p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:bg-opacity-50"
                      style={{ 
                        borderColor: branding.accent_color || '#059669',
                        backgroundColor: `${branding.accent_color || '#059669'}10`
                      }}
                    >
                      <h4 
                        className="font-semibold mb-2"
                        style={{ color: branding.textOnForeground || '#111827' }}
                      >
                        Browse Help Articles
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: branding.textOnForeground || '#6B7280' }}
                      >
                        Find instant answers in our help center
                      </p>
                    </Link>
                    
                    <Link
                      href="/faq"
                      className="block p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:bg-opacity-50"
                      style={{ 
                        borderColor: branding.accent_color || '#059669',
                        backgroundColor: `${branding.accent_color || '#059669'}10`
                      }}
                    >
                      <h4 
                        className="font-semibold mb-2"
                        style={{ color: branding.textOnForeground || '#111827' }}
                      >
                        Check FAQ
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: branding.textOnForeground || '#6B7280' }}
                      >
                        Common questions and quick answers
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}>
                <CardHeader>
                  <CardTitle 
                    className="text-2xl"
                    style={{ color: branding.textOnForeground || '#111827' }}
                  >
                    Send us a Message
                  </CardTitle>
                  <CardDescription style={{ color: branding.textOnForeground || '#6B7280' }}>
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                          style={{ 
                            borderColor: branding.accent_color || '#059669',
                            backgroundColor: branding.background_color || '#F8FAFC',
                            color: branding.textOnBackground || '#111827'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = branding.primary_color || '#10B981';
                            e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = branding.accent_color || '#059669';
                            e.target.style.boxShadow = 'none';
                          }}
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                          style={{ 
                            borderColor: branding.accent_color || '#059669',
                            backgroundColor: branding.background_color || '#F8FAFC',
                            color: branding.textOnBackground || '#111827'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = branding.primary_color || '#10B981';
                            e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = branding.accent_color || '#059669';
                            e.target.style.boxShadow = 'none';
                          }}
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                          style={{ 
                            borderColor: branding.accent_color || '#059669',
                            backgroundColor: branding.background_color || '#F8FAFC',
                            color: branding.textOnBackground || '#111827'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = branding.primary_color || '#10B981';
                            e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = branding.accent_color || '#059669';
                            e.target.style.boxShadow = 'none';
                          }}
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: branding.textOnForeground || '#111827' }}
                        >
                          Category *
                        </label>
                        <select
                          name="category"
                          required
                          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                          style={{ 
                            borderColor: branding.accent_color || '#059669',
                            backgroundColor: branding.background_color || '#F8FAFC',
                            color: branding.textOnBackground || '#111827'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = branding.primary_color || '#10B981';
                            e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = branding.accent_color || '#059669';
                            e.target.style.boxShadow = 'none';
                          }}
                          value={formData.category}
                          onChange={handleInputChange}
                        >
                          {contactCategories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: branding.textOnForeground || '#111827' }}
                      >
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                        style={{ 
                          borderColor: branding.accent_color || '#059669',
                          backgroundColor: branding.background_color || '#F8FAFC',
                          color: branding.textOnBackground || '#111827'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = branding.primary_color || '#10B981';
                          e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = branding.accent_color || '#059669';
                          e.target.style.boxShadow = 'none';
                        }}
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: branding.textOnForeground || '#111827' }}
                      >
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200 resize-none"
                        style={{ 
                          borderColor: branding.accent_color || '#059669',
                          backgroundColor: branding.background_color || '#F8FAFC',
                          color: branding.textOnBackground || '#111827'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = branding.primary_color || '#10B981';
                          e.target.style.boxShadow = `0 0 0 3px ${branding.primary_color || '#10B981'}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = branding.accent_color || '#059669';
                          e.target.style.boxShadow = 'none';
                        }}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-6 py-4 text-lg font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: branding.primary_color || '#10B981',
                        color: branding.textOnPrimary || '#FFFFFF'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div 
                            className="animate-spin rounded-full h-5 w-5 border-b-2 mr-3"
                            style={{ borderColor: branding.textOnPrimary || '#FFFFFF' }}
                          ></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-3" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 