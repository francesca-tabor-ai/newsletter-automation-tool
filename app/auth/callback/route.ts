import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth/Magic Link errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/auth/callback-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || 'Unknown error')}`,
        requestUrl.origin
      )
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Failed to exchange code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/auth/callback-error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`,
            requestUrl.origin
          )
        )
      }

      // Success - redirect to app
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    } catch (err) {
      console.error('Exception during code exchange:', err)
      return NextResponse.redirect(
        new URL(
          `/auth/callback-error?error=exception&description=${encodeURIComponent(String(err))}`,
          requestUrl.origin
        )
      )
    }
  }

  // No code and no error - redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
