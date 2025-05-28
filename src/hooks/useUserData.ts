"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

export interface UserData {
  user_id: string;
  username: string;
  user_abbreviation: string;
  division_id: string | null;
  division_name?: string;
  office_email: string;
  office_phone: string;
  home_email: string[] | null;
  home_phone: string[] | null;
  location: string | null;
  user_status: 'Active' | 'Inactive' | 'Transferred' | 'Canceled';
  avatar_url?: string | null;
  linkedin_link?: string | null;
  x_link?: string | null;
  facebook_link?: string | null;
  instagram_link?: string | null;
}

export interface UseUserDataReturn {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UserDisplayInfo {
  displayName: string;
  displayEmail: string;
  isFromDatabase: boolean;
}

export interface UseUserDisplayReturn {
  displayInfo: UserDisplayInfo;
  loading: boolean;
}

// Hook for immediate user display information (combines auth + database data)
export function useUserDisplay(): UseUserDisplayReturn {
  const { user } = useAuth();
  const { userData, loading } = useUserData();

  const displayInfo: UserDisplayInfo = {
    displayName: userData?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
    displayEmail: userData?.office_email || user?.email || "user@example.com",
    isFromDatabase: !!userData
  };

  return {
    displayInfo,
    loading: loading && !user // Only show loading if we don't have auth user yet
  };
}

export function useUserData(): UseUserDataReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Test basic connection first
      const { data: _testData, error: testError } = await supabase
        .from('users')
        .select('user_id, username')
        .limit(1);

      if (testError) {
        throw new Error(`Database connection error: ${testError.message}`);
      }

      // Check if we can access any users at all
      const { data: _allUsers, error: allUsersError, count: _count } = await supabase
        .from('users')
        .select('user_id, username, office_email', { count: 'exact' })
        .limit(5);

      if (allUsersError) {
        throw new Error(`Cannot access users table: ${allUsersError.message}. This might be a RLS (Row Level Security) policy issue.`);
      }

      // Try a simple query by user_id first
      const { data: userById, error: _userByIdError } = await supabase
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
          avatar_url,
          linkedin_link,
          x_link,
          facebook_link,
          instagram_link
        `)
        .eq('user_id', user.id);

      // Try query by email
      if (user.email) {
        const { data: userByEmail, error: _userByEmailError } = await supabase
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
            avatar_url,
            linkedin_link,
            x_link,
            facebook_link,
            instagram_link
          `)
          .eq('office_email', user.email);

        // If we found user by email, use that data
        if (userByEmail && userByEmail.length > 0) {
          const userData = userByEmail[0];
          
          // Get division name if needed
          let divisionName = null;
          if (userData.division_id) {
            const { data: divisionData, error: divisionError } = await supabase
              .from('divisions')
              .select('name')
              .eq('division_id', userData.division_id)
              .maybeSingle();

            if (!divisionError && divisionData) {
              divisionName = divisionData.name;
            }
          }

          const transformedData: UserData = {
            ...userData,
            division_name: divisionName
          };
          
          setUserData(transformedData);
          return;
        }
      }

      // If we found user by ID, use that data
      if (userById && userById.length > 0) {
        const userData = userById[0];
        
        // Get division name if needed
        let divisionName = null;
        if (userData.division_id) {
          const { data: divisionData, error: divisionError } = await supabase
            .from('divisions')
            .select('name')
            .eq('division_id', userData.division_id)
            .maybeSingle();

          if (!divisionError && divisionData) {
            divisionName = divisionData.name;
          }
        }

        const transformedData: UserData = {
          ...userData,
          division_name: divisionName
        };
        
        setUserData(transformedData);
        return;
      }

      // If no user found
      throw new Error(`User not found in database. Searched by ID: ${user.id}${user.email ? ` and email: ${user.email}` : ''}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData
  };
}

// Add avatar functionality to existing hooks
export function useUserAvatar() {
  const { userData, loading, refetch } = useUserData();
  const [_error, _setError] = useState<string | null>(null);

  // Get avatar URL from userData (users table) or use default
  const avatarUrl = userData?.avatar_url || '/images/default-avatar.svg';

  // Function to refresh avatar (triggers userData refetch)
  const refreshAvatar = async () => {
    console.log('🔄 Refreshing avatar data...');
    await refetch();
  };

  return {
    avatarUrl,
    loading,
    error: _error,
    refreshAvatar
  };
} 