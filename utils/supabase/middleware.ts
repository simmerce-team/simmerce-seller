import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getClaims()

  // Get the user's session
  const { data } = await supabase.auth.getClaims()
  
  // Debug log
  console.log('Auth data:', data)
  console.log('Request path:', request.nextUrl.pathname)
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/', // Root path
    '/auth', // Match /auth and /auth/
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/_next',
    '/favicon.ico',
    '/api/auth/callback',
  ]
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => {
    const isMatch = request.nextUrl.pathname === path || 
                   request.nextUrl.pathname.startsWith(`${path}/`)
    console.log(`Checking path ${path} against ${request.nextUrl.pathname}: ${isMatch}`)
    return isMatch
  })
  
  console.log('Is public path:', isPublicPath)
  
  // If user is not authenticated and trying to access a protected route
  if (!data && !isPublicPath) {
    console.log('Redirecting to auth - not authenticated and path is not public')
    // Create a redirect URL to the login page
    const redirectUrl = new URL('/auth', request.url)
    // Store the original URL the user was trying to access
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    
    // Don't redirect if we're already on the auth page to prevent loops
    if (!request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (data && request.nextUrl.pathname.startsWith('/auth')) {
    // Skip redirect for auth callback routes
    if (!request.nextUrl.pathname.startsWith('/auth/callback')) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}