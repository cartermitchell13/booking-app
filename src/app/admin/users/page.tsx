'use client';

import { useEffect, useState } from 'react';
import { useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, MoreHorizontal, UserCheck, UserX, Shield, Crown, Building } from 'lucide-react';
import { GeistSans } from 'geist/font/sans';

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
        // Query users with tenant information
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            *,
            tenants:tenant_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Error loading users:', usersError);
          throw new Error(`Failed to load users: ${usersError.message}`);
        }

        // Transform the data to include tenant name
        const transformedUsers = (usersData || []).map(user => ({
          ...user,
          tenant_name: user.tenants?.name || 'No Tenant'
        }));

        setUsers(transformedUsers);
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

  const getUserInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return 'Unknown User';
  };

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
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users across all tenants and roles</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="tenant_staff">Tenant Staff</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Platform Users</h2>
            <p className="text-sm text-gray-600 mt-1">All users registered on the platform across all tenants</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">User</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">Role</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">Tenant</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">Last Active</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {getUserInitials(user)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getFullName(user)}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-500">
                          {getRoleIcon(user.role)}
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.tenant_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {user.email_verified ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-amber-500" />
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              Unverified
                            </Badge>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== 'all' 
                  ? 'No users match your current filters.' 
                  : 'No users have been registered yet.'
                }
              </p>
            </div>
          )}
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
                <p className="text-sm text-gray-600">Super Admins</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'tenant_admin').length}
                </p>
                <p className="text-sm text-gray-600">Tenant Admins</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.email_verified).length}
                </p>
                <p className="text-sm text-gray-600">Verified Users</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 