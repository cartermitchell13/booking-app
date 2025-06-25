'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticket_number: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  user_email: string;
  user_name?: string;
  subject: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  agent_assigned?: string;
  last_response_at?: string;
  response_time_hours?: number;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadSupportTickets = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        // Mock support ticket data for demo
        const mockTickets: SupportTicket[] = [
          {
            id: 'ticket_1',
            ticket_number: 'SUP-001',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            tenant_slug: 'parkbus',
            user_email: 'admin@parkbus.ca',
            user_name: 'Sarah Johnson',
            subject: 'Payment integration not working',
            category: 'technical',
            priority: 'high',
            status: 'in_progress',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            agent_assigned: 'Support Team',
            last_response_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            response_time_hours: 2,
          },
          {
            id: 'ticket_2',
            ticket_number: 'SUP-002',
            tenant_id: 'mock-rocky-id',
            tenant_name: 'Rocky Mountain Tours',
            tenant_slug: 'rockymountain',
            user_email: 'admin@rockymountain.com',
            user_name: 'Jessica Martinez',
            subject: 'Need help with custom branding setup',
            category: 'feature_request',
            priority: 'medium',
            status: 'open',
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            response_time_hours: 12,
          },
          {
            id: 'ticket_3',
            ticket_number: 'SUP-003',
            tenant_id: 'mock-adventure-id',
            tenant_name: 'Adventure Bus Co',
            tenant_slug: 'adventurebus',
            user_email: 'owner@adventurebus.com',
            user_name: 'Alex Thompson',
            subject: 'Billing question about trial period',
            category: 'billing',
            priority: 'medium',
            status: 'waiting_customer',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            agent_assigned: 'Billing Team',
            last_response_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            response_time_hours: 3,
          }
        ];

        setTickets(mockTickets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load support tickets');
      } finally {
        setLoading(false);
      }
    };

    loadSupportTickets();
  }, [supabase]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'waiting_customer': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <AlertCircle className="w-4 h-4" />;
      case 'billing': return <CheckCircle className="w-4 h-4" />;
      case 'feature_request': return <HelpCircle className="w-4 h-4" />;
      case 'bug_report': return <AlertCircle className="w-4 h-4" />;
      case 'general': return <MessageSquare className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getResponseTimeColor = (hours?: number) => {
    if (!hours) return 'text-gray-500';
    if (hours <= 2) return 'text-green-600';
    if (hours <= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Management</h1>
        <p className="text-gray-600 mt-2">Manage support tickets across all tenants</p>
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Active issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2h</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Positive feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTickets.length} tickets
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            All support requests across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">{ticket.tenant_name} - {ticket.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{ticket.priority}</Badge>
                  <Badge variant="default">{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">Try adjusting your filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 font-medium">Error loading support tickets</div>
            <div className="text-gray-500 text-sm mt-1">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 