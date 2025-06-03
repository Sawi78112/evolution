import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const excludeManagers = searchParams.get('excludeManagers') === 'true';
    const includeDivisionId = searchParams.get('includeDivisionId'); // For edit mode - include current manager

    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables for Supabase');
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables',
          details: 'Please check .env.local file'
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // First, get the Administrator role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role_id')
      .eq('role_name', 'Administrator')
      .single();

    if (roleError || !roleData) {
      console.error('Failed to fetch Administrator role:', roleError);
      return NextResponse.json(
        { 
          error: 'Administrator role not found',
          details: roleError?.message || 'No Administrator role in database'
        },
        { status: 404 }
      );
    }

    // Then get users with that role
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', roleData.role_id);

    if (userRoleError) {
      console.error('Failed to fetch user roles:', userRoleError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch user roles',
          details: userRoleError.message
        },
        { status: 500 }
      );
    }

    if (!userRoleData || userRoleData.length === 0) {
      return NextResponse.json([]);
    }

    // Extract user IDs
    const userIds = userRoleData.map(ur => ur.user_id);

    // Get users who are already division managers (if excludeManagers is true)
    let existingManagerIds: string[] = [];
    if (excludeManagers) {
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('divisions')
        .select('manager_user_id')
        .not('manager_user_id', 'is', null);

      if (divisionsError) {
        console.error('Failed to fetch existing managers:', divisionsError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch existing managers',
            details: divisionsError.message
          },
          { status: 500 }
        );
      }

      existingManagerIds = divisionsData?.map(d => d.manager_user_id).filter(Boolean) || [];

      // If includeDivisionId is provided, get the current manager and remove from exclusion list
      if (includeDivisionId) {
        const { data: currentDivision, error: currentDivisionError } = await supabase
          .from('divisions')
          .select('manager_user_id')
          .eq('division_id', includeDivisionId)
          .single();

        if (!currentDivisionError && currentDivision?.manager_user_id) {
          // Remove current division's manager from exclusion list so they can remain as manager
          existingManagerIds = existingManagerIds.filter(id => id !== currentDivision.manager_user_id);
        }
      }
    }

    // Filter out existing managers if excludeManagers is true
    const availableUserIds = excludeManagers 
      ? userIds.filter(id => !existingManagerIds.includes(id))
      : userIds;

    if (availableUserIds.length === 0) {
      return NextResponse.json([]);
    }

    // Finally, get the user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, username, user_abbreviation')
      .in('user_id', availableUserIds)
      .order('username', { ascending: true });

    if (userError) {
      console.error('Failed to fetch users:', userError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch users',
          details: userError.message
        },
        { status: 500 }
      );
    }

    // Map the response to match the expected interface
    const mappedData = userData?.map(user => ({
      id: user.user_id,
      username: user.username,
      abbreviation: user.user_abbreviation
    })) || [];

    return NextResponse.json(mappedData);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 