import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, type } = body

    // Validate required fields
    if (!token || !type) {
      return NextResponse.json(
        { error: 'Token and type are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.verifyEmail(token, type)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      user: result.user,
      session: result.session
    })

  } catch (error) {
    console.error('Verify email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 