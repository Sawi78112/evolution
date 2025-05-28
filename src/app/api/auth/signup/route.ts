import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      abbreviation,
      divisionId,
      managerId,
      officePhone
    } = body

    // Validate required fields - removed divisionId requirement
    if (!email || !password || !firstName || !lastName || !username || !abbreviation || !officePhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate abbreviation length
    if (abbreviation.length !== 4) {
      return NextResponse.json(
        { error: 'User abbreviation must be exactly 4 characters' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Quick email check for better UX (optional, non-blocking)
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('office_email')
        .eq('office_email', email)
        .single()

      if (existingUser) {
        console.log("ExistingUSer : ", existingUser);
        return NextResponse.json(
          { error: 'An account with this email already exists. Please try signing in instead.' },
          { status: 400 }
        )
      }
    } catch (error) {
      // Ignore errors from this check - let Supabase Auth handle it
    }

    // Create the auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          firstName: firstName,
          lastName: lastName,
          abbreviation: abbreviation,
          officePhone: officePhone
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError
      })
      
      // Handle specific error cases
      let errorMessage = authError.message;
      
      if (authError.message.includes('User already registered') || 
          authError.message.includes('email address is already registered') || 
          authError.message.includes('already been registered') ||
          authError.message.includes('Email rate limit exceeded') ||
          authError.status === 422) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('Auth data:', authData)
      return NextResponse.json(
        { error: 'Failed to create user - no user returned from auth' },
        { status: 500 }
      )
    }

    // Check if this is a fake/obfuscated user (indicates email already exists)
    // When email confirmation is enabled, Supabase returns a fake user with empty identities
    if (authData.user.identities && authData.user.identities.length === 0) {
      console.log('Detected fake user object - email already exists')
      return NextResponse.json(
        { error: 'An account with this email already exists. Please try signing in instead.' },
        { status: 400 }
      )
    }

    console.log('Auth user created:', {
      id: authData.user.id,
      email: authData.user.email,
      user_metadata: authData.user.user_metadata,
      identities: authData.user.identities,
      identitiesLength: authData.user.identities?.length,
      created_at: authData.user.created_at,
      idType: typeof authData.user.id,
      idLength: authData.user.id?.length
    })

    // Validate that we have a proper UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!authData.user.id || !uuidRegex.test(authData.user.id)) {
      console.error('Invalid user ID format:', authData.user.id)
      return NextResponse.json(
        { error: 'Invalid user ID format returned from auth service' },
        { status: 500 }
      )
    }

    // Now create the user profile in the database
    try {
      // Get or create a default division (using 'Alpha' as default)
      let defaultDivisionId = divisionId;
      
      if (!defaultDivisionId) {
        // Try to find an existing division first
        const { data: existingDivision } = await supabase
          .from('divisions')
          .select('division_id')
          .eq('name', 'Alpha')
          .single()

        if (existingDivision) {
          defaultDivisionId = existingDivision.division_id;
        } else {
          // Create a default division if none exists
          const { data: newDivision, error: divisionError } = await supabase
            .from('divisions')
            .insert({
              name: 'Alpha',
              code: 'ALPHA',
              region: 'Default'
            })
            .select('division_id')
            .single()

          if (divisionError) {
            console.error('Error creating default division:', divisionError)
            // Continue without division for now
            defaultDivisionId = null;
          } else {
            defaultDivisionId = newDivision.division_id;
          }
        }
      }

      // Create user profile in the database
      const userProfileData = {
        user_id: authData.user.id,
        username: username,
        user_abbreviation: abbreviation,
        password_hash: 'supabase_auth', // Placeholder since we use Supabase Auth
        office_email: email,
        office_phone: officePhone,
        user_status: 'Active' as const,
        two_factor_enabled: true,
        audit_trail_ids: [],
        ...(defaultDivisionId && { division_id: defaultDivisionId }),
        ...(managerId && { manager_user_id: managerId })
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert(userProfileData)
        .select()
        .single()

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't fail the signup if profile creation fails, but log it
        console.log('User auth created but profile creation failed. User can still sign in.')
      } else {
        console.log('User profile created successfully:', userProfile)

        // Assign default "Investigator" role to the user
        const investigatorRoleId = 'eda74b0a-4ed4-481c-b7e3-3db501957c34'; // Investigator role UUID
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: investigatorRoleId,
            is_active: true
          })

        if (roleError) {
          console.error('Error assigning default role:', roleError)
          // Don't fail the signup if role assignment fails, but log it
          console.log('User created but role assignment failed. Role can be assigned later.')
        } else {
          console.log('Default Investigator role assigned successfully')
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      // Don't fail the signup if database operations fail
      console.log('User auth created but database profile creation failed. User can still sign in.')
    }

    console.log('✅ User created successfully!')

    return NextResponse.json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: authData.user
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 