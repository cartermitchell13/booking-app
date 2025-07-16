'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { useTenantBranding } from '@/lib/tenant-context';

interface EmptyBookingsStateProps {
  searchQuery: string;
  statusFilter: string;
  onClearFilters: () => void;
}

export function EmptyBookingsState({ 
  searchQuery, 
  statusFilter, 
  onClearFilters 
}: EmptyBookingsStateProps) {
  const branding = useTenantBranding();

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <div 
      className="rounded-lg shadow-sm p-12 text-center border"
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#E5E7EB'
      }}
    >
      <Calendar 
        className="mx-auto h-12 w-12 mb-4"
        style={{ color: branding.primary_color || '#10B981' }}
      />
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: branding.textOnForeground }}
      >
        {hasActiveFilters ? 'No matching bookings' : 'No bookings yet'}
      </h3>
      <p 
        className="mb-6"
        style={{ color: branding.textOnForeground }}
      >
        {hasActiveFilters 
          ? 'Try adjusting your search or filter criteria'
          : 'Start exploring and book your first trip!'
        }
      </p>
      {!hasActiveFilters ? (
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:opacity-90 transition-colors"
          style={{ backgroundColor: branding.primary_color || '#10B981' }}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Browse Trips
        </Link>
      ) : (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:opacity-90 transition-colors"
          style={{ backgroundColor: branding.primary_color || '#10B981' }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Show All Bookings
        </button>
      )}
    </div>
  );
} 