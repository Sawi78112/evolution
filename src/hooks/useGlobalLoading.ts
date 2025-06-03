"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleContext } from '@/context/RoleContext';

interface GlobalLoadingState {
  isLoading: boolean;
  message: string;
  phase: 'auth' | 'roles' | 'security' | 'complete';
}

export const useGlobalLoading = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: roleLoading, canAccessSecurity } = useRoleContext();
  
  const [loadingState, setLoadingState] = useState<GlobalLoadingState>({
    isLoading: false,
    message: '',
    phase: 'complete'
  });

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Check if this is a fresh sign-in - ONLY trigger loading for fresh sign-ins
    const justSignedIn = typeof window !== 'undefined' ? sessionStorage.getItem('justSignedIn') : null;
    
    // If no justSignedIn flag, don't show any loading
    if (!justSignedIn) {
      setLoadingState({
        isLoading: false,
        message: 'Ready',
        phase: 'complete'
      });
      setInitialLoadComplete(true);
      return;
    }

    // If we've already completed the initial load, don't show loading again
    if (initialLoadComplete) {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Phase 1: Authentication loading
    if (authLoading) {
      setLoadingState({
        isLoading: true,
        message: 'Authenticating...',
        phase: 'auth'
      });
      return;
    }

    // If no user after auth loading completes, we're not authenticated
    if (!authLoading && !user) {
      setLoadingState({
        isLoading: false,
        message: 'Authentication complete',
        phase: 'complete'
      });
      setInitialLoadComplete(true);
      // Clear the flag
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('justSignedIn');
      }
      return;
    }

    // Phase 2: User is authenticated, now loading roles
    if (user && roleLoading) {
      setLoadingState({
        isLoading: true,
        message: 'Loading user permissions...',
        phase: 'roles'
      });
      return;
    }

    // Phase 3: Roles loaded - show security loading briefly then complete
    if (user && !roleLoading) {
      if (canAccessSecurity()) {
        setLoadingState({
          isLoading: true,
          message: 'Loading security workspace...',
          phase: 'security'
        });

        // Complete after a brief moment
        const timer = setTimeout(() => {
          setLoadingState({
            isLoading: false,
            message: 'Security workspace ready',
            phase: 'complete'
          });
          setInitialLoadComplete(true);
          // Clear the flag
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('justSignedIn');
          }
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        // User doesn't have security access, complete immediately
        setLoadingState({
          isLoading: false,
          message: 'Workspace ready',
          phase: 'complete'
        });
        setInitialLoadComplete(true);
        // Clear the flag
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('justSignedIn');
        }
      }
    }
  }, [authLoading, user, roleLoading, canAccessSecurity, initialLoadComplete]);

  // Reset function for when user logs out and logs back in
  const reset = () => {
    setInitialLoadComplete(false);
    setLoadingState({
      isLoading: true,
      message: 'Authenticating...',
      phase: 'auth'
    });
  };

  return {
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    phase: loadingState.phase,
    reset
  };
};

export default useGlobalLoading; 