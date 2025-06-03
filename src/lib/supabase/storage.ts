import { createClient } from '@supabase/supabase-js';
import { updateUserAvatar } from './user-service';

interface UploadAvatarParams {
  userId: string;
  file: Blob;
  fileName: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload user avatar to Supabase storage
 */
export const uploadAvatar = async ({ userId, file, fileName }: UploadAvatarParams): Promise<UploadResult> => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Missing Supabase configuration' };
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Ensure unique filename
    const finalFileName = fileName.includes(userId) ? fileName : `avatar-${userId}-${Date.now()}.jpg`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('avatar')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return { 
        success: false, 
        error: `Upload failed: ${error.message}` 
      };
    }

    // Generate signed URL with 1 year expiration
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('avatar')
      .createSignedUrl(finalFileName, 31536000); // 1 year

    if (signedUrlError) {
      return { success: false, error: `Failed to generate signed URL: ${signedUrlError.message}` };
    }

    // Update user's avatar_url in the database
    const updateResult = await supabase
      .from('users')
      .update({ avatar_url: signedUrlData.signedUrl })
      .eq('user_id', userId);

    if (updateResult.error) {
      return { success: false, error: `Failed to update user avatar URL: ${updateResult.error.message}` };
    }

    return { 
      success: true, 
      url: signedUrlData.signedUrl 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown upload error' 
    };
  }
};

/**
 * Delete user avatar from Supabase storage
 */
export const deleteAvatar = async (userId: string, fileName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Missing Supabase configuration' };
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.storage
      .from('avatar')
      .remove([fileName]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown delete error' 
    };
  }
};

/**
 * Convert base64 data URL to Blob
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}; 