'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number, size?: string }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

export function AverageRating({ tripId }: { tripId: string }) {
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAverageRating = async () => {
      if (!tripId) return;
      setIsLoading(true);

      try {
        // Fetch average rating
        const { data: avgData, error: avgError } = await supabase.rpc('calculate_avg_rating', {
          trip_id_param: tripId,
        });
        if (avgError) throw avgError;
        setAvgRating(avgData || 0);

        // Fetch review count
        const { count, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('trip_id', tripId)
          .eq('is_approved', true);
        if (countError) throw countError;
        setReviewCount(count || 0);

      } catch (err) {
        console.error('Failed to fetch average rating:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAverageRating();
  }, [tripId]);

  if (isLoading) {
    return <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>;
  }

  if (reviewCount === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Star className="w-5 h-5 text-gray-300" />
        <span className="text-gray-500">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <StarRating rating={Math.round(avgRating)} />
      <span className="font-semibold">{avgRating.toFixed(1)}</span>
      <span className="text-gray-500">({reviewCount} reviews)</span>
    </div>
  );
} 