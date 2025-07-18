'use client';

import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Loader2,
  FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { offeringTypeColors, statusColors } from '@/lib/offerings-constants';
import { DraftManager } from '@/components/offerings/DraftManager';

interface Product {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  location: string;
  destination: string;
  departure_location: string;
  departure_time: string;
  return_time?: string;
  price_adult: number;
  price_child: number;
  max_passengers: number;
  available_seats: number;
  image_url?: string;
  highlights: string[];
  included_items: string[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function OfferingsManagement() {
  const router = useRouter();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { getProducts, supabase } = useTenantSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDraftManager, setShowDraftManager] = useState(false);

  // Load real products from database
  useEffect(() => {
    const loadProducts = async () => {
      if (!tenant?.id || !getProducts) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const realProducts = await getProducts();
        console.log('Loaded real products:', realProducts);
        setProducts(realProducts || []);
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [tenant?.id, getProducts]);

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  const handleDeleteProduct = async (productId: string) => {
    if (!supabase || !window.confirm('Are you sure you want to delete this offering?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('tenant_id', tenant?.id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete offering: ' + error.message);
        return;
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Offering deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete offering. Please try again.');
    }
  };

  const handleToggleStatus = async (productId: string, newStatus: 'active' | 'inactive') => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId)
        .eq('tenant_id', tenant?.id);

      if (error) {
        console.error('Error updating product status:', error);
        alert('Failed to update status: ' + error.message);
        return;
      }

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  if (tenantLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your offerings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Offerings</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Retry
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Offerings & Products</h1>
          <p className="text-gray-600 mt-1">
            Manage all your offerings - tours, equipment, classes, packages, and more
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDraftManager(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage Drafts
          </button>
          <button 
            onClick={() => router.push('/dashboard/offerings/create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Offering
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search offerings by name or destination..."
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
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Offerings</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Offerings</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(product => product.status === 'active').length}
              </p>
            </div>
            <Eye className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((sum, product) => sum + product.max_passengers, 0)}
              </p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Seats</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((sum, product) => sum + product.available_seats, 0)}
              </p>
            </div>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'No offerings yet' : 'No offerings match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {products.length === 0 
              ? 'Create your first offering to start accepting bookings from customers.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {products.length === 0 && (
            <button 
              onClick={() => router.push('/dashboard/offerings/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Offering
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
                <div className="absolute top-4 right-4">
                  <Badge 
                    className={statusColors[product.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {product.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {product.destination}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">Departs from:</span> {product.departure_location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {product.available_seats} / {product.max_passengers} seats available
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${(product.price_adult / 100).toFixed(2)} per adult
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleToggleStatus(
                        product.id, 
                        product.status === 'active' ? 'inactive' : 'active'
                      )}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        product.status === 'active'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {product.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/dashboard/offerings/create?edit=${product.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit offering"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Draft Manager Modal */}
      <DraftManager
        isOpen={showDraftManager}
        onClose={() => setShowDraftManager(false)}
        onCreateNew={() => router.push('/dashboard/offerings/create')}
      />

    </div>
  );
} 