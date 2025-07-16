'use client';

import React, { useState, useEffect } from 'react';
import { useTenant, useTenantBranding, useTenantSupabase } from '@/lib/tenant-context';
import { supabase as publicSupabase } from '@/lib/supabase';
import { PageLoading } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  reviewer_name: string;
  created_at: string;
  is_approved: boolean;
  trips: {
    title: string;
  }
}

export default function ReviewModerationPage() {
  const { tenant } = useTenant();
  const { supabase } = useTenantSupabase();
  const branding = useTenantBranding();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!tenant || !supabase) return;
      setIsLoading(true);

      let query = supabase
        .from('reviews')
        .select(`
          *,
          trips (
            title
          )
        `)
        // This is not fully secure, in a real app you'd join on trips to get tenant_id
        // .eq('trips.tenant_id', tenant.id) 
        .order('created_at', { ascending: false });
      
      if (filter === 'pending') {
        query = query.eq('is_approved', false); // Simple assumption for now
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filter === 'rejected') {
        // This is a simplification. In a real app, you might have a separate status field.
        // For now, we'll assume rejected reviews are just not approved.
        query = query.eq('is_approved', false);
      }
      
      try {
        const { data, error } = await query;
        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews for moderation:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [tenant, supabase, filter]);

  const handleUpdateReviewStatus = async (reviewId: string, isApproved: boolean) => {
    if (!supabase) return;
    
    // For rejected reviews, we can just delete them for simplicity
    if (!isApproved) {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
        if (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review.');
            return;
        }
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        return;
    }
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId)
        .select();

      if (error) throw error;

      // Update local state to reflect the change
      setReviews(prev => prev.filter(r => r.id !== reviewId));

    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update review status.');
    }
  };


  if (isLoading) {
    return <PageLoading message="Loading reviews for moderation..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>
      
      <div className="flex space-x-2 mb-6 border-b pb-4">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'solid' : 'outline'}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p>No {filter} reviews found.</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-md border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{review.trips.title}</h3>
                  <p className="text-sm text-gray-500">By: {review.reviewer_name} on {new Date(review.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="mt-2">{review.review_text}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button size="sm" variant="outline" onClick={() => handleUpdateReviewStatus(review.id, true)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateReviewStatus(review.id, false)}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 