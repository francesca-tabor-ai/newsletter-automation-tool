/**
 * API Route: Send Issue
 * POST /api/send/issue
 * 
 * Sends a newsletter issue to all active subscribers via SendGrid
 */

import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildEmailTemplate, buildPlainTextEmail } from '@/lib/email-template'
import { generateUnsubscribeUrl } from '@/lib/unsubscribe-token'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

interface SendResult {
  subscriberId: string
  email: string
  success: boolean
  messageId?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { issueId, orgId, newsletterId } = await request.json()

    if (!issueId || !orgId || !newsletterId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    // 1. Fetch issue with items
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select(`
        id,
        title,
        intro_md,
        status,
        newsletter_id,
        sent_at
      `)
      .eq('id', issueId)
      .single()

    if (issueError || !issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Check if already sent
    if (issue.status === 'sent' && issue.sent_at) {
      return NextResponse.json(
        { error: 'Issue has already been sent' },
        { status: 400 }
      )
    }

    // 2. Fetch newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      )
    }

    // 3. Fetch issue items
    const { data: issueItems, error: itemsError } = await supabase
      .from('issue_items')
      .select(`
        id,
        position,
        removed,
        custom_title,
        custom_summary,
        items (
          id,
          title,
          url,
          summary,
          author,
          published_at,
          sources (
            name
          )
        )
      `)
      .eq('issue_id', issueId)
      .order('position', { ascending: true })

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch issue items' },
        { status: 500 }
      )
    }

    const activeItems = (issueItems || []).filter((item) => !item.removed)

    if (activeItems.length === 0) {
      return NextResponse.json(
        { error: 'No active items in this issue' },
        { status: 400 }
      )
    }

    // 4. Fetch active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email, first_name, last_name')
      .eq('newsletter_id', newsletterId)
      .eq('status', 'active')

    if (subscribersError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers to send to' },
        { status: 400 }
      )
    }

    // 5. Send emails
    const results: SendResult[] = []
    const batchSize = 10 // Send in batches to avoid rate limits
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (subscriber) => {
          try {
            // Generate unsubscribe URL
            const unsubscribeUrl = generateUnsubscribeUrl(
              subscriber.id,
              subscriber.email,
              newsletterId,
              BASE_URL
            )

            // Generate tracking pixel URL
            const trackingPixelUrl = `${BASE_URL}/api/track/open?issue=${issueId}&subscriber=${subscriber.id}`

            // Build email HTML
            const htmlContent = buildEmailTemplate({
              newsletter,
              issue,
              items: issueItems || [],
              subscriberEmail: subscriber.email,
              unsubscribeUrl,
              trackingPixelUrl,
              baseUrl: BASE_URL,
            })

            // Build plain text version
            const textContent = buildPlainTextEmail({
              newsletter,
              issue,
              items: issueItems || [],
              subscriberEmail: subscriber.email,
              unsubscribeUrl,
              trackingPixelUrl,
              baseUrl: BASE_URL,
            })

            // Prepare personalization
            const toName = subscriber.first_name
              ? `${subscriber.first_name} ${subscriber.last_name || ''}`.trim()
              : subscriber.email

            // Send via SendGrid
            const msg = {
              to: {
                email: subscriber.email,
                name: toName,
              },
              from: {
                email: newsletter.from_email || 'noreply@example.com',
                name: newsletter.from_name,
              },
              replyTo: newsletter.reply_to || newsletter.from_email || undefined,
              subject: issue.title,
              text: textContent,
              html: htmlContent,
              customArgs: {
                issue_id: issueId,
                subscriber_id: subscriber.id,
                newsletter_id: newsletterId,
              },
              trackingSettings: {
                clickTracking: { enable: false }, // We do our own tracking
                openTracking: { enable: false }, // We do our own tracking
              },
            }

            const [response] = await sgMail.send(msg)
            const messageId = response.headers['x-message-id'] || null

            // Record sent event
            await supabase.from('events').insert({
              issue_id: issueId,
              subscriber_id: subscriber.id,
              type: 'sent',
              metadata: {
                message_id: messageId,
                provider: 'sendgrid',
              },
            })

            return {
              subscriberId: subscriber.id,
              email: subscriber.email,
              success: true,
              messageId,
            }
          } catch (error: any) {
            console.error(`Failed to send to ${subscriber.email}:`, error)
            
            return {
              subscriberId: subscriber.id,
              email: subscriber.email,
              success: false,
              error: error.message,
            }
          }
        })
      )

      results.push(...batchResults)

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // 6. Update issue status
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    await supabase
      .from('issues')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', issueId)

    // 7. Return results
    return NextResponse.json({
      success: true,
      stats: {
        total: subscribers.length,
        sent: successCount,
        failed: failureCount,
      },
      results: results.map((r) => ({
        email: r.email,
        success: r.success,
        error: r.error,
      })),
    })
  } catch (error: any) {
    console.error('Error sending issue:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

