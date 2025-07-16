'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  reviewer_name: string;
  created_at: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

export function ReviewList({ tripId }: { tripId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const reviewsPerPage = 5;

  const fetchReviews = useCallback(async (pageNum: number) => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    const from = (pageNum - 1) * reviewsPerPage;
    const to = from + reviewsPerPage - 1;

    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('trip_id', tripId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setReviews(prev => pageNum === 1 ? data || [] : [...prev, ...(data || [])]);
      setHasMore((data || []).length === reviewsPerPage);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  if (isLoading && page === 1) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <p>Be the first to leave a review for this trip!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center mb-2">
                <StarRating rating={review.rating} />
                <span className="ml-4 font-semibold">{review.reviewer_name}</span>
                <span className="ml-auto text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.review_text}</p>
            </div>
          ))}
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 