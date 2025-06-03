import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get current user from auth header
    const authHeader = request.headers.get('authorization');
    let currentUser = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          currentUser = user;
        }
      } catch (error) {
        console.warn('Failed to get current user from token:', error);
      }
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_id, username, user_abbreviation, division_id')
      .eq('user_id', currentUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: profileError.message },
        { status: 500 }
      );
    }

    // Get user roles with join to roles table
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (
          role_name,
          role_description
        )
      `)
      .eq('user_id', currentUser.id);

    if (userRolesError) {
      console.error('Error fetching user roles:', userRolesError);
      return NextResponse.json(
        { error: 'Failed to fetch user roles', details: userRolesError.message },
        { status: 500 }
      );
    }

    // Extract role names
    const roleNames = userRoles?.map(ur => (ur as any).roles?.role_name).filter(Boolean) || [];

    // Create response with appropriate caching headers
    const response = NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        profile: userProfile
      },
      roles: roleNames,
      divisionId: userProfile.division_id
    });

    // Add caching headers to prevent unnecessary requests
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('💥 Error in user-roles API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 