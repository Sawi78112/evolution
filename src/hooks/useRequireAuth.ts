'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to protect routes that require authentication
 * @param redirectTo The path to redirect to if not authenticated (default: /signin)
 * @returns Object with isAuthenticated status and loading state
 */
export function useRequireAuth(redirectTo = '/signin') {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Wait until auth state is loaded
    if (!loading) {
      setAuthChecked(true);
      
      // If not authenticated, redirect to signin
      if (!isAuthenticated) {
        // Include the current path as a redirect parameter
        const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, loading, pathname, redirectTo, router]);

  return { 
    isAuthenticated, 
    isLoading: loading || !authChecked 
  };
} 

type RequireAdminOptions = {
  redirectTo?: string;
  redirectIfNotAdmin?: boolean;
  nonAdminRedirectTo?: string;
};

/**
 * Hook to protect routes that require admin privileges
 * @param options Configuration options
 * @param options.redirectTo The path to redirect to if not authenticated (default: /signin)
 * @param options.redirectIfNotAdmin Whether to redirect non-admin users (default: false)
 * @param options.nonAdminRedirectTo The path to redirect to if authenticated but not admin (default: /)
 * @returns Object with isAdmin status, unauthorized flag, and loading state
 */
export function useRequireAdmin(options: RequireAdminOptions = {}) {
  const { 
    redirectTo = '/signin', 
    redirectIfNotAdmin = false, 
    nonAdminRedirectTo = '/' 
  } = options;
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  
  const isAuthenticated = !!user;
  // For now, all authenticated users are considered admin
  // You can modify this logic based on your user roles system
  const isAdmin = isAuthenticated;
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    // Wait until auth state is loaded
    if (!loading) {
      setAuthChecked(true);
      
      // If not authenticated, redirect to signin
      if (!isAuthenticated) {
        const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        return;
      }
      
      // If authenticated but not admin
      if (!isAdmin) {
        if (redirectIfNotAdmin) {
          // Redirect to specified path if redirectIfNotAdmin is true
          router.push(nonAdminRedirectTo);
        } else {
          // Otherwise mark as unauthorized to show message
          setIsUnauthorized(true);
        }
      } else {
        setIsUnauthorized(false);
      }
    }
  }, [isAuthenticated, loading, isAdmin, pathname, redirectTo, nonAdminRedirectTo, redirectIfNotAdmin, router]);

  return { 
    isAdmin,
    isAuthenticated, 
    isUnauthorized,
    isLoading: loading || !authChecked 
  };
} 