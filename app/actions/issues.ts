/**
 * Server Actions for Issue Generation
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Check if user is a member of the organization
 */
async function checkOrgAccess(orgId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', orgId)
    .single()

  return !!data
}

/**
 * Check if text matches any of the keywords (case-insensitive)
 */
function matchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return false

  const lowerText = text.toLowerCase()
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
}

/**
 * Generate a draft issue for a newsletter
 */
export async function generateDraftIssue(orgId: string, newsletterId: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  try {
    // 1. Get newsletter info
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('name, org_id')
      .eq('id', newsletterId)
      .single()

    if (newsletterError || !newsletter) {
      return { error: 'Newsletter not found' }
    }

    // 2. Get rules
    const { data: rules } = await supabase
      .from('rules')
      .select('*')
      .eq('newsletter_id', newsletterId)
      .single()

    const maxItems = rules?.max_items || 15
    const lookbackDays = rules?.lookback_days || 62
    const includeKeywords = rules?.include_keywords || []
    const excludeKeywords = rules?.exclude_keywords || []
    const dedupe = rules?.dedupe !== false // Default true

    // 3. Determine time range
    // Check for last sent issue
    const { data: lastIssue } = await supabase
      .from('issues')
      .select('sent_at')
      .eq('newsletter_id', newsletterId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    const now = new Date()
    let sinceDate: Date

    if (lastIssue?.sent_at) {
      // Subsequent issue: since last sent
      sinceDate = new Date(lastIssue.sent_at)
    } else {
      // First issue: use lookback_days
      sinceDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000)
    }

    // 4. Get linked sources
    const { data: linkedSources } = await supabase
      .from('newsletter_sources')
      .select('source_id')
      .eq('newsletter_id', newsletterId)
      .eq('is_enabled', true)

    if (!linkedSources || linkedSources.length === 0) {
      return { error: 'No active sources linked to this newsletter' }
    }

    const sourceIds = linkedSources.map((ls) => ls.source_id)

    // 5. Fetch candidate items
    let query = adminClient
      .from('items')
      .select('id, title, summary, content_text, published_at, hash')
      .eq('org_id', newsletter.org_id)
      .in('source_id', sourceIds)
      .gte('published_at', sinceDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(maxItems * 3) // Fetch more than needed for filtering

    const { data: candidateItems, error: itemsError } = await query

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
      return { error: 'Failed to fetch items' }
    }

    if (!candidateItems || candidateItems.length === 0) {
      return { error: 'No items found in the specified time range' }
    }

    // 6. Apply keyword filters
    let filteredItems = candidateItems

    // Include keywords filter
    if (includeKeywords.length > 0) {
      filteredItems = filteredItems.filter((item) => {
        const searchText = `${item.title || ''} ${item.summary || ''} ${
          item.content_text || ''
        }`
        return matchesKeywords(searchText, includeKeywords)
      })
    }

    // Exclude keywords filter
    if (excludeKeywords.length > 0) {
      filteredItems = filteredItems.filter((item) => {
        const searchText = `${item.title || ''} ${item.summary || ''} ${
          item.content_text || ''
        }`
        return !matchesKeywords(searchText, excludeKeywords)
      })
    }

    // 7. Apply deduplication
    if (dedupe) {
      const seenHashes = new Set<string>()
      filteredItems = filteredItems.filter((item) => {
        if (seenHashes.has(item.hash)) {
          return false
        }
        seenHashes.add(item.hash)
        return true
      })
    }

    // 8. Apply max_items limit
    const selectedItems = filteredItems.slice(0, maxItems)

    if (selectedItems.length === 0) {
      return {
        error:
          'No items matched the filters. Try adjusting your rules or adding more sources.',
      }
    }

    // 9. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 10. Create issue
    const issueTitle = `${newsletter.name} - ${now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`

    const { data: issue, error: issueError } = await adminClient
      .from('issues')
      .insert({
        newsletter_id: newsletterId,
        status: 'draft',
        title: issueTitle,
        scheduled_for: null,
        created_by: user?.id || null,
      })
      .select()
      .single()

    if (issueError || !issue) {
      console.error('Error creating issue:', issueError)
      return { error: 'Failed to create issue' }
    }

    // 11. Create issue_items
    const issueItems = selectedItems.map((item, index) => ({
      issue_id: issue.id,
      item_id: item.id,
      position: index,
      removed: false,
    }))

    const { error: itemsInsertError } = await adminClient
      .from('issue_items')
      .insert(issueItems)

    if (itemsInsertError) {
      console.error('Error creating issue items:', itemsInsertError)
      // Clean up the created issue
      await adminClient.from('issues').delete().eq('id', issue.id)
      return { error: 'Failed to add items to issue' }
    }

    revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)

    return {
      success: true,
      issueId: issue.id,
      itemCount: selectedItems.length,
    }
  } catch (error) {
    console.error('Error generating draft issue:', error)
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred',
    }
  }
}

/**
 * Get issues for a newsletter
 */
export async function getNewsletterIssues(
  orgId: string,
  newsletterId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return []
  }

  const { data: issues, error } = await supabase
    .from('issues')
    .select(
      `
      id,
      title,
      status,
      scheduled_for,
      sent_at,
      created_at,
      created_by
    `
    )
    .eq('newsletter_id', newsletterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching issues:', error)
    return []
  }

  // Get item counts for each issue
  const issuesWithCounts = await Promise.all(
    (issues || []).map(async (issue) => {
      const { count } = await supabase
        .from('issue_items')
        .select('*', { count: 'exact', head: true })
        .eq('issue_id', issue.id)
        .eq('removed', false)

      return {
        ...issue,
        itemCount: count || 0,
      }
    })
  )

  return issuesWithCounts
}

/**
 * Delete an issue
 */
export async function deleteIssue(
  orgId: string,
  newsletterId: string,
  issueId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('issues').delete().eq('id', issueId)

  if (error) {
    console.error('Error deleting issue:', error)
    return { error: 'Failed to delete issue' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

