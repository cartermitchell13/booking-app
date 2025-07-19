import { supabase } from './supabase';

/**
 * Uploads an image file to the specified Supabase storage bucket
 * @param file - The file object to upload
 * @param path - Optional path within the bucket (e.g., 'products/')
 * @param bucket - Storage bucket name, defaults to 'tenant-assets'
 * @returns Promise with the public URL of the uploaded file
 */
export const uploadImageToStorage = async (
  file: File, 
  path: string = 'products/', 
  bucket: string = 'tenant-assets',
  supabaseClient = supabase
): Promise<string> => {
  try {
    console.log('🔍 DEBUG: Starting uploadImageToStorage');
    console.log('🔍 DEBUG: File name:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('🔍 DEBUG: Target bucket:', bucket, 'Path:', path);
    
    // Generate a unique filename to avoid collisions
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${path}${timestamp}-${randomString}.${fileExtension}`;
    console.log('🔍 DEBUG: Generated unique filename:', uniqueFileName);
    
    // Upload the file to Supabase Storage with timeout
    console.log('🔍 DEBUG: Starting Supabase storage upload...');
    console.log('🔍 DEBUG: Supabase client available:', !!supabase);
    console.log('🔍 DEBUG: Supabase storage available:', !!supabase?.storage);
    
    // First, let's check if the bucket exists and is accessible
    try {
      const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
      console.log('🔍 DEBUG: Available buckets:', buckets?.map(b => b.name));
      if (bucketsError) {
        console.error('🔍 DEBUG: Error listing buckets:', bucketsError);
      }
    } catch (bucketCheckError) {
      console.error('🔍 DEBUG: Failed to check buckets:', bucketCheckError);
    }
    
    // Create upload promise with more aggressive timeout
    const uploadPromise = supabaseClient
      .storage
      .from(bucket)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    // Create timeout promise (reduced to 15 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.log('🚨 DEBUG: Upload timeout triggered after 15 seconds');
        reject(new Error('Upload timeout after 15 seconds'));
      }, 15000);
    });
    
    // Add immediate timeout check
    const immediateTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.log('🚨 DEBUG: Immediate timeout check - upload still pending');
      }, 5000);
    });
    
    console.log('🔍 DEBUG: Starting Promise.race with 15s timeout...');
    
    // Race between upload and timeout
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    const { data, error } = result as any;
    
    console.log('🔍 DEBUG: Supabase upload completed');
    console.log('🔍 DEBUG: Upload data:', data);
    console.log('🔍 DEBUG: Upload error:', error);
    
    if (error) {
      console.error('🚨 DEBUG: Detailed upload error:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    // Generate a public URL for the uploaded file
    console.log('🔍 DEBUG: Generating public URL...');
    const { data: urlData } = supabaseClient
      .storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
    console.log('🔍 DEBUG: Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error);
    throw error;
  }
};

/**
 * Uploads a base64 data URL to Supabase storage by converting it to a File object first
 * @param dataUrl - The base64 data URL to upload
 * @param fileName - Name to use for the file
 * @param path - Optional path within the bucket
 * @param bucket - Storage bucket name, defaults to 'tenant-assets'
 * @returns Promise with the public URL of the uploaded file
 */
export const uploadDataUrlToStorage = async (
  dataUrl: string,
  fileName: string,
  path: string = 'products/',
  bucket: string = 'tenant-assets',
  supabaseClient = supabase
): Promise<string> => {
  try {
    console.log('Starting data URL conversion process');
    
    // Convert data URL to blob directly (safer than using fetch)
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URL format');
    }
    
    // Get mime type from the data URL
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0] || 'image/jpeg';
    console.log('Detected MIME type:', mimeType);
    
    // Convert base64 to binary
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and file
    const blob = new Blob([bytes], { type: mimeType });
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const file = new File([blob], `${safeFileName}.${fileExtension}`, { type: mimeType });
    
    console.log('Created file object, size:', file.size, 'bytes');
    
    // Use the regular upload function
    return uploadImageToStorage(file, path, bucket, supabaseClient);
  } catch (error) {
    console.error('Error in uploadDataUrlToStorage:', error);
    throw error;
  }
};
