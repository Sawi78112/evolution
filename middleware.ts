import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Check if user is in password reset flow
  // This can happen when they click the reset link from email with type=recovery parameter
  const hasRecoveryParam = request.nextUrl.searchParams.get('type') === 'recovery'
  
  // If user clicks reset link with recovery parameter, redirect to password update page
  if (hasRecoveryParam && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/reset-password/update'
    url.search = '' // Clear the query parameters
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

  // Role-based route protection for security page
  if (pathname.startsWith('/security') && user) {
    try {
      // Create a service client to bypass RLS for role checking
      const serviceClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {
              // No-op for service client
            },
          },
        }
      )

      // Get user roles
      const { data: userRoles, error: rolesError } = await serviceClient
        .from('user_roles')
        .select(`roles:role_id (role_name)`)
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('❌ Error fetching user roles in middleware:', rolesError);
        // Allow access but log error - client-side protection will handle it
      } else {
        const roles = userRoles?.map(ur => (ur as any).roles?.role_name).filter(Boolean) || [];
        const canAccessSecurity = roles.includes('Administrator') || roles.includes('Divisional Manager');

        if (!canAccessSecurity) {
          const url = request.nextUrl.clone()
          url.pathname = '/alerts'
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error('❌ Error in security route protection:', error);
      // Continue to allow access - client-side protection will handle it
    }
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