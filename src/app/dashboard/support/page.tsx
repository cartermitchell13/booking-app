'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Reply,
  Archive,
  MoreVertical,
  Star,
  User,
  Calendar,
  BookOpen,
  Headphones,
  LifeBuoy,
  MessageCircle,
  Plus,
  Send
} from 'lucide-react';
import { useState } from 'react';

// Mock support data
const mockSupportData = {
  tickets: [
    {
      id: 'TICK-001',
      subject: 'Booking Cancellation Request',
      customer: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        bookingId: 'BK-2024-001'
      },
      status: 'open',
      priority: 'high',
      category: 'booking',
      description: 'Customer wants to cancel their Banff tour booking due to weather concerns.',
      createdAt: '2024-01-22 09:30:00',
      updatedAt: '2024-01-22 14:20:00',
      assignedTo: 'Emily Chen',
      messages: [
        {
          id: '1',
          sender: 'customer',
          message: 'Hi, I need to cancel my booking for the Banff tour on Jan 25th due to the weather forecast.',
          timestamp: '2024-01-22 09:30:00'
        },
        {
          id: '2',
          sender: 'support',
          message: 'Hi John, I understand your concern about the weather. Let me check our cancellation policy for you.',
          timestamp: '2024-01-22 14:20:00'
        }
      ]
    },
    {
      id: 'TICK-002',
      subject: 'Payment Issue',
      customer: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1 (555) 234-5678',
        bookingId: 'BK-2024-002'
      },
      status: 'pending',
      priority: 'medium',
      category: 'payment',
      description: 'Customer\'s payment failed and they need assistance with rebooking.',
      createdAt: '2024-01-21 16:45:00',
      updatedAt: '2024-01-22 08:15:00',
      assignedTo: 'Mike Rodriguez',
      messages: [
        {
          id: '1',
          sender: 'customer',
          message: 'My payment was declined but I\'m not sure why. Can you help me rebook?',
          timestamp: '2024-01-21 16:45:00'
        }
      ]
    },
    {
      id: 'TICK-003',
      subject: 'Tour Information Request',
      customer: {
        name: 'David Chen',
        email: 'david.chen@example.com',
        phone: '+1 (555) 345-6789',
        bookingId: null
      },
      status: 'resolved',
      priority: 'low',
      category: 'general',
      description: 'Customer asking about what to bring on the Lake Louise tour.',
      createdAt: '2024-01-20 11:20:00',
      updatedAt: '2024-01-20 13:45:00',
      assignedTo: 'Emily Chen',
      messages: [
        {
          id: '1',
          sender: 'customer',
          message: 'What should I bring for the Lake Louise day trip?',
          timestamp: '2024-01-20 11:20:00'
        },
        {
          id: '2',
          sender: 'support',
          message: 'Great question! I recommend bringing warm clothes, comfortable walking shoes, a camera, and sunglasses. We provide lunch and hot beverages.',
          timestamp: '2024-01-20 13:45:00'
        }
      ]
    }
  ],
  stats: {
    totalTickets: 45,
    openTickets: 12,
    pendingTickets: 8,
    resolvedTickets: 25,
    avgResponseTime: '2.4 hours',
    satisfaction: 4.8
  },
  knowledgeBase: [
    {
      id: '1',
      title: 'Booking Cancellation Policy',
      category: 'Policies',
      views: 234,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'What to Bring on Tours',
      category: 'Tour Info',
      views: 567,
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      title: 'Payment and Refund Process',
      category: 'Billing',
      views: 189,
      lastUpdated: '2024-01-08'
    }
  ]
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  urgent: 'bg-purple-100 text-purple-800'
};

const categoryColors = {
  booking: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  general: 'bg-purple-100 text-purple-800',
  technical: 'bg-orange-100 text-orange-800'
};

export default function SupportManagement() {
  const { tenant, isLoading } = useTenant();
  
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

  return (
    <div className="p-6 space-y-6">
      <div className="text-center py-20">
        <LifeBuoy className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Customer Support</h1>
        <p className="text-gray-600 text-lg mb-8">
          Manage customer inquiries, tickets, and support resources
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
} 