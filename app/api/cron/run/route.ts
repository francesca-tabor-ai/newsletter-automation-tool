/**
 * API Route: Cron Job
 * GET /api/cron/run
 * 
 * Automated task runner for scheduled newsletters:
 * 1. Generate draft issues for active schedules
 * 2. Skip issues with no eligible items
 * 3. Send scheduled issues that are due
 * 
 * Protected by CRON_SECRET for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import sgMail from '@sendgrid/mail'
import { buildEmailTemplate, buildPlainTextEmail } from '@/lib/email-template'
import { generateUnsubscribeUrl } from '@/lib/unsubscribe-token'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'change-this-in-production'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface CronResult {
  generatedIssues: Array<{ newsletterId: string; issueId: string; title: string }>
  skippedIssues: Array<{ newsletterId: string; reason: string }>
  sentIssues: Array<{ issueId: string; title: string; sent: number; failed: number }>
  errors: Array<{ context: string; error: string }>
}

/**
 * Generate draft issue for a newsletter
 */
async function generateDraftIssue(
  supabase: any,
  newsletter: any,
  result: CronResult
) {
  try {
    const newsletterId = newsletter.id
    const orgId = newsletter.org_id

    // Check if there's already a draft or frozen issue
    const { data: existingIssue } = await supabase
      .from('issues')
      .select('id, status')
      .eq('newsletter_id', newsletterId)
      .in('status', ['draft', 'frozen'])
      .single()

    if (existingIssue) {
      result.skippedIssues.push({
        newsletterId,
        reason: 'Already has draft/frozen issue',
      })
      return
    }

    // Get active rules
    const { data: rules } = await supabase
      .from('rules')
      .select('*')
      .eq('newsletter_id', newsletterId)
      .single()

    if (!rules) {
      result.skippedIssues.push({
        newsletterId,
        reason: 'No rules configured',
      })
      return
    }

    // Get items from last run until now
    const cutoffDate = new Date(
      newsletter.last_scheduled_run || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).toISOString()

    // Get sources for this newsletter
    const { data: newsletterSources } = await supabase
      .from('newsletter_sources')
      .select('source_id')
      .eq('newsletter_id', newsletterId)

    if (!newsletterSources || newsletterSources.length === 0) {
      result.skippedIssues.push({
        newsletterId,
        reason: 'No sources configured',
      })
      return
    }

    const sourceIds = newsletterSources.map((ns: any) => ns.source_id)

    // Fetch items matching criteria
    let query = supabase
      .from('items')
      .select('*')
      .in('source_id', sourceIds)
      .gte('published_at', cutoffDate)
      .order('published_at', { ascending: false })

    // Apply keyword filters
    if (rules.require_keywords && rules.require_keywords.length > 0) {
      const keywords = rules.require_keywords
      query = query.or(
        keywords
          .map(
            (kw: string) =>
              `title.ilike.%${kw}%,summary.ilike.%${kw}%,content.ilike.%${kw}%`
          )
          .join(',')
      )
    }

    // Apply limit
    const limit = rules.max_items_per_issue || 10
    query = query.limit(limit)

    const { data: items } = await query

    if (!items || items.length === 0) {
      // Create skipped issue
      const { data: skippedIssue } = await supabase
        .from('issues')
        .insert({
          newsletter_id: newsletterId,
          title: `${newsletter.name} - ${new Date().toLocaleDateString()}`,
          status: 'skipped',
          intro_md: 'No new items matched the criteria for this issue.',
        })
        .select()
        .single()

      result.skippedIssues.push({
        newsletterId,
        reason: `No eligible items (marked as skipped)`,
      })
      return
    }

    // Create draft issue
    const issueTitle = `${newsletter.name} - ${new Date().toLocaleDateString()}`
    const { data: newIssue, error: issueError } = await supabase
      .from('issues')
      .insert({
        newsletter_id: newsletterId,
        title: issueTitle,
        status: 'draft',
        intro_md: rules.intro_template || 'Here are your latest updates:',
        scheduled_for: new Date().toISOString(),
      })
      .select()
      .single()

    if (issueError) {
      result.errors.push({
        context: `Generate issue for newsletter ${newsletterId}`,
        error: issueError.message,
      })
      return
    }

    // Add items to issue
    const issueItems = items.map((item: any, index: number) => ({
      issue_id: newIssue.id,
      item_id: item.id,
      position: index,
      removed: false,
    }))

    await supabase.from('issue_items').insert(issueItems)

    result.generatedIssues.push({
      newsletterId,
      issueId: newIssue.id,
      title: issueTitle,
    })
  } catch (error: any) {
    result.errors.push({
      context: `Generate draft for newsletter ${newsletter.id}`,
      error: error.message,
    })
  }
}

/**
 * Send a scheduled issue
 */
