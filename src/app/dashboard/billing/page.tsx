'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Download, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Plus,
  ArrowUpRight,
  Clock,
  Receipt,
  Zap
} from 'lucide-react';
import { useState } from 'react';

// Mock billing data
const mockBillingData = {
  currentPlan: {
    name: 'Professional',
    price: 299,
    currency: 'CAD',
    billingCycle: 'monthly',
    features: [
      'Up to 1,000 bookings/month',
      'Full branding customization',
      'Priority support',
      'Advanced integrations',
      'Custom domain included',
      '3% transaction fee'
    ],
    usage: {
      bookings: 456,
      limit: 1000,
      percentage: 45.6
    }
  },
  nextPayment: {
    amount: 299,
    currency: 'CAD',
    date: '2024-02-15',
    status: 'scheduled'
  },
  paymentMethod: {
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    expiry: '12/2027',
    name: 'Sarah Thompson'
  },
  invoices: [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 299,
      currency: 'CAD',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 299,
      currency: 'CAD',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 299,
      currency: 'CAD',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-010',
      date: '2023-10-15',
      amount: 299,
      currency: 'CAD',
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-009',
      date: '2023-09-15',
      amount: 299,
      currency: 'CAD',
      status: 'failed',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    }
  ],
  usage: {
    thisMonth: {
      bookings: 456,
      revenue: 45600,
      transactionFees: 1368
    },
    lastMonth: {
      bookings: 423,
      revenue: 42300,
      transactionFees: 1269
    }
  },
  plans: [
    {
      name: 'Starter',
      price: 99,
      currency: 'CAD',
      billingCycle: 'monthly',
      features: [
        'Up to 100 bookings/month',
        'Basic branding customization',
        'Email support',
        'Standard integrations',
        '5% transaction fee'
      ],
      current: false
    },
    {
      name: 'Professional',
      price: 299,
      currency: 'CAD',
      billingCycle: 'monthly',
      features: [
        'Up to 1,000 bookings/month',
        'Full branding customization',
        'Priority support',
        'Advanced integrations',
        'Custom domain included',
        '3% transaction fee'
      ],
      current: true,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 999,
      currency: 'CAD',
      billingCycle: 'monthly',
      features: [
        'Unlimited bookings',
        'Dedicated database option',
        'White-label mobile app',
        'API access',
        'Dedicated support',
        '2% transaction fee'
      ],
      current: false
    }
  ]
};

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800'
};

export default function BillingManagement() {
  const { tenant, isLoading } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { currentPlan, nextPayment, paymentMethod, invoices, usage, plans } = mockBillingData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <Badge className="bg-blue-100 text-blue-800">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
              <p className="text-gray-600">
                ${currentPlan.price} {currentPlan.currency}/{currentPlan.billingCycle}
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Change Plan
            </button>
          </div>

          {/* Usage Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Bookings</span>
              <span className="text-sm text-gray-600">
                {usage.thisMonth.bookings} of {currentPlan.usage.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentPlan.usage.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentPlan.usage.percentage}% of monthly limit used
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Next Payment */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Payment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">${nextPayment.amount} {nextPayment.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{nextPayment.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-800">Scheduled</Badge>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                Update
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-600">
                  Expires {paymentMethod.expiry}
                </p>
                <p className="text-sm text-gray-600">
                  {paymentMethod.name}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${usage.thisMonth.revenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+7.8% from last month</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bookings This Month</p>
              <p className="text-2xl font-bold text-gray-900">{usage.thisMonth.bookings}</p>
              <p className="text-xs text-green-600">+7.8% from last month</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaction Fees</p>
              <p className="text-2xl font-bold text-gray-900">${usage.thisMonth.transactionFees.toLocaleString()}</p>
              <p className="text-xs text-gray-600">3% of revenue</p>
            </div>
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Billing History' },
            { id: 'plans', label: 'Available Plans' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        <div className="text-sm text-gray-500">{invoice.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-700 mr-4">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-6 relative ${plan.current ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600">/{plan.billingCycle}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current 
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 