import { supabase } from './client';
import { updateUserAvatar } from './user-service';

export interface UploadAvatarOptions {
  userId: string;
  file: File | Blob;
  fileName?: string;
}

export interface UploadAvatarResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload user avatar to Supabase storage
 */
export async function uploadAvatar({ 
  userId, 
  file, 
  fileName 
}: UploadAvatarOptions): Promise<UploadAvatarResult> {
  try {
    console.log('🚀 Starting avatar upload for user:', userId);
    console.log('📁 File details:', {
      size: file.size,
      type: file.type || 'unknown'
    });

    // Generate unique filename if not provided
    const timestamp = Date.now();
    const finalFileName = fileName || `avatar-${userId}-${timestamp}.jpg`;
    
    console.log('📝 Uploading file as:', finalFileName);

    // Upload to Supabase storage (avatar bucket already exists)
    const { data, error } = await supabase.storage
      .from('avatar')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: true // Replace existing file if it exists
      });

    if (error) {
      console.error('❌ Upload error details:', {
        message: error.message,
        error: error
      });
      return { success: false, error: error.message };
    }

    console.log('✅ File uploaded successfully:', data);

    // Generate signed URL with 1 year expiration (365 days * 24 hours * 60 minutes * 60 seconds)
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('avatar')
      .createSignedUrl(finalFileName, oneYearInSeconds);

    if (signedUrlError) {
      console.error('❌ Signed URL error:', signedUrlError);
      return { success: false, error: signedUrlError.message };
    }

    console.log('🔗 Signed URL generated (1 year expiration):', signedUrlData.signedUrl);

    // Update the users table with the new avatar URL
    const updateResult = await updateUserAvatar(userId, signedUrlData.signedUrl);
    
    if (!updateResult.success) {
      console.error('❌ Failed to update user avatar URL in database:', updateResult.error);
      return { success: false, error: `Upload successful but failed to update database: ${updateResult.error}` };
    }

    console.log('✅ Avatar URL updated in users table successfully');

    return { 
      success: true, 
      url: signedUrlData.signedUrl 
    };
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete user avatar from Supabase storage
 */
export async function deleteAvatar(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('avatar')
      .remove([fileName]);

    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }

    console.log('✅ Avatar deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return false;
  }
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
} 