import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { assignDefaultRole } from '@/lib/auth/role-service'

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
    } catch (_error) {
      // Ignore errors from this check - let Supabase Auth handle it
    }

    // Get the correct redirect URL for production
    const getRedirectUrl = () => {
      // In production, use the request headers to get the correct domain
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const host = request.headers.get('host')
      
      if (forwardedHost) {
        return `${forwardedProto || 'https'}://${forwardedHost}`
      } else if (host) {
        return `${forwardedProto || 'https'}://${host}`
      } else {
        return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }
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
        emailRedirectTo: `${getRedirectUrl()}/auth/callback`
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

    // Now wait for the trigger to create the user profile and assign default role
    try {
      // Use service client for role assignment
      const serviceClient = createServiceSupabaseClient()
      
      // Wait a moment for the trigger to create the user profile
      // Then assign the default "Investigator" role
      console.log('Waiting for user profile to be created by trigger...')
      
      // Small delay to ensure trigger completes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify the user profile was created by the trigger
      const { data: userProfile, error: profileCheckError } = await serviceClient
        .from('users')
        .select('user_id, username')
        .eq('user_id', authData.user.id)
        .single()

      if (profileCheckError || !userProfile) {
        console.error('User profile not found after trigger execution:', profileCheckError)
        console.log('User auth created but profile creation by trigger failed. Role assignment skipped.')
      } else {
        console.log('User profile created successfully by trigger:', userProfile)

        // Assign default "Investigator" role to the user
        const roleResult = await assignDefaultRole(authData.user.id)
        
        if (!roleResult.success) {
          console.error('Failed to assign default role:', roleResult.error)
          console.log('User created but role assignment failed. Role can be assigned later.')
        } else {
          console.log('Default Investigator role assigned successfully')
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      console.log('User auth created but role assignment failed. Role can be assigned later.')
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