'use client';

import { useTenant } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Users,
  Shield,
  Key,
  Settings,
  MoreVertical,
  Crown,
  Calendar,
  Clock
} from 'lucide-react';
import { useState } from 'react';

// Mock team member data
const mockTeamMembers = [
  {
    id: 'TEAM-001',
    name: 'Sarah Thompson',
    email: 'sarah@parkbus.ca',
    phone: '+1 (555) 123-4567',
    role: 'Owner',
    department: 'Management',
    status: 'active',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-22',
    avatar: null,
    permissions: ['full_access'],
    notes: 'Company founder and CEO',
    workSchedule: 'Full-time',
    emergencyContact: 'John Thompson - +1 (555) 987-6543'
  },
  {
    id: 'TEAM-002',
    name: 'Mike Rodriguez',
    email: 'mike@parkbus.ca',
    phone: '+1 (555) 234-5678',
    role: 'Operations Manager',
    department: 'Operations',
    status: 'active',
    joinDate: '2023-03-20',
    lastLogin: '2024-01-22',
    avatar: null,
    permissions: ['manage_trips', 'manage_bookings', 'view_reports'],
    notes: 'Handles day-to-day operations and trip scheduling',
    workSchedule: 'Full-time',
    emergencyContact: 'Maria Rodriguez - +1 (555) 876-5432'
  },
  {
    id: 'TEAM-003',
    name: 'Emily Chen',
    email: 'emily@parkbus.ca',
    phone: '+1 (555) 345-6789',
    role: 'Customer Service',
    department: 'Customer Support',
    status: 'active',
    joinDate: '2023-06-10',
    lastLogin: '2024-01-21',
    avatar: null,
    permissions: ['manage_bookings', 'manage_customers', 'view_reports'],
    notes: 'Primary customer service representative',
    workSchedule: 'Full-time',
    emergencyContact: 'David Chen - +1 (555) 765-4321'
  },
  {
    id: 'TEAM-004',
    name: 'Alex Johnson',
    email: 'alex@parkbus.ca',
    phone: '+1 (555) 456-7890',
    role: 'Tour Guide',
    department: 'Field Operations',
    status: 'active',
    joinDate: '2023-08-05',
    lastLogin: '2024-01-20',
    avatar: null,
    permissions: ['view_trips', 'update_trip_status'],
    notes: 'Senior tour guide, specializes in Banff area tours',
    workSchedule: 'Part-time',
    emergencyContact: 'Susan Johnson - +1 (555) 654-3210'
  },
  {
    id: 'TEAM-005',
    name: 'Jessica Williams',
    email: 'jessica@parkbus.ca',
    phone: '+1 (555) 567-8901',
    role: 'Marketing Coordinator',
    department: 'Marketing',
    status: 'inactive',
    joinDate: '2023-09-15',
    lastLogin: '2024-01-10',
    avatar: null,
    permissions: ['manage_content', 'view_reports'],
    notes: 'Currently on maternity leave',
    workSchedule: 'Full-time',
    emergencyContact: 'Mark Williams - +1 (555) 543-2109'
  }
];

const roleColors = {
  'Owner': 'bg-purple-100 text-purple-800',
  'Operations Manager': 'bg-blue-100 text-blue-800',
  'Customer Service': 'bg-green-100 text-green-800',
  'Tour Guide': 'bg-orange-100 text-orange-800',
  'Marketing Coordinator': 'bg-pink-100 text-pink-800',
  'Admin': 'bg-indigo-100 text-indigo-800'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800'
};

const permissionLabels = {
  full_access: 'Full Access',
  manage_trips: 'Manage Trips',
  manage_bookings: 'Manage Bookings',
  manage_customers: 'Manage Customers',
  view_reports: 'View Reports',
  manage_content: 'Manage Content',
  view_trips: 'View Trips',
  update_trip_status: 'Update Trip Status'
};

export default function TeamManagement() {
  const { tenant, isLoading } = useTenant();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const departments = [...new Set(teamMembers.map(m => m.department))];
  const roles = [...new Set(teamMembers.map(m => m.role))];

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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage staff members, roles, and permissions
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Permissions
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
            </div>
            <Shield className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Key className="w-6 h-6 text-orange-600" />
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
              placeholder="Search team members by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Team Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                        {member.role === 'Owner' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <Badge className={roleColors[member.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                        {member.role}
                      </Badge>
                      <Badge className={statusColors[member.status as keyof typeof statusColors]}>
                        {member.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{member.department}</p>
                      <p className="text-xs text-gray-500">{member.workSchedule}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`mailto:${member.email}`} className="text-blue-600 hover:text-blue-800">
                            {member.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`tel:${member.phone}`} className="text-blue-600 hover:text-blue-800">
                            {member.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Work Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Work Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Joined: {member.joinDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Last login: {member.lastLogin}</span>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.slice(0, 3).map(permission => (
                          <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                          </span>
                        ))}
                        {member.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{member.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {member.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {member.notes}
                      </p>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Emergency Contact:</span> {member.emergencyContact}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-6">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Profile">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors" title="Permissions">
                  <Key className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="More">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first team member to start building your team'}
          </p>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Your First Team Member
          </button>
        </Card>
      )}
    </div>
  );
} 