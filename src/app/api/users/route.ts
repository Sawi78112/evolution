import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'username';
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
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

    // Get current user from auth header to check their role and division
    const authHeader = request.headers.get('authorization');
    let currentUser = null;
    let currentUserRole = null;
    let currentUserDivision = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          currentUser = user;
          
          // Get current user's profile and roles
          const { data: userProfile } = await supabase
            .from('users')
            .select('division_id')
            .eq('user_id', user.id)
            .single();
          
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('roles:role_id (role_name)')
            .eq('user_id', user.id);
          
          currentUserDivision = userProfile?.division_id;
          const roles = userRoles?.map(ur => (ur as any).roles?.role_name).filter(Boolean) || [];
          
          // Check if user is Administrator or Divisional Manager
          if (roles.includes('Administrator')) {
            currentUserRole = 'Administrator';
          } else if (roles.includes('Divisional Manager')) {
            currentUserRole = 'Divisional Manager';
          }

          // Debug logging for division filtering
          console.log('🔍 Current user division filtering:', {
            userId: user.id,
            roles: roles,
            currentUserRole: currentUserRole,
            currentUserDivision: currentUserDivision,
            willApplyDivisionFilter: currentUserRole === 'Divisional Manager'
          });
        }
      } catch (error) {
        console.warn('Failed to get current user from token:', error);
      }
    }

    // Build the base query
    let query = supabase
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
      `, { count: 'exact' });

    // Apply division filter for Divisional Managers
    let shouldReturnEmptyResults = false;
    
    if (currentUserRole === 'Divisional Manager') {
      if (currentUserDivision) {
        // Show only users from the same division
        console.log('🔒 Applying division filter for Divisional Manager:', currentUserDivision);
        query = query.eq('division_id', currentUserDivision);
      } else {
        // If Divisional Manager has no division, show no users
        console.log('🚫 Divisional Manager has no division - showing 0 users');
        shouldReturnEmptyResults = true;
      }
    } else {
      console.log('👤 Administrator or other role - showing all users');
    }
    // Administrators can see all users (no additional filter)

    // If we should return empty results, skip the database query
    if (shouldReturnEmptyResults) {
      return NextResponse.json({
        success: true,
        data: [], // Empty array
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          limit,
          hasNext: false,
          hasPrev: false
        },
        filters: {
          search: search || null,
          status: status || null
        },
        sorting: {
          field: sortField,
          direction: sortDirection
        }
      });
    }

    // Apply search filter - we'll do comprehensive search client-side
    // Don't apply database-level search to avoid conflicts

    // Apply status filter
    if (status.trim()) {
      query = query.eq('user_status', status);
    }

    // Apply sorting
    const sortMap: Record<string, string> = {
      'username': 'username',
      'abbreviation': 'user_abbreviation',
      'division': 'divisions(name)',
      'manager': 'manager(username)',
      'lastLogin': 'last_login',
      'status': 'user_status',
      'email': 'office_email'
    };

    const dbSortField = sortMap[sortField] || 'username';
    
    // Handle special sorting for joined tables
    if (sortField === 'division') {
      // For division sorting, we need to sort by the actual division name
      // But since it's a join, we'll handle this in the client-side custom sorting
      query = query.order('username', { ascending: sortDirection === 'asc' }); // Default fallback
    } else if (sortField === 'manager') {
      // Similar issue with manager sorting - handle in client
      query = query.order('username', { ascending: sortDirection === 'asc' }); // Default fallback  
    } else {
      query = query.order(dbSortField, { ascending: sortDirection === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    // Get roles for each user
    const userIds = users?.map(user => user.user_id) || [];
    let rolesByUser: Record<string, string[]> = {};

    if (userIds.length > 0) {
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

      // Group roles by user_id
      rolesByUser = userRoles?.reduce((acc, userRole) => {
        const userId = userRole.user_id;
        if (!acc[userId]) {
          acc[userId] = [];
        }
        const roleName = (userRole as any).roles?.role_name;
        if (roleName) {
          acc[userId].push(roleName);
        }
        return acc;
      }, {} as Record<string, string[]>) || {};
    }

    // Custom sorting for roles
    const roleOrder = ['Administrator', 'Divisional Manager', 'Analyst', 'Investigator', 'System Support'];
    const statusOrder = ['Active', 'Transferred', 'Inactive', 'Canceled'];

    // Format the response data (without row numbers initially)
    let formattedUsers = users?.map((user, index) => ({
      id: user.user_id,
      // Don't assign 'no' here - we'll do it after sorting
      username: user.username,
      abbreviation: user.user_abbreviation,
      avatar_url: user.avatar_url,
      division: (user as any).divisions?.name || 'None',
      manager: (user as any).manager 
        ? `${(user as any).manager.username} - ${(user as any).manager.user_abbreviation}`
        : 'None',
      lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      lastLoginRaw: user.last_login, // Keep raw date for sorting
      status: user.user_status,
      email: user.office_email,
      roles: rolesByUser[user.user_id] || []
    })) || [];

    // Apply comprehensive client-side search if search term provided
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      formattedUsers = formattedUsers.filter(user => {
        return (
          // Search in username
          user.username.toLowerCase().includes(searchLower) ||
          // Search in abbreviation
          user.abbreviation.toLowerCase().includes(searchLower) ||
          // Search in roles
          user.roles.some(role => role.toLowerCase().includes(searchLower)) ||
          // Search in division
          user.division.toLowerCase().includes(searchLower) ||
          // Search in manager
          user.manager.toLowerCase().includes(searchLower) ||
          // Search in last login (formatted date)
          (user.lastLogin && user.lastLogin.toLowerCase().includes(searchLower)) ||
          // Search in status
          user.status.toLowerCase().includes(searchLower) ||
          // Search in email
          user.email.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply custom sorting for roles, status, division, and manager
    if (sortField === 'roles') {
      formattedUsers.sort((a, b) => {
        // Role hierarchy for sorting
        const roleOrder = ['Administrator', 'Divisional Manager', 'Analyst', 'Investigator', 'System Support'];
        
        // Helper function to get the primary (highest priority) role
        const getPrimaryRole = (roles: string[]) => {
          for (const role of roleOrder) {
            if (roles.includes(role)) {
              return role;
            }
          }
          return roles[0]; // fallback
        };
        
        const aPrimaryRole = getPrimaryRole(a.roles);
        const bPrimaryRole = getPrimaryRole(b.roles);
        
        // First sort by primary role
        const aPrimaryIndex = roleOrder.indexOf(aPrimaryRole);
        const bPrimaryIndex = roleOrder.indexOf(bPrimaryRole);
        
        if (aPrimaryIndex !== bPrimaryIndex) {
          return sortDirection === 'asc' ? aPrimaryIndex - bPrimaryIndex : bPrimaryIndex - aPrimaryIndex;
        }
        
        // If primary roles are the same, sort by number of roles (fewer first)
        if (a.roles.length !== b.roles.length) {
          return sortDirection === 'asc' 
            ? a.roles.length - b.roles.length
            : b.roles.length - a.roles.length;
        }
        
        // If same primary role and same number of roles, maintain stable sort
        return 0;
      });
    } else if (sortField === 'status') {
      formattedUsers.sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      });
    } else if (sortField === 'division') {
      formattedUsers.sort((a, b) => {
        // Handle "None" division - should come last
        if (a.division === 'None' && b.division !== 'None') {
          return sortDirection === 'asc' ? 1 : -1;
        }
        if (b.division === 'None' && a.division !== 'None') {
          return sortDirection === 'asc' ? -1 : 1;
        }
        
        const comparison = a.division.localeCompare(b.division);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortField === 'manager') {
      formattedUsers.sort((a, b) => {
        // Handle "None" manager - should come last
        if (a.manager === 'None' && b.manager !== 'None') {
          return sortDirection === 'asc' ? 1 : -1;
        }
        if (b.manager === 'None' && a.manager !== 'None') {
          return sortDirection === 'asc' ? -1 : 1;
        }
        
        const comparison = a.manager.localeCompare(b.manager);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortField === 'lastLogin') {
      formattedUsers.sort((a, b) => {
        // Handle null/undefined lastLogin - should come last
        if (!a.lastLoginRaw && !b.lastLoginRaw) return 0;
        if (!a.lastLoginRaw) return sortDirection === 'asc' ? 1 : -1;
        if (!b.lastLoginRaw) return sortDirection === 'asc' ? -1 : 1;
        
        const aDate = new Date(a.lastLoginRaw).getTime();
        const bDate = new Date(b.lastLoginRaw).getTime();
        
        // For lastLogin, most recent should come first when ascending (recent activity is "higher priority")
        return sortDirection === 'asc' ? bDate - aDate : aDate - bDate;
      });
    }

    // Calculate pagination metadata based on filtered results
    const totalCount = search.trim() ? formattedUsers.length : (count || 0);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Apply pagination to search results if search is applied
    if (search.trim()) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      formattedUsers = formattedUsers.slice(startIndex, endIndex);
    }

    // NOW assign row numbers AFTER all sorting, filtering, and pagination
    // This ensures the "No" column always shows 1, 2, 3... for the current page
    formattedUsers = formattedUsers.map((user, index) => ({
      ...user,
      no: ((page - 1) * limit) + index + 1
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev
      },
      filters: {
        search: search || null,
        status: status || null
      },
      sorting: {
        field: sortField,
        direction: sortDirection
      }
    });

  } catch (error) {
    console.error('💥 Error in users API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status, roles, username, abbreviation, division, email } = body;

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

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId is required' },
        { status: 400 }
      );
    }

    // Handle comprehensive user update (from edit modal)
    if (username || abbreviation || division || email || status || (roles && Array.isArray(roles))) {
      let divisionId = null;
      let managerId = null;

      // If division is provided, get division ID and manager ID
      if (division) {
        if (division === 'None') {
          // Handle "None" as a special case - set division_id and manager_user_id to NULL
          divisionId = null;
          managerId = null;
        } else {
          const { data: divisionData, error: divisionError } = await supabase
            .from('divisions')
            .select('division_id, manager_user_id')
            .eq('name', division)
            .single();

          if (divisionError || !divisionData) {
            return NextResponse.json(
              { error: `Division "${division}" not found`, details: divisionError?.message },
              { status: 400 }
            );
          }

          divisionId = divisionData.division_id;
          managerId = divisionData.manager_user_id;
        }
      }

      // Update user basic information in users table
      const updateData: any = {
        last_updated_at: new Date().toISOString()
      };

      if (username) updateData.username = username.trim();
      if (abbreviation) updateData.user_abbreviation = abbreviation.trim().toUpperCase();
      if (email) {
        updateData.office_email = email.trim();
        console.log('📧 Updating email in users table:', email.trim());
      }
      if (status) updateData.user_status = status;
      if (division) {
        // Always update division fields when division is provided (including "None")
        updateData.division_id = divisionId;
        updateData.manager_user_id = managerId;
      }

      console.log('📝 Users table update data:', updateData);

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating user information:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user information', details: updateError.message },
          { status: 500 }
        );
      }

      console.log('✅ Users table updated successfully');

      // Update Supabase Auth user email if email is provided
      if (email) {
        console.log('📧 Updating auth user email:', email.trim());
        
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          userId,
          { 
            email: email.trim(),
            email_confirm: true // Auto-confirm the new email
          }
        );

        if (authUpdateError) {
          console.error('❌ Error updating auth user email:', authUpdateError);
          // Note: We don't return here because the users table was updated successfully
          // The auth email update failure is logged but doesn't fail the entire operation
          console.warn('⚠️ Auth email update failed, but users table was updated successfully');
        } else {
          console.log('✅ Auth user email updated successfully');
        }
      }

      // Handle roles update if provided
      if (roles && Array.isArray(roles)) {
        // Get role IDs from role names
        console.log('🔍 Looking up roles in database:', roles);
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('role_id, role_name')
          .in('role_name', roles);

        console.log('📊 Role lookup result:', {
          rolesError,
          rolesData,
          requestedCount: roles.length,
          foundCount: rolesData?.length || 0
        });

        if (rolesError || !rolesData || rolesData.length !== roles.length) {
          console.error('❌ Role lookup failed:', {
            rolesError,
            expectedRoles: roles,
            foundRoles: rolesData?.map(r => r.role_name) || [],
            expectedCount: roles.length,
            foundCount: rolesData?.length || 0
          });
          
          return NextResponse.json(
            { 
              error: 'One or more roles not found',
              details: rolesError?.message || `Expected ${roles.length} roles, found ${rolesData?.length || 0}`,
              requestedRoles: roles,
              foundRoles: rolesData?.map(r => r.role_name) || []
            },
            { status: 400 }
          );
        }

        // First, delete existing user roles
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('❌ Error deleting existing user roles:', deleteError);
          return NextResponse.json(
            { error: 'Failed to delete existing user roles', details: deleteError.message },
            { status: 500 }
          );
        }

        // Then, create new role assignments if roles array is not empty
        if (roles.length > 0) {
          const userRoleInserts = rolesData.map(role => ({
            user_id: userId,
            role_id: role.role_id
          }));

          const { error: insertError } = await supabase
            .from('user_roles')
            .insert(userRoleInserts);

          if (insertError) {
            console.error('❌ Error inserting new user roles:', insertError);
            return NextResponse.json(
              { error: 'Failed to assign new roles to user', details: insertError.message },
              { status: 500 }
            );
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `User updated successfully`
      });
    }

    // Handle legacy status-only update
    if (status) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          user_status: status,
          last_updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating user status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user status', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `User status updated to ${status}`
      });
    }

    // Handle legacy roles-only update
    if (roles && Array.isArray(roles)) {
      // Get role IDs from role names
      console.log('🔍 Looking up roles in database:', roles);
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('role_id, role_name')
        .in('role_name', roles);

      console.log('📊 Role lookup result:', {
        rolesError,
        rolesData,
        requestedCount: roles.length,
        foundCount: rolesData?.length || 0
      });

      if (rolesError || !rolesData || rolesData.length !== roles.length) {
        console.error('❌ Role lookup failed:', {
          rolesError,
          expectedRoles: roles,
          foundRoles: rolesData?.map(r => r.role_name) || [],
          expectedCount: roles.length,
          foundCount: rolesData?.length || 0
        });
        
        return NextResponse.json(
          { 
            error: 'One or more roles not found',
            details: rolesError?.message || `Expected ${roles.length} roles, found ${rolesData?.length || 0}`,
            requestedRoles: roles,
            foundRoles: rolesData?.map(r => r.role_name) || []
          },
          { status: 400 }
        );
      }

      // First, delete existing user roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error deleting existing user roles:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete existing user roles', details: deleteError.message },
          { status: 500 }
        );
      }

      // Then, create new role assignments if roles array is not empty
      if (roles.length > 0) {
        const userRoleInserts = rolesData.map(role => ({
          user_id: userId,
          role_id: role.role_id
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(userRoleInserts);

        if (insertError) {
          console.error('❌ Error inserting new user roles:', insertError);
          return NextResponse.json(
            { error: 'Failed to assign new roles to user', details: insertError.message },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: `User roles updated successfully`
      });
    }

    return NextResponse.json(
      { error: 'No valid update operation specified. Provide username, abbreviation, division, email, status, or roles.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('💥 Error in user update API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId is required' },
        { status: 400 }
      );
    }

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

    // First, delete user roles
    const { error: rolesDeleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesDeleteError) {
      console.error('❌ Error deleting user roles:', rolesDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user roles', details: rolesDeleteError.message },
        { status: 500 }
      );
    }

    // Then, delete the user from database
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (userDeleteError) {
      console.error('❌ Error deleting user:', userDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user', details: userDeleteError.message },
        { status: 500 }
      );
    }

    // Finally, delete the auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('❌ Error deleting auth user:', authDeleteError);
      // Don't return error here as the database user is already deleted
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error in user delete API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 User creation API called');
  
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlStart: supabaseUrl?.substring(0, 20) + '...' || 'Not set'
    });
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { 
          error: 'Server configuration error: Missing Supabase environment variables',
          debug: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceKey: !!serviceRoleKey
          }
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

    // Parse request body
    const body = await request.json();
    console.log('📝 Request body received:', {
      username: body.username,
      division: body.division,
      roles: body.roles,
      email: body.email
    });
    
    const { 
      username, 
      abbreviation, 
      roles, 
      division, 
      email, 
      officePhone, 
      homePhone, 
      homeAddress, 
      status, 
      password 
    } = body;

    // Validate required fields
    if (!username || !abbreviation || !roles || !Array.isArray(roles) || roles.length === 0 || !division || !email || !officePhone || !status || !password) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { 
          error: 'Missing required fields: username, abbreviation, roles, division, email, officePhone, status, and password are required'
        },
        { status: 400 }
      );
    }

    console.log('✅ All required fields validated');

    // Step 1: Get division ID and manager ID from division name
    console.log('🔍 Looking up division:', division);
    const { data: divisionData, error: divisionError } = await supabase
      .from('divisions')
      .select('division_id, manager_user_id')
      .eq('name', division)
      .single();

    console.log('📊 Division lookup result:', { divisionData, divisionError });

    if (divisionError || !divisionData) {
      return NextResponse.json(
        { 
          error: `Division "${division}" not found`,
          details: divisionError?.message
        },
        { status: 400 }
      );
    }

    // Step 1.5: Validate that the manager exists if division has one
    if (divisionData.manager_user_id) {
      console.log('🔍 Validating manager exists:', divisionData.manager_user_id);
      const { data: managerData, error: managerError } = await supabase
        .from('users')
        .select('user_id, username')
        .eq('user_id', divisionData.manager_user_id)
        .single();

      console.log('📊 Manager validation result:', { managerData, managerError });

      if (managerError || !managerData) {
        return NextResponse.json(
          { 
            error: `Manager assigned to division "${division}" does not exist in users table`,
            details: `Manager ID ${divisionData.manager_user_id} not found`,
            suggestion: 'Please update the division to assign an existing manager or set manager to null'
          },
          { status: 400 }
        );
      }
      console.log('✅ Manager validation passed:', managerData.username);
    } else {
      console.log('ℹ️ Division has no manager assigned');
    }

    // Step 2: Get role IDs from role names
    console.log('🔍 Looking up roles:', roles);
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('role_id, role_name')
      .in('role_name', roles);

    console.log('📊 Roles lookup result:', { rolesData, rolesError });

    if (rolesError || !rolesData || rolesData.length !== roles.length) {
      return NextResponse.json(
        { 
          error: 'One or more roles not found',
          details: rolesError?.message || `Expected ${roles.length} roles, found ${rolesData?.length || 0}`,
          requestedRoles: roles,
          foundRoles: rolesData?.map(r => r.role_name) || []
        },
        { status: 400 }
      );
    }

    // Step 3: Hash the password
    console.log('🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Step 4: Create auth user first (since user_id is FK to auth.users)
    console.log('👤 Creating auth user first...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username.trim(),
        user_abbreviation: abbreviation.trim().toUpperCase(),
        full_name: username.trim(), // This will set the display name in auth.users
        display_name: username.trim() // Alternative field for display name
      }
    });

    console.log('📊 Auth user creation result:', { 
      authUser: authUser ? { id: authUser.user?.id, email: authUser.user?.email } : null, 
      authError 
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { 
          error: 'Failed to create authentication user',
          details: authError?.message || 'No auth user returned'
        },
        { status: 500 }
      );
    }

    // Step 5: Update/create the database user record using auth user ID
    const userData = {
      user_id: authUser.user.id, // Use auth user ID as foreign key
      username: username.trim(),
      user_abbreviation: abbreviation.trim().toUpperCase(),
      division_id: divisionData.division_id,
      manager_user_id: divisionData.manager_user_id || null,
      office_email: email.trim(),
      office_phone: officePhone.trim(),
      user_status: status,
      home_phone: homePhone?.trim() || null,
      location: homeAddress?.trim() || null,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    };

    console.log('👤 Updating database user with data:', {
      ...userData,
      password_hash: '[REDACTED]'
    });

    // Use upsert (INSERT ... ON CONFLICT UPDATE) since auth user creation may auto-create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select('user_id, username, office_email')
      .single();

    console.log('📊 Database user upsert result:', { newUser, userError });

    if (userError) {
      // If database user creation fails, clean up the auth user
      console.error('❌ Database user creation failed, cleaning up auth user...');
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      return NextResponse.json(
        { 
          error: 'Failed to create database user record',
          details: userError.message,
          code: userError.code,
          hint: userError.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ Database user created successfully, creating role assignments...');

    // Step 6: Create role assignments
    const userRoleInserts = rolesData.map(role => ({
      user_id: authUser.user.id, // Use auth user ID
      role_id: role.role_id
    }));

    console.log('🎭 Creating role assignments:', userRoleInserts);

    const { error: userRolesError } = await supabase
      .from('user_roles')
      .insert(userRoleInserts);

    if (userRolesError) {
      console.error('❌ Role assignment failed, cleaning up...');
      // Clean up both database user and auth user
      await supabase.from('users').delete().eq('user_id', authUser.user.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        { 
          error: 'Failed to assign roles to user',
          details: userRolesError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Role assignments created successfully');
    console.log('🎉 User creation completed successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        username: newUser.username,
        email: newUser.office_email,
        roles: roles,
        division: division
      },
      message: `User "${username}" has been successfully created and assigned ${roles.length} role(s). Login credentials have been sent to ${email}.`
    });

  } catch (error) {
    console.error('💥 User creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 