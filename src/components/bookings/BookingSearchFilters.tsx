'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTenantBranding } from '@/lib/tenant-context';
import { SearchLoading } from '@/components/ui';

interface BookingSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  isLoading: boolean;
  totalBookings: number;
  filteredCount: number;
}

export function BookingSearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  isLoading,
  totalBookings,
  filteredCount
}: BookingSearchFiltersProps) {
  const branding = useTenantBranding();

  const handleClearAll = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div 
      className="rounded-xl shadow-lg border-2 mb-6 overflow-hidden"
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#E5E7EB'
      }}
    >
      {/* Mobile Search Section */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          {/* Enhanced Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
              Search Bookings
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                inputMode="search"
                autoComplete="off"
                placeholder="Trip name, destination, or booking #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 block w-full min-h-[48px] h-12 sm:h-10 border-2 border-gray-300 rounded-lg shadow-sm text-base sm:text-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 placeholder-gray-500"
                style={{ 
                  '--tw-ring-color': branding.primary_color || '#10B981'
                } as React.CSSProperties}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[48px] min-w-[48px] focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-r-lg hover:bg-gray-50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile-Optimized Filter Section */}
          <div className="sm:w-48">
            <label htmlFor="status-filter" className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
              Filter by Status
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-10 block w-full min-h-[48px] h-12 sm:h-10 border-2 border-gray-300 rounded-lg shadow-sm text-base sm:text-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 appearance-none"
                style={{ 
                  '--tw-ring-color': branding.primary_color || '#10B981'
                } as React.CSSProperties}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Loading */}
        {searchQuery && (
          <SearchLoading loading={isLoading} message="Searching bookings..." />
        )}

        {/* Mobile Filter Tags/Active Filters */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span 
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border-2"
                    style={{ 
                      backgroundColor: `${branding.primary_color || '#10B981'}15`,
                      borderColor: branding.primary_color || '#10B981',
                      color: branding.primary_color || '#10B981'
                    }}
                  >
                    Search: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span 
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border-2"
                    style={{ 
                      backgroundColor: `${branding.accent_color || '#059669'}15`,
                      borderColor: branding.accent_color || '#059669',
                      color: branding.accent_color || '#059669'
                    }}
                  >
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove status filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm font-semibold hover:underline"
                style={{ color: branding.primary_color || '#10B981' }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Count - Mobile Friendly */}
        {totalBookings > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCount}</span> of{' '}
                <span className="font-semibold">{totalBookings}</span> booking{totalBookings !== 1 ? 's' : ''}
              </p>
              {(searchQuery || statusFilter !== 'all') && filteredCount === 0 && (
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-semibold hover:underline"
                    style={{ color: branding.primary_color || '#10B981' }}
                  >
                    Show All Bookings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Filter Buttons - Mobile Only */}
      <div className="block sm:hidden bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Quick Filters:</span>
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  statusFilter === status
                    ? 'border-transparent text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
                style={{
                  backgroundColor: statusFilter === status 
                    ? (branding.primary_color || '#10B981')
                    : 'white'
                }}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 