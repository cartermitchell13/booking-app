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
  bucket: string = 'tenant-assets'
): Promise<string> => {
  try {
    // Generate a unique filename to avoid collisions
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${path}${timestamp}-${randomString}.${fileExtension}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file to storage:', error);
      throw error;
    }
    
    // Generate a public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
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
  bucket: string = 'tenant-assets'
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
    return uploadImageToStorage(file, path, bucket);
  } catch (error) {
    console.error('Error in uploadDataUrlToStorage:', error);
    throw error;
  }
};
