import { supabase } from '@/lib/supabase/client'
import type { User, Session, EmailOtpType, SupabaseClient } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  abbreviation: string
  divisionId?: string
  managerId?: string
  officePhone: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export interface AuthResponse {
  user?: User | null
  session?: Session | null
  message: string
  error?: string
}

export interface UserProfile {
  user_id: string
  username: string
  user_abbreviation: string
  division_id: string
  manager_user_id: string | null
  office_email: string
  office_phone: string
  home_email: string[] | null
  home_phone: string[] | null
  location: string | null
  department: string | null
  user_status: 'Active' | 'Inactive' | 'Transferred' | 'Canceled'
  transferred_to_user_id: string | null
  delegated_from_user_id: string | null
  last_login: string | null
  last_logout: string | null
  login_attempts: number | null
  is_locked: boolean | null
  two_factor_enabled: boolean
  two_factor_method: 'Email' | 'SMS' | 'App' | null
  password_reset_questions: unknown | null
  created_at: string
  last_updated_at: string | null
  audit_trail_ids: string[]
}

export class AuthService {
  // Sign up new user (client-side only)
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Validate input data - removed divisionId requirement
      if (!data.email || !data.password || !data.username || !data.abbreviation) {
        throw new Error('Missing required fields')
      }

      // Check if username or email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username, office_email')
        .or(`username.eq.${data.username},office_email.eq.${data.email}`)
        .single()

      if (existingUser) {
        if (existingUser.username === data.username) {
          throw new Error('Username already exists')
        }
        if (existingUser.office_email === data.email) {
          throw new Error('Email already exists')
        }
      }

      // Create the auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      // Profile will be created automatically by Supabase trigger
      console.log('✅ User created successfully! Profile will be created by database trigger.')

      return {
        user: authData.user,
        session: authData.session,
        message: 'User created successfully. Please check your email to verify your account.'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Sign in user (client-side only)
  static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required')
      }

      // Authenticate with Supabase Auth first (fastest operation)
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!authData.user) {
        throw new Error('Invalid credentials')
      }

      // After successful authentication, update user profile in background
      // Don't wait for this to complete to improve performance
      this.updateUserProfileAsync(data.email, authData.user.id)

      return {
        user: authData.user,
        session: authData.session,
        message: 'Signed in successfully'
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Background async function to update user profile (doesn't block login)
  private static async updateUserProfileAsync(email: string, authUserId: string) {
    try {
      // Check if user profile exists and update it
      const { data: userData } = await supabase
        .from('users')
        .select('user_id, login_attempts, is_locked, user_status')
        .eq('office_email', email)
        .single()

      if (userData) {
        // Update existing profile
        await supabase
          .from('users')
          .update({ 
            user_id: authUserId, // Ensure user_id matches auth user
            user_status: 'Active',
            last_login: new Date().toISOString(),
            login_attempts: 0,
            is_locked: false,
            last_updated_at: new Date().toISOString()
          })
          .eq('office_email', email)
      }
    } catch (error) {
      console.error('Background profile update error:', error)
      // Don't throw error as this shouldn't block the login process
    }
  }

  // Sign out user (client-side only)
  static async signOut(): Promise<AuthResponse> {
    try {
      // Update last logout time
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('users')
          .update({ 
            last_logout: new Date().toISOString(),
            last_updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Signed out successfully' }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Reset password (client-side only)
  static async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      if (!data.email) {
        throw new Error('Email is required')
      }

      // Send reset email directly through Supabase Auth (no need to check custom users table)
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Password reset email sent successfully' }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Update password (client-side only)
  static async updatePassword(data: UpdatePasswordData): Promise<AuthResponse> {
    try {
      if (!data.password) {
        throw new Error('Password is required')
      }

      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Password updated successfully' }
    } catch (error) {
      console.error('Update password error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Get current user (client-side only)
  static async getCurrentUser(): Promise<{ user: User | null; profile: UserProfile | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { user: null, profile: null }
      }

      // Try to get profile by user_id first (fastest)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profile) {
        return { user, profile }
      }

      // If not found by user_id, try by email (fallback)
      if (user.email) {
        const { data: profileByEmail, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('office_email', user.email)
          .single()

        if (!emailError && profileByEmail) {
          // Update user_id in background (don't wait)
          this.updateUserIdAsync(user.email, user.id)
          return { user, profile: profileByEmail }
        }
      }

      return { user, profile: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, profile: null }
    }
  }

  // Background function to update user_id (doesn't block UI)
  private static async updateUserIdAsync(email: string, userId: string) {
    try {
      await supabase
        .from('users')
        .update({ user_id: userId })
        .eq('office_email', email)
    } catch (error) {
      console.error('Background user_id update error:', error)
    }
  }

  // Verify email (client-side only)
  static async verifyEmail(token: string, type: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as EmailOtpType
      })

      if (error) {
        throw new Error(error.message)
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Email verified successfully'
      }
    } catch (error) {
      console.error('Verify email error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Resend verification email (client-side only)
  static async resendVerification(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Verification email sent successfully' }
    } catch (error) {
      console.error('Resend verification error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Update user profile (client-side only)
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          last_updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        throw new Error(error.message)
      }

      return { message: 'Profile updated successfully' }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  // Check if user has permission (client-side only)
  static async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // This would integrate with your roles and permissions system
      // For now, returning true as a placeholder
      return true
    } catch (error) {
      console.error('Check permission error:', error)
      return false
    }
  }

  // Lock/unlock user account (client-side only)
  static async toggleUserLock(userId: string, isLocked: boolean): Promise<AuthResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_locked: isLocked,
          login_attempts: isLocked ? 0 : undefined,
          last_updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        throw new Error(error.message)
      }

      return { 
        message: `User account ${isLocked ? 'locked' : 'unlocked'} successfully` 
      }
    } catch (error) {
      console.error('Toggle user lock error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}

// Server-side authentication utilities
// These should only be used in API routes or server components
export class ServerAuthService {
  // Get current user (server-side only)
  static async getServerUser(supabaseServerClient: SupabaseClient): Promise<{ user: User | null; profile: UserProfile | null }> {
    try {
      const { data: { user }, error } = await supabaseServerClient.auth.getUser()
      
      if (error || !user) {
        return { user: null, profile: null }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseServerClient
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return { user, profile: null }
      }

      return { user, profile }
    } catch (error) {
      console.error('Get server user error:', error)
      return { user: null, profile: null }
    }
  }
} 