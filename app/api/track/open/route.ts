/**
 * API Route: Track Email Opens
 * GET /api/track/open
 * 
 * Returns a 1x1 transparent pixel and records the open event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issue')
    const subscriberId = searchParams.get('subscriber')

    if (issueId && subscriberId) {
      const supabase = createAdminClient()

      // Check if already recorded (prevent duplicate opens)
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('issue_id', issueId)
        .eq('subscriber_id', subscriberId)
        .eq('type', 'opened')
        .single()

      if (!existing) {
        // Record open event
        await supabase.from('events').insert({
          issue_id: issueId,
          subscriber_id: subscriberId,
          type: 'opened',
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          metadata: {
            timestamp: new Date().toISOString(),
          },
        })
      }
    }

    // Return tracking pixel
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error tracking open:', error)
    // Still return pixel even if tracking fails
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }
}

