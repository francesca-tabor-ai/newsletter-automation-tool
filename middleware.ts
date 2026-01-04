import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAppRoute = request.nextUrl.pathname.startsWith('/app')
  const isRootRoute = request.nextUrl.pathname === '/'

  // If user is logged in and trying to access auth pages, redirect to /app
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // If user is logged in and trying to access root, redirect to /app
  if (user && isRootRoute) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // If user is not logged in and trying to access /app, redirect to /auth/login
  if (!user && isAppRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
