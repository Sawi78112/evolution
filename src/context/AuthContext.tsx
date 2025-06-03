"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { AuthService, UserProfile, SignUpData } from '@/lib/auth/auth-service'

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState({
    user: null as User | null,
    profile: null as UserProfile | null,
    session: null as Session | null,
    loading: true,
    error: null as string | null
  })

  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { user, profile } = await AuthService.getCurrentUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      setState({
        user,
        profile,
        session,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }, [])

  useEffect(() => {
    // Get initial session
    refreshUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, !!session)
        
        if (event === 'SIGNED_IN') {
          // For sign in, get user immediately but profile in background
          setState(prev => ({
            ...prev,
            user: session?.user || null,
            session,
            loading: false,
            error: null
          }))
          
          // Get profile in background
          AuthService.getCurrentUser().then(({ user, profile }) => {
            setState(prev => ({
              ...prev,
              user,
              profile
            }))
          }).catch(error => {
            console.warn('Failed to get user profile:', error)
          })
        } else if (event === 'TOKEN_REFRESHED') {
          // For token refresh, just update session
          console.log('🔄 Token refreshed successfully')
          setState(prev => ({
            ...prev,
            session,
            loading: false
          }))
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          })
        } else if (event === 'USER_UPDATED') {
          console.log('👤 User updated')
          setState(prev => ({
            ...prev,
            user: session?.user || null,
            session
          }))
        }
      }
    )

    // Add periodic session check to prevent unexpected logouts
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session check error:', error)
          // Only sign out for actual auth errors, not network errors
          if (!error.message.includes('Failed to fetch') && 
              !error.message.includes('NetworkError') && 
              !error.message.includes('fetch')) {
            console.log('🚨 Session invalid, signing out')
            setState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: null
            })
          }
        } else if (!session && state.user) {
          console.log('🚨 No session found, user should be signed out')
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.warn('Session check failed:', error)
        // Don't sign out on network errors - keep user logged in
      }
    }, 120000) // Check every 2 minutes instead of 1 minute

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
    }
  }, [refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await AuthService.signIn({ email, password })
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error! }))
        return { success: false, error: result.error }
      }

      // The auth state will be updated by the onAuthStateChange listener
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Call the API route instead of AuthService
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        let errorMessage = result.error || 'Sign up failed';
        
        // Provide more user-friendly error messages
        if (errorMessage.includes('Database error saving new user')) {
          errorMessage = 'There was an issue creating your account. Please contact the administrator for assistance.';
        } else if (errorMessage.includes('Email already exists') || errorMessage.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (errorMessage.includes('Username already exists')) {
          errorMessage = 'This username is already taken. Please try a different name combination.';
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('Password')) {
          // Keep password-related errors as they are
          errorMessage = errorMessage;
        }
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }

      setState(prev => ({ ...prev, loading: false }))
      return { success: true, message: result.message }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await AuthService.signOut()
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error! }))
        return { success: false, error: result.error }
      }

      // The auth state will be updated by the onAuthStateChange listener
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const result = await AuthService.resetPassword({ email })
      
      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }))
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const result = await AuthService.updatePassword({ password })
      
      if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }))
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshUser,
    hasRole: (_role: string) => true,
    hasPermission: (_permission: string) => true
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!user) {
      // This should be handled by middleware, but as a fallback
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
      return null
    }

    return <Component {...props} />
  }
}

// Hook for checking if user has specific permissions
export function usePermissions() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within an AuthProvider')
  }

  const hasRole = (_role: string) => {
    // This would integrate with your roles system
    // For now, returning true as placeholder
    return true
  }

  const hasPermission = (_permission: string) => {
    // This would integrate with your permissions system
    // For now, returning true as placeholder
    return true
  }

  const isManager = () => {
    // This would need to access profile from context state
    return true
  }

  const isActive = () => {
    // This would need to access profile from context state
    return true
  }

  const isLocked = () => {
    // This would need to access profile from context state
    return false
  }

  return {
    hasRole,
    hasPermission,
    isManager,
    isActive,
    isLocked
  }
} 