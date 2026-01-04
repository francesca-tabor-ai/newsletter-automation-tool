/**
 * API Route: Unsubscribe
 * POST /api/unsubscribe
 * 
 * Processes unsubscribe requests via signed token
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      )
    }

    // Verify token
    const payload = verifyUnsubscribeToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const { subscriberId, email, newsletterId } = payload

    // Update subscriber status
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriberId)
      .eq('newsletter_id', newsletterId)

    if (updateError) {
      console.error('Error unsubscribing:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    // Record unsubscribe event
    await supabase.from('events').insert({
      subscriber_id: subscriberId,
      type: 'unsubscribed',
      metadata: {
        email,
        newsletter_id: newsletterId,
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    })
  } catch (error: any) {
    console.error('Error processing unsubscribe:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

