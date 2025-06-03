import { supabase } from './client';

export interface UpdateUserProfileData {
  firstName: string;
  lastName: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface UpdateOfficialInfoData {
  abbreviation: string;
  officeEmail: string;
  officePhone: string;
}

export interface UpdateAddressInfoData {
  homeEmail?: string;
  homePhone?: string;
  location?: string;
}

export interface UpdateUserProfileResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Update user avatar URL in the users table
 */
export async function updateUserAvatar(
  userId: string, 
  avatarUrl: string
): Promise<UpdateUserProfileResult> {
  try {
    console.log('🔧 Updating user avatar URL for user:', userId);
    console.log('📝 New avatar URL:', avatarUrl);

    const { data, error } = await supabase
      .from('users')
      .update({ 
        avatar_url: avatarUrl,
        last_updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update user avatar error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    console.log('✅ User avatar URL updated successfully in users table');
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('❌ Update user avatar exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get user avatar URL from users table
 */
export async function getUserAvatar(userId: string) {
  try {
    console.log('🔍 Getting user avatar for user:', userId);

    const { data, error } = await supabase
      .from('users')
      .select('avatar_url, last_updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Get user avatar error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    const avatarUrl = data.avatar_url || '/images/default-avatar.svg';
    console.log('✅ User avatar retrieved:', avatarUrl);

    return { 
      success: true, 
      data: {
        avatarUrl: avatarUrl,
        updatedAt: data.last_updated_at
      }
    };
  } catch (error) {
    console.error('❌ Get user avatar exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Update user profile in the database
 */
export async function updateUserProfile(
  userId: string, 
  profileData: UpdateUserProfileData
): Promise<UpdateUserProfileResult> {
  try {
    // Combine first name and last name to create username
    const username = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
    
    // Prepare the update data
    const updateData: Record<string, unknown> = {
      username,
      last_updated_at: new Date().toISOString()
    };

    // Add social links if provided (using the correct column names from database)
    if (profileData.linkedinUrl !== undefined) {
      updateData.linkedin_link = profileData.linkedinUrl.trim() || null;
    }
    if (profileData.twitterUrl !== undefined) {
      updateData.x_link = profileData.twitterUrl.trim() || null; // Note: using x_link for Twitter
    }
    if (profileData.facebookUrl !== undefined) {
      updateData.facebook_link = profileData.facebookUrl.trim() || null;
    }
    if (profileData.instagramUrl !== undefined) {
      updateData.instagram_link = profileData.instagramUrl.trim() || null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update user profile error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Update user profile exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Update office information in the database
 */
export async function updateOfficialInfo(
  userId: string, 
  officialData: UpdateOfficialInfoData
): Promise<UpdateUserProfileResult> {
  try {
    // Validate abbreviation
    const abbreviation = officialData.abbreviation.trim().toUpperCase();
    if (abbreviation.length !== 4) {
      return { 
        success: false, 
        error: 'Abbreviation must be exactly 4 letters' 
      };
    }
    
    if (!/^[A-Z]{4}$/.test(abbreviation)) {
      return { 
        success: false, 
        error: 'Abbreviation must contain only uppercase letters' 
      };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officialData.officeEmail.trim())) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      };
    }

    // Validate phone (basic validation)
    if (!officialData.officePhone.trim()) {
      return { 
        success: false, 
        error: 'Office phone is required' 
      };
    }
    
    // Prepare the update data
    const updateData = {
      user_abbreviation: abbreviation,
      office_email: officialData.officeEmail.trim(),
      office_phone: officialData.officePhone.trim(),
      last_updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update official info error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Update official info exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Update address information in the database
 */
export async function updateAddressInfo(
  userId: string, 
  addressData: UpdateAddressInfoData
): Promise<UpdateUserProfileResult> {
  try {
    // Prepare the update data
    const updateData: Record<string, unknown> = {
      last_updated_at: new Date().toISOString()
    };

    // Add fields if provided (allow empty strings to clear fields)
    if (addressData.homeEmail !== undefined) {
      const homeEmail = addressData.homeEmail.trim();
      if (homeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(homeEmail)) {
        return { 
          success: false, 
          error: 'Please enter a valid home email address' 
        };
      }
      // Database expects an array format for home_email
      updateData.home_email = homeEmail ? [homeEmail] : null;
    }
    
    if (addressData.homePhone !== undefined) {
      const homePhone = addressData.homePhone.trim();
      // Database expects an array format for home_phone
      updateData.home_phone = homePhone ? [homePhone] : null;
    }
    
    if (addressData.location !== undefined) {
      updateData.location = addressData.location.trim() || null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update address info error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Update address info exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        username,
        user_abbreviation,
        division_id,
        office_email,
        office_phone,
        home_email,
        home_phone,
        location,
        user_status,
        last_updated_at,
        linkedin_link,
        x_link,
        facebook_link,
        instagram_link
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get user profile exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 