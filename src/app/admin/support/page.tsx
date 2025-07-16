'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  User,
  Calendar,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { GeistSans } from 'geist/font/sans';

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
  const [searchTerm, setSearchTerm] = useState('');

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
          },
          {
            id: 'ticket_4',
            ticket_number: 'SUP-004',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            tenant_slug: 'parkbus',
            user_email: 'admin@parkbus.ca',
            user_name: 'Sarah Johnson',
            subject: 'Custom domain SSL certificate issue',
            category: 'technical',
            priority: 'urgent',
            status: 'open',
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            response_time_hours: 1,
          },
          {
            id: 'ticket_5',
            ticket_number: 'SUP-005',
            tenant_id: 'mock-rocky-id',
            tenant_name: 'Rocky Mountain Tours',
            tenant_slug: 'rockymountain',
            user_email: 'support@rockymountain.com',
            user_name: 'Mike Chen',
            subject: 'How to export booking data',
            category: 'general',
            priority: 'low',
            status: 'resolved',
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            agent_assigned: 'Support Team',
            last_response_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            response_time_hours: 6,
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
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'waiting_customer': return 'secondary';
      case 'resolved': return 'outline';
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

  // Support metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const avgResponseTime = tickets.reduce((sum, t) => sum + (t.response_time_hours || 0), 0) / tickets.length;

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard ${GeistSans.className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 lg:p-8 geist-dashboard ${GeistSans.className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Support Management</h1>
            <p className="text-gray-600 mt-1">Manage support tickets across all tenants</p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredTickets.length} of {totalTickets} tickets
          </div>
        </div>

        {/* Support Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{openTickets}</p>
                <p className="text-sm text-gray-600">Open Tickets</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{inProgressTickets}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{resolvedTickets}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{avgResponseTime.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets by subject, tenant, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </Card>

        {/* Support Tickets */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(ticket.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{ticket.subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.ticket_number}
                          </Badge>
                        </h3>
                        <p className="text-sm text-gray-600">{formatCategory(ticket.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {formatPriority(ticket.priority)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {formatStatus(ticket.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tenant:</span>
                      <span className="font-medium text-gray-900">{ticket.tenant_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">User:</span>
                      <span className="font-medium text-gray-900">{ticket.user_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Response Time & Agent */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm">
                      {ticket.agent_assigned && (
                        <span className="text-gray-600">
                          Assigned to: <span className="font-medium text-gray-900">{ticket.agent_assigned}</span>
                        </span>
                      )}
                      {ticket.response_time_hours && (
                        <span className="text-gray-600">
                          Response time: <span className={`font-medium ${getResponseTimeColor(ticket.response_time_hours)}`}>
                            {ticket.response_time_hours}h
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(ticket.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredTickets.length === 0 && (
            <Card className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No tickets match your current filters.'
                  : 'No support tickets have been created yet.'
                }
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 