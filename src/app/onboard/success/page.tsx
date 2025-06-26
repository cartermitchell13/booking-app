'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  Rocket,
  Globe,
  Settings,
  Users,
  CreditCard,
  Mail,
  Play,
  ArrowRight,
  Star,
  Shield,
  Zap,
  HeartHandshake,
  Palette
} from 'lucide-react';
import Link from 'next/link';

const nextSteps = [
  {
    icon: Settings,
    title: 'Configure Your Business Settings',
    description: 'Set up booking policies, payment methods, and operational preferences',
    action: 'Go to Settings',
    href: '/dashboard/settings',
    time: '5 min'
  },
  {
    icon: Globe,
    title: 'Create Your First Product/Tour',
    description: 'Add your tours, activities, or services to start accepting bookings',
    action: 'Add Products',
    href: '/dashboard/products',
    time: '10 min'
  },
  {
    icon: Users,
    title: 'Invite Your Team',
    description: 'Add team members and set their roles and permissions',
    action: 'Manage Team',
    href: '/dashboard/team',
    time: '3 min'
  },
  {
    icon: Palette,
    title: 'Customize Your Branding',
    description: 'Fine-tune colors, upload your logo, and perfect your brand look',
    action: 'Update Branding',
    href: '/dashboard/branding',
    time: '5 min'
  }
];

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your data is protected with bank-level encryption and isolated databases'
  },
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'Your booking platform is live and ready to accept customers right now'
  },
  {
    icon: HeartHandshake,
    title: '24/7 Support',
    description: 'Our team is here to help you succeed with priority support included'
  }
];

export default function OnboardingSuccess() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get('subdomain') || 'your-business';
  const businessName = searchParams.get('business') || 'Your Business';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-blue-600">TourPlatform</div>
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              ✅ Setup Complete
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Hero */}
        <div className="text-center mb-16">
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎉 Welcome to TourPlatform!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Congratulations! Your booking platform is live and ready to transform your business. 
            You can start accepting bookings immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md flex-1 max-w-sm">
              <Globe className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-sm text-gray-600 mb-1">Your Booking Website</div>
              <div className="font-semibold text-blue-600 break-all">
                https://{subdomain}.tourplatform.com
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md flex-1 max-w-sm">
              <Settings className="w-8 h-8 text-green-600 mb-3" />
              <div className="text-sm text-gray-600 mb-1">Admin Dashboard</div>
              <div className="font-semibold text-green-600">
                Ready to Configure
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={`https://${subdomain}.tourplatform.com`}
                  target="_blank"
                  className="flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              <Globe className="w-5 h-5 mr-2" />
              View Your Live Site
            </Link>
            <Link href="/dashboard"
                  className="flex items-center bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Setup
            </h2>
            <p className="text-xl text-gray-600">
              Follow these quick steps to get the most out of your platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        {step.time}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <Link href={step.href}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      {step.action}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trial Information */}
        <Card className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-blue-100" />
          <h3 className="text-2xl font-bold mb-4">Your 30-Day Free Trial Starts Now!</h3>
          <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
            You have full access to all features during your trial. No credit card required. 
            We'll send you a reminder before your trial ends.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>All features unlocked</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Priority support included</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </Card>

        {/* Getting Started Resources */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Need Help Getting Started?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Play className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h4>
              <p className="text-gray-600 mb-4">Watch step-by-step guides to set up your platform</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Watch Now →
              </button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h4>
              <p className="text-gray-600 mb-4">Get personalized help from our success team</p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Contact Support →
              </button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Best Practices</h4>
              <p className="text-gray-600 mb-4">Learn from successful tour operators on our platform</p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Read Guide →
              </button>
            </Card>
          </div>
        </div>

        {/* Welcome Email Notice */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <Mail className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Check Your Email</h4>
              <p className="text-yellow-700">
                We've sent you a welcome email with your login credentials, important links, and next steps. 
                If you don't see it in your inbox, please check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 