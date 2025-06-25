'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, MoreHorizontal, UserCheck, UserX, Shield, Crown } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'tenant_staff' | 'customer';
  first_name?: string;
  last_name?: string;
  tenant_id?: string;
  tenant_name?: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { supabase } = useTenantSupabase();

  useEffect(() => {
    const loadUsers = async () => {
      if (!supabase) {
        setError('Database not configured');
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, create mock user data
        // In real implementation, this would query the users table with tenant joins
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@yoursaas.com',
            role: 'super_admin',
            first_name: 'System',
            last_name: 'Administrator',
            email_verified: true,
            created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date().toISOString(),
          },
          {
            id: '2',
            email: 'admin@parkbus.ca',
            role: 'tenant_admin',
            first_name: 'Sarah',
            last_name: 'Johnson',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            email_verified: true,
            created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            email: 'support@parkbus.ca',
            role: 'tenant_staff',
            first_name: 'Mike',
            last_name: 'Wilson',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            email_verified: true,
            created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            email: 'admin@rockymountain.com',
            role: 'tenant_admin',
            first_name: 'Jessica',
            last_name: 'Martinez',
            tenant_id: 'mock-rocky-id',
            tenant_name: 'Rocky Mountain Tours',
            email_verified: true,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '5',
            email: 'owner@adventurebus.com',
            role: 'tenant_admin',
            first_name: 'Alex',
            last_name: 'Thompson',
            tenant_id: 'mock-adventure-id',
            tenant_name: 'Adventure Bus Co',
            email_verified: false,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '6',
            email: 'john.doe@email.com',
            role: 'customer',
            first_name: 'John',
            last_name: 'Doe',
            tenant_id: 'mock-parkbus-id',
            tenant_name: 'ParkBus',
            email_verified: true,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ];

        setUsers(mockUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [supabase]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4" />;
      case 'tenant_admin': return <Shield className="w-4 h-4" />;
      case 'tenant_staff': return <UserCheck className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'tenant_admin': return 'secondary';
      case 'tenant_staff': return 'outline';
      case 'customer': return 'outline';
      default: return 'outline';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users across all tenants and roles</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="tenant_staff">Tenant Staff</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>
            All users registered on the platform across all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Active</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : 'Unknown User'
                          }
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {user.tenant_name || 'Platform'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {user.email_verified ? (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <UserX className="w-4 h-4 text-red-500" />
                        )}
                        <span className={user.email_verified ? 'text-green-600' : 'text-red-600'}>
                          {user.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 font-medium">Error loading users</div>
            <div className="text-gray-500 text-sm mt-1">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 