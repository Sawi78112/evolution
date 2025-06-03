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

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔍 Fetching users with complete information...');

    // Step 1: Get all users with their division and manager information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        user_id,
        username,
        user_abbreviation,
        avatar_url,
        division_id,
        manager_user_id,
        last_login,
        user_status,
        office_email,
        divisions:division_id (
          name
        ),
        manager:manager_user_id (
          username,
          user_abbreviation
        )
      `)
      .order('username', { ascending: true });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    console.log('✅ Users fetched, now getting roles for each user...');

    // Step 2: Get roles for each user
    const userIds = users.map(user => user.user_id);
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles:role_id (
          role_name
        )
      `)
      .in('user_id', userIds);

    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
      return NextResponse.json(
        { error: 'Failed to fetch user roles', details: rolesError.message },
        { status: 500 }
      );
    }

    // Step 3: Group roles by user_id
    const rolesByUser = userRoles.reduce((acc, userRole) => {
      const userId = userRole.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      // Handle the nested roles structure
      const roleName = (userRole as any).roles?.role_name;
      if (roleName) {
        acc[userId].push(roleName);
      }
      return acc;
    }, {} as Record<string, string[]>);

    // Step 4: Combine all data
    const formattedUsers = users.map(user => ({
      id: user.user_id,
      username: user.username,
      abbreviation: user.user_abbreviation,
      avatar_url: user.avatar_url,
      division: (user as any).divisions?.name || 'None',
      manager: (user as any).manager 
        ? `${(user as any).manager.username} - ${(user as any).manager.user_abbreviation}`
        : 'None',
      lastLogin: user.last_login,
      status: user.user_status,
      email: user.office_email,
      roles: rolesByUser[user.user_id] || []
    }));

    console.log(`✅ Successfully formatted ${formattedUsers.length} users with complete data`);

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    });

  } catch (error) {
    console.error('💥 Error in users list API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 