import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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