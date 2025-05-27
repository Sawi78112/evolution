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

    // Profile will be created automatically by Supabase trigger
    console.log('✅ User created successfully! Profile will be created by database trigger.')

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