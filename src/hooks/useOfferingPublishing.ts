import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant, useTenantSupabase } from '@/lib/tenant-context';
import { OfferingFormData } from './useOfferingForm';
import { uploadDataUrlToStorage } from '@/lib/supabase-storage';

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

// Define a type for the product data structure that matches the DB schema
interface ProductData {
  tenant_id?: string;
  name: string;
  description: string;
  product_type: string;
  status: 'draft' | 'active' | 'scheduled';
  location: string;
  category: string;
  base_price: number;
  currency: string;
  tags: string[];
  image_url?: string;
  product_data: Record<string, any>;
  availability_data: Record<string, any>;
  booking_rules: Record<string, any>;
  seo_data: Record<string, any>;
  publish_at?: string;
}

export function useOfferingPublishing(): UseOfferingPublishingReturn {
  const router = useRouter();
  const { tenant } = useTenant();
  const { supabase } = useTenantSupabase();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingError, setPublishingError] = useState<string | null>(null);

  // Transform form data to database format
  const transformFormDataToProduct = useCallback((formData: OfferingFormData, status: 'draft' | 'active' | 'scheduled'): ProductData => {
    // Safely access nested properties with fallbacks
    const basicInfo = formData.basicInfo || {};
    const pricing = formData.pricing || {};
    const basePricing = pricing.basePricing || {};
    const scheduling = formData.scheduling || {};
    const media = formData.media || {};
    const productConfig = formData.productConfig || {};

    // Format data according to the actual database schema (based on DB inspection)
    const productData: ProductData = {
      tenant_id: tenant?.id,
      name: basicInfo.name || 'Untitled Offering',
      description: basicInfo.description || '',
      product_type: formData.productType || 'open',
      status,
      location: basicInfo.location || '',
      category: basicInfo.category || 'general',
      base_price: Math.round((basePricing.adult || 0) * 100), // Convert to cents
      currency: pricing.currency || 'CAD',
      tags: basicInfo.tags || [], // This is a top-level ARRAY column
      // image_url will be set separately after storage upload
      
      // JSON fields - put duration, difficulty level, and pricing tiers here
      product_data: {
        ...productConfig,
        duration_minutes: basicInfo.duration || 60,
        difficulty_level: basicInfo.difficultyLevel || 'beginner',
        min_age: basicInfo.minAge || 0,
        max_group_size: basicInfo.maxGroupSize || 50,
        // Media gallery - since there's no media_gallery column, store in product_data
        media_gallery: {
          images: media.images || [],
          videos: media.videos || [],
          social_media: media.socialMedia || {}
        },
        // Pricing tiers - since there's no pricing_tiers column, store in product_data
        pricing_tiers: {
          adult: Math.round((basePricing.adult || 0) * 100),
          child: basePricing.child ? Math.round(basePricing.child * 100) : null,
          student: basePricing.student ? Math.round(basePricing.student * 100) : null,
          senior: basePricing.senior ? Math.round(basePricing.senior * 100) : null,
        },
      },
      
      // Scheduling data in availability_data JSON field
      availability_data: {
        schedule_type: scheduling.scheduleType || 'flexible',
        timezone: scheduling.timezone || 'America/Vancouver',
        advance_booking_days: scheduling.advanceBookingDays || 1,
        cutoff_hours: scheduling.cutoffHours || 24,
        recurring_pattern: scheduling.recurringPattern || null,
        blackout_dates: scheduling.blackoutDates || [],
      },
      
      // Booking rules - correct field name is booking_rules not policies
      booking_rules: {
        cancellation_policy: pricing.cancellationPolicy || 'standard',
        deposit_required: pricing.depositRequired || false,
        deposit_amount: pricing.depositAmount || 0,
        tax_inclusive: pricing.taxInclusive || false,
        group_discounts: pricing.groupDiscounts || [],
        seasonal_pricing: pricing.seasonalPricing || [],
      },
      
      // SEO data in its own JSON field
      seo_data: {
        meta_title: basicInfo.name || 'Untitled Offering',
        meta_description: basicInfo.description || '',
        slug: (basicInfo.name || 'untitled-offering').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        keywords: media.seoData?.keywords || [],
      }
    };
    
    return productData;
  }, [tenant?.id]);

  // Handle image uploads to Supabase Storage
  const uploadProductImage = useCallback(async (images: any[]): Promise<string | null> => {
    if (!tenant?.id || !images || images.length === 0) {
      console.log('No images to upload or missing tenant ID');
      return null;
    }
    
    // Add a timeout to prevent hanging forever
    const uploadPromise = new Promise<string | null>(async (resolve, reject) => {
      try {
        const firstImage = images[0];
        
        // Handle string data URLs
        if (typeof firstImage === 'string' && firstImage.startsWith('data:')) {
          console.log('📸 Uploading string image to Supabase Storage...');
          const url = await uploadDataUrlToStorage(
            firstImage,
            'product-image-' + Date.now(),
            `products/${tenant.id}/`,
            'tenant-assets'
          );
          console.log('✅ String image uploaded successfully');
          resolve(url);
          return;
        }
        
        // Handle object with URL property
        if (typeof firstImage === 'object' && firstImage !== null) {
          const url = firstImage.url;
          if (typeof url === 'string' && url.startsWith('data:')) {
            console.log('📸 Uploading object image to Supabase Storage...');
            const uploadedUrl = await uploadDataUrlToStorage(
              url,
              'product-image-' + Date.now(),
              `products/${tenant.id}/`,
              'tenant-assets'
            );
            console.log('✅ Object image uploaded successfully');
            resolve(uploadedUrl);
            return;
          } else if (typeof url === 'string') {
            // It's already a valid URL
            console.log('✅ Using existing URL:', url.substring(0, 30) + '...');
            resolve(url);
            return;
          }
        }
        
        console.log('⚠️ No valid image format found, using null');
        resolve(null);
      } catch (error) {
        console.error('❌ Failed to upload image:', error);
        // Don't reject as we want to continue with publishing
        resolve(null);
      }
    });
    
    // Set a 30-second timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise<string | null>((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ Image upload timed out after 30 seconds');
        resolve(null);
      }, 30000); // 30 seconds timeout
    });
    
    // Return the first promise to resolve (either upload completes or timeout)
    return Promise.race([uploadPromise, timeoutPromise]);
  }, [tenant?.id]);

  // Save draft to database
  const saveDraft = useCallback(async (formData: OfferingFormData, draftName?: string) => {
    if (!tenant?.id || !supabase) {
      return { success: false };
    }

    try {
      const draftData = {
        tenant_id: tenant.id,
        draft_name: draftName || `Draft - ${formData.basicInfo?.name || 'Untitled'} - ${new Date().toLocaleDateString()}`,
        form_data: formData,
      };

      const { data, error } = await supabase
        .from('offering_drafts')
        .insert(draftData)
        .select('id')
        .single();

      if (error) throw error;

      // Save draft ID in local storage to continue editing
      sessionStorage.setItem('current-draft-id', data.id);

      return { success: true, draftId: data.id };
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false };
    }
  }, [tenant?.id, supabase]);

  // Publish immediately
  const publishImmediately = useCallback(async (formData: OfferingFormData) => {
    console.log('🔍 DEBUG: publishImmediately called');
    console.log('🔍 DEBUG: tenant?.id:', tenant?.id);
    console.log('🔍 DEBUG: supabase available:', !!supabase);
    
    if (!tenant?.id || !supabase) {
      console.error('❌ DEBUG: Missing tenant or supabase');
      return { success: false };
    }

    console.log('🔍 DEBUG: Setting isPublishing to true');
    setIsPublishing(true);
    setPublishingError(null);

    try {
      console.log('🚀 Publishing offering for tenant:', tenant.id);
      console.log('🔍 DEBUG: Form data structure:', {
        hasBasicInfo: !!formData.basicInfo,
        hasMedia: !!formData.media,
        hasScheduling: !!formData.scheduling,
        hasPricing: !!formData.pricing,
        productType: formData.productType
      });
      
      // 1. First, if we have an image, upload it to Supabase Storage
      const images = formData.media?.images || [];
      console.log('🔍 DEBUG: Starting image upload process');
      console.log('🔍 DEBUG: Images array length:', images.length);
      console.log('🔍 DEBUG: First image type:', images[0] ? typeof images[0] : 'no images');
      
      const imageUrl = await uploadProductImage(images);
      console.log('🔍 DEBUG: Image upload completed, URL:', imageUrl ? 'URL received' : 'no URL');
      
      // 2. Transform form data to database structure
      console.log('🔍 DEBUG: Starting form data transformation');
      const product = transformFormDataToProduct(formData, 'active');
      console.log('🔍 DEBUG: Form data transformation completed');
      
      // 3. Set the image_url to the uploaded image's public URL
      if (imageUrl) {
        product.image_url = imageUrl;
        console.log('🔍 DEBUG: Image URL set on product');
      }

      console.log('📦 Product data:', JSON.stringify(product, null, 2));

      // 4. Insert the product into the database
      console.log('🔍 DEBUG: Starting database insert');
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('id')
        .single();
      console.log('🔍 DEBUG: Database insert completed, error:', !!error, 'data:', !!data);

      if (error) throw error;
      
      // Create initial product instances if scheduling data exists
      console.log('🔍 DEBUG: Checking if product instances need to be created');
      console.log('🔍 DEBUG: Schedule type:', formData.scheduling?.scheduleType);
      console.log('🔍 DEBUG: Has recurring pattern:', !!formData.scheduling?.recurringPattern);
      
      if (formData.scheduling.scheduleType === 'fixed' && formData.scheduling.recurringPattern) {
        console.log('🔍 DEBUG: Generating product instances');
        // Generate instances based on recurring pattern
        const instances = generateProductInstances(data.id, formData.scheduling);
        console.log('🔍 DEBUG: Generated instances count:', instances.length);
        
        if (instances.length > 0) {
          console.log('🔍 DEBUG: Inserting product instances');
          const { error: instanceError } = await supabase
            .from('product_instances')
            .insert(instances);
            
          if (instanceError) {
            console.warn('Failed to create product instances:', instanceError);
            // Continue anyway, the main product was created
          } else {
            console.log('🔍 DEBUG: Product instances created successfully');
          }
        }
      }
      
      // Clear localStorage draft
      console.log('🔍 DEBUG: Clearing localStorage draft');
      localStorage.removeItem('offering-form-draft');
      
      console.log('🔍 DEBUG: Publishing completed successfully');
      return { success: true, productId: data.id };
    } catch (error: any) {
      console.log('🔍 DEBUG: Error caught in publishImmediately');
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
      
      console.log('🔍 DEBUG: Setting publishing error:', errorMessage);
      setPublishingError(errorMessage);
      return { success: false };
    } finally {
      console.log('🔍 DEBUG: Finally block - setting isPublishing to false');
      setIsPublishing(false);
    }
  }, [tenant?.id, supabase, transformFormDataToProduct, uploadProductImage]);

  // Schedule publishing
  const schedulePublishing = useCallback(async (formData: OfferingFormData, scheduledDate: string) => {
    if (!tenant?.id || !supabase) {
      return { success: false };
    }

    setIsPublishing(true);
    setPublishingError(null);

    try {
      console.log('🗓️ Scheduling offering for:', scheduledDate);
      console.log('For tenant:', tenant.id);

      // 1. First, if we have an image, upload it to Supabase Storage
      const images = formData.media?.images || [];
      const imageUrl = await uploadProductImage(images);
      
      // 2. Transform form data to database structure
      const product = transformFormDataToProduct(formData, 'scheduled');
      
      // 3. Set the image_url to the uploaded image's public URL
      if (imageUrl) {
        product.image_url = imageUrl;
      }
      
      // 4. Add publish date for scheduled publishing
      product.publish_at = new Date(scheduledDate).toISOString();

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('id')
        .single();

      if (error) throw error;

      // Clear localStorage draft
      localStorage.removeItem('offering-form-draft');

      return { success: true, productId: data.id };
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
  }, [tenant?.id, supabase, transformFormDataToProduct, uploadProductImage]);

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
