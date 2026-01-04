/**
 * Server Actions for Analytics
 */

'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Check if user is a member of the organization
 */
async function checkOrgAccess(orgId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', orgId)
    .single()

  return !!data
}

/**
 * Get analytics for a newsletter
 */
export async function getNewsletterAnalytics(
  orgId: string,
  newsletterId: string
) {
  const supabase = createAdminClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return {
      issues: [],
      topUrls: [],
    }
  }

  // Get all issues for this newsletter
  const { data: issues } = await supabase
    .from('issues')
    .select('id, title, status, sent_at, created_at')
    .eq('newsletter_id', newsletterId)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })

  if (!issues || issues.length === 0) {
    return {
      issues: [],
      topUrls: [],
    }
  }

  const issueIds = issues.map((i) => i.id)

  // Get aggregated stats per issue
  const issueStats = await Promise.all(
    issues.map(async (issue) => {
      // Count unique opens
      const { count: opens } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('issue_id', issue.id)
        .eq('type', 'opened')

      // Count unique clicks
      const { count: clicks } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('issue_id', issue.id)
        .eq('type', 'clicked')

      // Count total sent
      const { count: sent } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('issue_id', issue.id)
        .eq('type', 'sent')

      return {
        id: issue.id,
        title: issue.title,
        sent_at: issue.sent_at,
        sent: sent || 0,
        opens: opens || 0,
        clicks: clicks || 0,
        open_rate: sent ? ((opens || 0) / sent) * 100 : 0,
        click_rate: sent ? ((clicks || 0) / sent) * 100 : 0,
      }
    })
  )

  // Get top clicked URLs across all issues
  const { data: clickEvents } = await supabase
    .from('events')
    .select('url')
    .in('issue_id', issueIds)
    .eq('type', 'clicked')
    .not('url', 'is', null)

  // Aggregate URLs
  const urlCounts: Record<string, number> = {}
  clickEvents?.forEach((event) => {
    if (event.url) {
      urlCounts[event.url] = (urlCounts[event.url] || 0) + 1
    }
  })

  // Sort by count
  const topUrls = Object.entries(urlCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  return {
    issues: issueStats,
    topUrls,
  }
}

/**
 * Get analytics for a specific issue
 */
export async function getIssueAnalytics(orgId: string, issueId: string) {
  const supabase = createAdminClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return null
  }

  // Get issue
  const { data: issue } = await supabase
    .from('issues')
    .select('id, title, sent_at')
    .eq('id', issueId)
    .single()

  if (!issue) {
    return null
  }

  // Count events
  const { count: sent } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('issue_id', issueId)
    .eq('type', 'sent')

  const { count: opens } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('issue_id', issueId)
    .eq('type', 'opened')

  const { count: clicks } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('issue_id', issueId)
    .eq('type', 'clicked')

  // Get clicked URLs for this issue
  const { data: clickEvents } = await supabase
    .from('events')
    .select('url')
    .eq('issue_id', issueId)
    .eq('type', 'clicked')
    .not('url', 'is', null)

  // Aggregate URLs
  const urlCounts: Record<string, number> = {}
  clickEvents?.forEach((event) => {
    if (event.url) {
      urlCounts[event.url] = (urlCounts[event.url] || 0) + 1
    }
  })

  const clickedUrls = Object.entries(urlCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)

  return {
    ...issue,
    sent: sent || 0,
    opens: opens || 0,
    clicks: clicks || 0,
    open_rate: sent ? ((opens || 0) / sent) * 100 : 0,
    click_rate: sent ? ((clicks || 0) / sent) * 100 : 0,
    clicked_urls: clickedUrls,
  }
}

