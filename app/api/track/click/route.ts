/**
 * API Route: Track Email Clicks
 * GET /api/track/click
 * 
 * Records click event and redirects to the original URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const issueId = searchParams.get('issue')
    const subscriberId = searchParams.get('subscriber')

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url)

    // Record click event (async, don't wait)
    if (issueId && subscriberId) {
      const supabase = createAdminClient()

      supabase.from('events').insert({
        issue_id: issueId,
        subscriber_id: subscriberId,
        type: 'clicked',
        url: decodedUrl,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }).then(() => {
        // Event recorded
      }).catch((error) => {
        console.error('Error recording click event:', error)
      })
    }

    // Redirect to original URL
    return NextResponse.redirect(decodedUrl, 302)
  } catch (error) {
    console.error('Error tracking click:', error)
    
    // Try to redirect anyway
    const url = request.nextUrl.searchParams.get('url')
    if (url) {
      try {
        return NextResponse.redirect(decodeURIComponent(url), 302)
      } catch {
        // If redirect fails, return error
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid URL' },
      { status: 400 }
    )
  }
}

