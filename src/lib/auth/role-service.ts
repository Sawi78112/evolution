import { createServiceSupabaseClient } from '@/lib/supabase/server'

export interface RoleAssignmentResult {
  success: boolean
  error?: string
}

/**
 * Assigns the default "Investigator" role to a new user
 * @param userId - The UUID of the newly created user
 * @returns Promise<RoleAssignmentResult>
 */
export async function assignDefaultRole(userId: string): Promise<RoleAssignmentResult> {
  try {
    // Use service client for elevated permissions (bypasses RLS)
    const serviceClient = createServiceSupabaseClient()
    
    // First, get the "Investigator" role ID dynamically
    const { data: investigatorRole, error: roleQueryError } = await serviceClient
      .from('roles')
      .select('role_id')
      .eq('role_name', 'Investigator')
      .single()

    if (roleQueryError || !investigatorRole) {
      console.error('Error finding Investigator role:', roleQueryError)
      return {
        success: false,
        error: `Failed to find Investigator role: ${roleQueryError?.message || 'Role not found'}`
      }
    }

    // Insert the user role relationship
    const { error: roleError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: investigatorRole.role_id
      })

    if (roleError) {
      console.error('Error assigning default role:', roleError)
      return {
        success: false,
        error: `Failed to assign default role: ${roleError.message}`
      }
    }

    console.log('Default Investigator role assigned successfully to user:', userId)
    return { success: true }

  } catch (error) {
    console.error('Role assignment error:', error)
    return {
      success: false,
      error: `Unexpected error during role assignment: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Gets all roles for a specific user
 * @param userId - The UUID of the user
 * @returns Promise with user roles data
 */
export async function getUserRoles(userId: string) {
  try {
    const serviceClient = createServiceSupabaseClient()
    
    const { data, error } = await serviceClient
      .from('user_roles')
      .select(`
        role_id,
        roles (
          role_id,
          role_name,
          role_description
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user roles:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
} 