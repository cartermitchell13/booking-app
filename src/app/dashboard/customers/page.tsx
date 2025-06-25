'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  Phone,
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  UserPlus,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';

// Mock customer data
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    totalBookings: 5,
    totalSpent: 445,
    averageRating: 4.8,
    lastBooking: '2024-01-15',
    joinDate: '2023-08-12',
    status: 'active',
    notes: 'VIP customer, prefers window seats',
    tags: ['VIP', 'Repeat Customer'],
    preferredTrips: ['Banff National Park Bus Tour', 'Lake Louise Day Trip'],
    communicationPreference: 'email'
  },
  {
    id: 'CUST-002',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 (555) 987-6543',
    totalBookings: 2,
    totalSpent: 250,
    averageRating: 4.5,
    lastBooking: '2024-01-18',
    joinDate: '2023-12-05',
    status: 'active',
    notes: 'Group organizer, often books for large parties',
    tags: ['Group Organizer'],
    preferredTrips: ['Lake Louise Day Trip'],
    communicationPreference: 'phone'
  },
  {
    id: 'CUST-003',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    totalBookings: 8,
    totalSpent: 720,
    averageRating: 4.9,
    lastBooking: '2024-01-12',
    joinDate: '2023-03-22',
    status: 'active',
    notes: 'Food blogger, loves food tours',
    tags: ['Food Enthusiast', 'Blogger', 'Repeat Customer'],
    preferredTrips: ['Vancouver Food Walking Tour'],
    communicationPreference: 'email'
  },
  {
    id: 'CUST-004',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 321-0987',
    totalBookings: 1,
    totalSpent: 95,
    averageRating: null,
    lastBooking: '2024-01-10',
    joinDate: '2024-01-10',
    status: 'inactive',
    notes: 'Cancelled first booking due to weather',
    tags: ['New Customer'],
    preferredTrips: [],
    communicationPreference: 'email'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  vip: 'bg-purple-100 text-purple-800'
};

export default function CustomersManagement() {
  const { tenant, isLoading } = useTenant();
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'bookings':
          return b.totalBookings - a.totalBookings;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'recent':
          return new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime();
        default:
          return 0;
      }
    });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageSpent = totalRevenue / totalCustomers;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">
            Manage customer relationships and track engagement
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Customer Value</p>
              <p className="text-2xl font-bold text-gray-900">${Math.round(averageSpent)}</p>
            </div>
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="bookings">Sort by Bookings</option>
            <option value="spent">Sort by Revenue</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <Badge className={statusColors[customer.status as keyof typeof statusColors]}>
                        {customer.status}
                      </Badge>
                      {customer.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${customer.totalSpent}</p>
                      <p className="text-sm text-gray-600">{customer.totalBookings} booking{customer.totalBookings !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800">
                            {customer.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                            {customer.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Activity */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Activity</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Last booking: {customer.lastBooking}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Customer since: {customer.joinDate}</span>
                        </div>
                        {customer.averageRating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-2" />
                            <span>Average rating: {customer.averageRating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preferences</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Communication:</span> {customer.communicationPreference}
                        </div>
                        {customer.preferredTrips.length > 0 && (
                          <div>
                            <span className="font-medium">Preferred trips:</span>
                            <div className="mt-1">
                              {customer.preferredTrips.slice(0, 2).map(trip => (
                                <div key={trip} className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mr-1 mb-1">
                                  {trip}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {customer.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {customer.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-6">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Profile">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Send Email">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Call Customer">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="More Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Your customers will appear here as they make bookings'}
          </p>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Your First Customer
          </button>
        </Card>
      )}
    </div>
  );
} 