async function sendScheduledIssue(supabase: any, issue: any, result: CronResult) {
  try {
    // Fetch newsletter
    const { data: newsletter } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', issue.newsletter_id)
      .single()

    if (!newsletter) {
      result.errors.push({
        context: `Send issue ${issue.id}`,
        error: 'Newsletter not found',
      })
      return
    }

    // Fetch issue items
    const { data: issueItems } = await supabase
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
      .eq('issue_id', issue.id)
      .order('position', { ascending: true })

    const activeItems = (issueItems || []).filter((item: any) => !item.removed)

    if (activeItems.length === 0) {
      result.errors.push({
        context: `Send issue ${issue.id}`,
        error: 'No active items in issue',
      })
      return
    }

    // Fetch active subscribers
    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('id, email, first_name, last_name')
      .eq('newsletter_id', issue.newsletter_id)
      .eq('status', 'active')

    if (!subscribers || subscribers.length === 0) {
      result.errors.push({
        context: `Send issue ${issue.id}`,
        error: 'No active subscribers',
      })
      return
    }

    // Send emails
    let sentCount = 0
    let failedCount = 0
    const batchSize = 10

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async (subscriber: any) => {
          try {
            const unsubscribeUrl = generateUnsubscribeUrl(
              subscriber.id,
              subscriber.email,
              issue.newsletter_id,
              BASE_URL
            )

            const trackingPixelUrl = `${BASE_URL}/api/track/open?issue=${issue.id}&subscriber=${subscriber.id}`

            const htmlContent = buildEmailTemplate({
              newsletter,
              issue,
              items: issueItems || [],
              subscriberEmail: subscriber.email,
              unsubscribeUrl,
              trackingPixelUrl,
              baseUrl: BASE_URL,
            })

            const textContent = buildPlainTextEmail({
              newsletter,
              issue,
              items: issueItems || [],
              subscriberEmail: subscriber.email,
              unsubscribeUrl,
              trackingPixelUrl,
              baseUrl: BASE_URL,
            })

            const toName = subscriber.first_name
              ? `${subscriber.first_name} ${subscriber.last_name || ''}`.trim()
              : subscriber.email

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
                issue_id: issue.id,
                subscriber_id: subscriber.id,
                newsletter_id: issue.newsletter_id,
              },
              trackingSettings: {
                clickTracking: { enable: false },
                openTracking: { enable: false },
              },
            }

            const [response] = await sgMail.send(msg)
            const messageId = response.headers['x-message-id'] || null

            await supabase.from('events').insert({
              issue_id: issue.id,
              subscriber_id: subscriber.id,
              type: 'sent',
              metadata: {
                message_id: messageId,
                provider: 'sendgrid',
                scheduled: true,
              },
            })

            return { success: true }
          } catch (error: any) {
            console.error(`Failed to send to ${subscriber.email}:`, error)
            return { success: false }
          }
        })
      )

      sentCount += batchResults.filter((r) => r.success).length
      failedCount += batchResults.filter((r) => !r.success).length

      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Update issue status
    await supabase
      .from('issues')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', issue.id)

    result.sentIssues.push({
      issueId: issue.id,
      title: issue.title,
      sent: sentCount,
      failed: failedCount,
    })
  } catch (error: any) {
    result.errors.push({
      context: `Send issue ${issue.id}`,
      error: error.message,
    })
  }
}

/**
 * Calculate next scheduled run time
 */
function calculateNextRun(
  scheduleDays: number[],
  scheduleTime: string,
  timezone: string
): Date {
  const now = new Date()
  const [hours, minutes] = scheduleTime.split(':').map(Number)

  // For simplicity, we'll use UTC and add basic timezone offset support
  // In production, use a library like date-fns-tz for proper timezone handling
  
  // Find next matching day
  let nextRun = new Date(now)
  nextRun.setHours(hours, minutes, 0, 0)

  // If today's time has passed, start checking from tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }

  // Find next day that matches schedule
  let attempts = 0
  while (!scheduleDays.includes(nextRun.getDay()) && attempts < 7) {
    nextRun.setDate(nextRun.getDate() + 1)
    attempts++
  }

  return nextRun
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')

    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const result: CronResult = {
      generatedIssues: [],
      skippedIssues: [],
      sentIssues: [],
      errors: [],
    }

    // 1. Find newsletters that need draft generation
    const { data: scheduledNewsletters } = await supabase
      .from('newsletters')
      .select('*')
      .eq('schedule_enabled', true)
      .eq('is_active', true)
      .or(`next_scheduled_run.is.null,next_scheduled_run.lte.${new Date().toISOString()}`)

    if (scheduledNewsletters && scheduledNewsletters.length > 0) {
      for (const newsletter of scheduledNewsletters) {
        await generateDraftIssue(supabase, newsletter, result)

        // Update next scheduled run
        const nextRun = calculateNextRun(
          newsletter.schedule_days || [1, 2, 3, 4, 5],
          newsletter.schedule_time || '09:00:00',
          newsletter.schedule_timezone || 'UTC'
        )

        await supabase
          .from('newsletters')
          .update({
            last_scheduled_run: new Date().toISOString(),
            next_scheduled_run: nextRun.toISOString(),
          })
          .eq('id', newsletter.id)
      }
    }

    // 2. Find issues ready to be sent
    const { data: scheduledIssues } = await supabase
      .from('issues')
      .select('*')
      .in('status', ['draft', 'frozen'])
      .lte('scheduled_for', new Date().toISOString())

    if (scheduledIssues && scheduledIssues.length > 0) {
      for (const issue of scheduledIssues) {
        await sendScheduledIssue(supabase, issue, result)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        generated: result.generatedIssues.length,
        skipped: result.skippedIssues.length,
        sent: result.sentIssues.length,
        errors: result.errors.length,
      },
      details: result,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

