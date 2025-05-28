import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function POST(_request: Request) {
  try {
    const result = await AuthService.signOut()

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message
    })

  } catch (error) {
    console.error('Signout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 