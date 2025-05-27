// Supabase client configuration
// TODO: Install @supabase/supabase-js and configure with your project details

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          username: string
          user_abbreviation: string
          password_hash: string
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
          password_reset_questions: any | null
          created_at: string
          last_updated_at: string | null
          audit_trail_ids: string[]
        }
        Insert: {
          user_id?: string
          username: string
          user_abbreviation: string
          password_hash: string
          division_id: string
          manager_user_id?: string | null
          office_email: string
          office_phone: string
          home_email?: string[] | null
          home_phone?: string[] | null
          location?: string | null
          department?: string | null
          user_status?: 'Active' | 'Inactive' | 'Transferred' | 'Canceled'
          transferred_to_user_id?: string | null
          delegated_from_user_id?: string | null
          last_login?: string | null
          last_logout?: string | null
          login_attempts?: number | null
          is_locked?: boolean | null
          two_factor_enabled?: boolean
          two_factor_method?: 'Email' | 'SMS' | 'App' | null
          password_reset_questions?: any | null
          created_at?: string
          last_updated_at?: string | null
          audit_trail_ids?: string[]
        }
        Update: {
          user_id?: string
          username?: string
          user_abbreviation?: string
          password_hash?: string
          division_id?: string
          manager_user_id?: string | null
          office_email?: string
          office_phone?: string
          home_email?: string[] | null
          home_phone?: string[] | null
          location?: string | null
          department?: string | null
          user_status?: 'Active' | 'Inactive' | 'Transferred' | 'Canceled'
          transferred_to_user_id?: string | null
          delegated_from_user_id?: string | null
          last_login?: string | null
          last_logout?: string | null
          login_attempts?: number | null
          is_locked?: boolean | null
          two_factor_enabled?: boolean
          two_factor_method?: 'Email' | 'SMS' | 'App' | null
          password_reset_questions?: any | null
          created_at?: string
          last_updated_at?: string | null
          audit_trail_ids?: string[]
        }
      }
    }
  }
} 