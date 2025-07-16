'use client';

import { useState, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTenantBranding, useTenantSupabase } from '@/lib/tenant-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// We'll need a star rating component. We can create a simple one for now.
// import { StarRating } from '@/components/ui/star-rating'; 

export default function LeaveReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const branding = useTenantBranding();
  const { supabase } = useTenantSupabase();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Unwrap the async params using React.use()
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  // In a real app, you'd fetch the booking here and verify:
  // 1. The booking belongs to the current user.
  // 2. The trip associated with the booking has been completed.
  // 3. A review for this booking hasn't already been submitted.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // You would get trip_id and reviewer_name from the booking details
      const { data, error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        user_id: user.id,
        rating,
        review_text: reviewText,
        // These would come from the booking/user object
        trip_id: 'f8a4e3a0-4c3e-4b2a-8a1e-8e3f4e2a1c7a', // Placeholder
        reviewer_name: user.email || 'Anonymous', // Placeholder
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // A simple star rating component with tenant branding
  const StarRating = ({ count, value, onChange }: { count: number, value: number, onChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[...Array(count)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <svg
              key={i}
              className="w-8 h-8 cursor-pointer transition-colors duration-150"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => onChange(ratingValue)}
              style={{ 
                color: ratingValue <= value ? branding.primary_color : '#d1d5db'
              }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.448a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.051 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
          );
        })}
      </div>
    );
  };


  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#faf9f6' }}>
        <div className="container mx-auto py-12">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                color: branding.textOnBackground,
                fontFamily: `var(--tenant-font, 'Inter')`
              }}
            >
              Thank you for your review!
            </h2>
            <p style={{ color: branding.textOnBackground }}>
              Your feedback helps other travelers.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#faf9f6' }}>
      <div className="container mx-auto py-12">
        <Card className="p-8 max-w-2xl mx-auto">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              color: branding.textOnBackground,
              fontFamily: `var(--tenant-font, 'Inter')`
            }}
          >
            Leave a Review
          </h1>
          <p 
            className="mb-6"
            style={{ color: branding.textOnBackground }}
          >
            Share your experience for booking #{bookingId}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                className="block text-lg font-medium mb-2"
                style={{ 
                  color: branding.textOnBackground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}
              >
                Your Rating
              </label>
              <StarRating count={5} value={rating} onChange={setRating} />
            </div>

            <div className="mb-6">
              <label 
                htmlFor="reviewText" 
                className="block text-lg font-medium mb-2"
                style={{ 
                  color: branding.textOnBackground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}
              >
                Your Review
              </label>
              <textarea
                id="reviewText"
                rows={6}
                className="w-full p-3 border rounded-md focus:ring-2"
                placeholder="Tell us about your trip..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{
                  borderColor: branding.secondary_color || '#e2e8f0',
                  '--tw-ring-color': branding.primary_color,
                  color: branding.textOnBackground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                } as React.CSSProperties}
              />
            </div>
            
            {error && (
              <p className="mb-4" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full text-lg"
              style={{
                backgroundColor: branding.primary_color,
                borderColor: branding.primary_color,
                color: branding.getOptimalTextColor(branding.primary_color),
                fontFamily: `var(--tenant-font, 'Inter')`
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
} 