import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🚀 MIDDLEWARE TRIGGERED:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get session to check for password reset flow
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  
  // Debug logging
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    cookies: request.cookies.getAll().map(c => c.name)
  })

  // Check if user is in password reset flow
  // This can happen when they click the reset link from email with type=recovery parameter
  const hasRecoveryParam = request.nextUrl.searchParams.get('type') === 'recovery'
  
  // If user clicks reset link with recovery parameter, redirect to password update page
  if (hasRecoveryParam && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/reset-password/update'
    url.search = '' // Clear the query parameters
    console.log('🔄 Redirecting recovery link user to password update page')
    return NextResponse.redirect(url)
  }
  
  // Handle root route - redirect to signin if not authenticated, allow access if authenticated
  if (pathname === '/') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
    // If authenticated and not in password reset flow, allow access to root page
  }

  // DISABLED: Route protection is now handled by client-side hooks and components
  // This allows for better UX with loading states and proper redirects
  
  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 