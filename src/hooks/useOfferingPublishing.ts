import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { OfferingFormData } from './useOfferingForm';

export type PublishingMode = 'draft' | 'immediate' | 'scheduled';

export interface PublishingOptions {
  mode: PublishingMode;
  scheduledDate?: string;
  draftName?: string;
}

export interface UseOfferingPublishingReturn {
  isPublishing: boolean;
  publishingError: string | null;
  saveDraft: (formData: OfferingFormData, draftName?: string) => Promise<{ success: boolean; draftId?: string }>;
  publishImmediately: (formData: OfferingFormData) => Promise<{ success: boolean; productId?: string }>;
  schedulePublishing: (formData: OfferingFormData, scheduledDate: string) => Promise<{ success: boolean; productId?: string }>;
  loadDraft: (draftId: string) => Promise<OfferingFormData | null>;
  listDrafts: () => Promise<Array<{ id: string; name: string; created_at: string; updated_at: string }>>;
  deleteDraft: (draftId: string) => Promise<boolean>;
}

export function useOfferingPublishing(): UseOfferingPublishingReturn {
  const router = useRouter();
  const { tenant } = useTenant();
  const { supabase } = useTenantSupabase();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingError, setPublishingError] = useState<string | null>(null);

  // Transform form data to database format
  const transformFormDataToProduct = useCallback((formData: OfferingFormData, status: 'draft' | 'active' | 'scheduled') => {
    // Safely access nested properties with fallbacks
    const basicInfo = formData.basicInfo || {};
    const pricing = formData.pricing || {};
    const basePricing = pricing.basePricing || {};
    const scheduling = formData.scheduling || {};
    const media = formData.media || {};
    const productConfig = formData.productConfig || {};

    return {
      tenant_id: tenant?.id,
      name: basicInfo.name || 'Untitled Offering',
      description: basicInfo.description || '',
      product_type: formData.productType || 'open',
      status,
      location: basicInfo.location || '',
      category: basicInfo.category || 'general',
      duration_minutes: basicInfo.duration || 60,
      base_price: Math.round((basePricing.adult || 0) * 100), // Convert to cents
      currency: pricing.currency || 'CAD',
      tags: basicInfo.tags || [],
      product_data: {
        ...productConfig,
        difficulty_level: basicInfo.difficultyLevel || 'beginner',
        min_age: basicInfo.minAge || 0,
        max_group_size: basicInfo.maxGroupSize || 50,
      },
      availability_data: {
        schedule_type: scheduling.scheduleType || 'flexible',
        timezone: scheduling.timezone || 'America/Vancouver',
        advance_booking_days: scheduling.advanceBookingDays || 1,
        cutoff_hours: scheduling.cutoffHours || 24,
        recurring_pattern: scheduling.recurringPattern || null,
        blackout_dates: scheduling.blackoutDates || [],
      },
      booking_rules: {
        cancellation_policy: pricing.cancellationPolicy || 'standard',
        deposit_required: pricing.depositRequired || false,
        deposit_amount: pricing.depositAmount || 0,
        tax_inclusive: pricing.taxInclusive || false,
        group_discounts: pricing.groupDiscounts || [],
        seasonal_pricing: pricing.seasonalPricing || [],
      },
      seo_data: media.seoData || {
        meta_title: basicInfo.name || 'Untitled Offering',
        meta_description: basicInfo.description || '',
        slug: (basicInfo.name || 'untitled-offering').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      media_gallery: {
        images: media.images || [],
        videos: media.videos || [],
        social_media: media.socialMedia || {},
      },
      pricing_tiers: {
        adult: Math.round((basePricing.adult || 0) * 100),
        child: basePricing.child ? Math.round(basePricing.child * 100) : null,
        student: basePricing.student ? Math.round(basePricing.student * 100) : null,
        senior: basePricing.senior ? Math.round(basePricing.senior * 100) : null,
      }
    };
  }, [tenant?.id]);

  // Save as draft
  const saveDraft = useCallback(async (formData: OfferingFormData, draftName?: string) => {
    if (!tenant?.id || !supabase) {
      const errorMsg = 'Missing tenant or database connection';
      setPublishingError(errorMsg);
      return { success: false };
    }

    setIsPublishing(true);
    setPublishingError(null);

    try {
      const finalDraftName = draftName || `Draft - ${formData.basicInfo?.name || 'Untitled'} - ${new Date().toLocaleDateString()}`;
      
      const draftData = {
        tenant_id: tenant.id,
        draft_name: finalDraftName,
        form_data: formData,
        current_step: 7, // Review step
      };

      const { data: draft, error } = await supabase
        .from('offering_drafts')
        .insert(draftData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clear localStorage draft on successful database save
      localStorage.removeItem('offering-form-draft');
      return { success: true, draftId: draft.id };

    } catch (error: any) {
      console.error('Error saving draft:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to save draft. Please try again.';
      
      if (error) {
        // Supabase error object structure
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // For debugging - log the full error structure
          console.error('Unknown error structure:', JSON.stringify(error, null, 2));
          errorMessage = 'An unexpected error occurred while saving the draft.';
        }
      }
      
      setPublishingError(errorMessage);
      return { success: false };
    } finally {
      setIsPublishing(false);
    }
  }, [tenant?.id, supabase]);

  // Publish immediately
  const publishImmediately = useCallback(async (formData: OfferingFormData) => {
    if (!tenant?.id || !supabase) {
      setPublishingError('Missing tenant or database connection');
      return { success: false };
    }

    setIsPublishing(true);
    setPublishingError(null);

    try {
      const productData = transformFormDataToProduct(formData, 'active');

      const { data: product, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      // Create initial product instances if scheduling data exists
      if (formData.scheduling.scheduleType === 'fixed' && formData.scheduling.recurringPattern) {
        // Generate instances based on recurring pattern
        const instances = generateProductInstances(product.id, formData.scheduling);
        
        if (instances.length > 0) {
          const { error: instanceError } = await supabase
            .from('product_instances')
            .insert(instances);
          
          if (instanceError) {
            console.error('Warning: Failed to create product instances:', instanceError);
            // Don't fail the main operation
          }
        }
      }

      // Clear localStorage draft
      localStorage.removeItem('offering-form-draft');

      return { success: true, productId: product.id };
    } catch (error: any) {
      console.error('Error publishing offering:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to publish offering. Please check your connection and try again.';
      
      if (error) {
        // Supabase error object structure
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // For debugging - log the full error structure
          console.error('Unknown error structure:', JSON.stringify(error, null, 2));
          errorMessage = 'An unexpected error occurred while publishing the offering.';
        }
      }
      
      setPublishingError(errorMessage);
      return { success: false };
    } finally {
      setIsPublishing(false);
    }
  }, [tenant?.id, supabase, transformFormDataToProduct]);

  // Schedule publishing
  const schedulePublishing = useCallback(async (formData: OfferingFormData, scheduledDate: string) => {
    if (!tenant?.id || !supabase) {
      setPublishingError('Missing tenant or database connection');
      return { success: false };
    }

    setIsPublishing(true);
    setPublishingError(null);

    try {
      const productData = {
        ...transformFormDataToProduct(formData, 'scheduled'),
        publish_at: new Date(scheduledDate).toISOString(),
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      // Clear localStorage draft
      localStorage.removeItem('offering-form-draft');

      return { success: true, productId: product.id };
    } catch (error: any) {
      console.error('Error scheduling offering:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to schedule offering. Please check your connection and try again.';
      
      if (error) {
        // Supabase error object structure
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // For debugging - log the full error structure
          console.error('Unknown error structure:', JSON.stringify(error, null, 2));
          errorMessage = 'An unexpected error occurred while scheduling the offering.';
        }
      }
      
      setPublishingError(errorMessage);
      return { success: false };
    } finally {
      setIsPublishing(false);
    }
  }, [tenant?.id, supabase, transformFormDataToProduct]);

  // Load draft
  const loadDraft = useCallback(async (draftId: string): Promise<OfferingFormData | null> => {
    if (!tenant?.id || !supabase) return null;

    try {
      const { data: draft, error } = await supabase
        .from('offering_drafts')
        .select('form_data')
        .eq('id', draftId)
        .eq('tenant_id', tenant.id)
        .single();

      if (error) {
        throw error;
      }

      return draft.form_data as OfferingFormData;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, [tenant?.id, supabase]);

  // List drafts
  const listDrafts = useCallback(async () => {
    if (!tenant?.id || !supabase) return [];

    try {
      const { data: drafts, error } = await supabase
        .from('offering_drafts')
        .select('id, draft_name, created_at, updated_at')
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return drafts.map(draft => ({
        id: draft.id,
        name: draft.draft_name,
        created_at: draft.created_at,
        updated_at: draft.updated_at,
      }));

    } catch (error) {
      console.error('Error listing drafts:', error);
      return [];
    }
  }, [tenant?.id, supabase]);

  // Delete draft
  const deleteDraft = useCallback(async (draftId: string) => {
    if (!tenant?.id || !supabase) return false;

    try {
      const { error } = await supabase
        .from('offering_drafts')
        .delete()
        .eq('id', draftId)
        .eq('tenant_id', tenant.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }, [tenant?.id, supabase]);

  return {
    isPublishing,
    publishingError,
    saveDraft,
    publishImmediately,
    schedulePublishing,
    loadDraft,
    listDrafts,
    deleteDraft,
  };
}

// Helper function to generate product instances
function generateProductInstances(productId: string, scheduling: any) {
  const instances = [];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // Generate 3 months of instances

  // This is a simplified version - you'd want more sophisticated scheduling logic
  if (scheduling.recurringPattern?.frequency === 'weekly') {
    const daysOfWeek = scheduling.recurringPattern.daysOfWeek || [1]; // Default to Monday
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (daysOfWeek.includes(date.getDay())) {
        instances.push({
          product_id: productId,
          start_time: new Date(date.setHours(9, 0, 0, 0)).toISOString(), // 9 AM
          end_time: new Date(date.setHours(17, 0, 0, 0)).toISOString(), // 5 PM
          max_quantity: 24, // Default capacity
          available_quantity: 24,
          status: 'active',
        });
      }
    }
  }

  return instances;
} 