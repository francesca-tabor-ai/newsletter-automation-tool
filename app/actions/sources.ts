/**
 * Server Actions for RSS Source Management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'AutoNews/1.0',
  },
})

/**
 * Validate RSS feed by fetching and parsing it
 */
async function validateRssFeed(url: string) {
  try {
    const feed = await parser.parseURL(url)
    return {
      valid: true,
      title: feed.title || 'Untitled Feed',
      itemCount: feed.items?.length || 0,
    }
  } catch (error) {
    console.error('RSS validation error:', error)
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : 'Invalid RSS feed or unable to fetch',
    }
  }
}

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
 * Add RSS source to organization and link to newsletter
 */
export async function addRssSource(
  orgId: string,
  newsletterId: string,
  formData: FormData
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized: You must be a member of this organization' }
  }

  const url = formData.get('url') as string
  const name = formData.get('name') as string
  const sectionTitle = formData.get('sectionTitle') as string

  // Validation
  if (!url || !url.trim()) {
    return { error: 'RSS feed URL is required' }
  }

  if (!name || !name.trim()) {
    return { error: 'Source name is required' }
  }

  // Validate RSS feed
  const validation = await validateRssFeed(url.trim())
  if (!validation.valid) {
    return {
      error: `Invalid RSS feed: ${validation.error}. Please check the URL and try again.`,
    }
  }

  // Check if source already exists for this org
  const { data: existingSource } = await supabase
    .from('sources')
    .select('id')
    .eq('org_id', orgId)
    .eq('url', url.trim())
    .single()

  let sourceId: string

  if (existingSource) {
    // Source exists, just link it to newsletter
    sourceId = existingSource.id
  } else {
    // Create new source
    const { data: newSource, error: sourceError } = await supabase
      .from('sources')
      .insert({
        org_id: orgId,
        type: 'rss',
        url: url.trim(),
        name: name.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (sourceError) {
      console.error('Error creating source:', sourceError)
      return { error: 'Failed to create RSS source' }
    }

    sourceId = newSource.id
  }

  // Check if already linked to newsletter
  const { data: existingLink } = await supabase
    .from('newsletter_sources')
    .select('newsletter_id')
    .eq('newsletter_id', newsletterId)
    .eq('source_id', sourceId)
    .single()

  if (existingLink) {
    return { error: 'This RSS feed is already added to this newsletter' }
  }

  // Get max sort order for this newsletter
  const { data: sources } = await supabase
    .from('newsletter_sources')
    .select('sort_order')
    .eq('newsletter_id', newsletterId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const maxSortOrder = sources && sources.length > 0 ? sources[0].sort_order : 0

  // Link source to newsletter
  const { error: linkError } = await supabase
    .from('newsletter_sources')
    .insert({
      newsletter_id: newsletterId,
      source_id: sourceId,
      section_title: sectionTitle?.trim() || null,
      sort_order: maxSortOrder + 1,
      is_enabled: true,
    })

  if (linkError) {
    console.error('Error linking source to newsletter:', linkError)
    return { error: 'Failed to link RSS source to newsletter' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return {
    success: true,
    feedInfo: {
      title: validation.title,
      itemCount: validation.itemCount,
    },
  }
}

/**
 * Get sources for a newsletter
 */
export async function getNewsletterSources(
  orgId: string,
  newsletterId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return []
  }

  const { data: sources, error } = await supabase
    .from('newsletter_sources')
    .select(
      `
      section_title,
      sort_order,
      is_enabled,
      created_at,
      sources (
        id,
        name,
        url,
        type,
        is_active,
        last_fetched_at,
        last_fetch_status
      )
    `
    )
    .eq('newsletter_id', newsletterId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching newsletter sources:', error)
    return []
  }

  return sources || []
}

/**
 * Toggle source active/inactive for a newsletter
 */
export async function toggleNewsletterSource(
  orgId: string,
  newsletterId: string,
  sourceId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  // Get current state
  const { data: current } = await supabase
    .from('newsletter_sources')
    .select('is_enabled')
    .eq('newsletter_id', newsletterId)
    .eq('source_id', sourceId)
    .single()

  if (!current) {
    return { error: 'Source link not found' }
  }

  // Toggle
  const { error } = await supabase
    .from('newsletter_sources')
    .update({ is_enabled: !current.is_enabled })
    .eq('newsletter_id', newsletterId)
    .eq('source_id', sourceId)

  if (error) {
    console.error('Error toggling source:', error)
    return { error: 'Failed to update source status' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true, is_enabled: !current.is_enabled }
}

/**
 * Remove source from newsletter (unlink, don't delete source)
 */
export async function removeSourceFromNewsletter(
  orgId: string,
  newsletterId: string,
  sourceId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  // Delete the link
  const { error } = await supabase
    .from('newsletter_sources')
    .delete()
    .eq('newsletter_id', newsletterId)
    .eq('source_id', sourceId)

  if (error) {
    console.error('Error removing source from newsletter:', error)
    return { error: 'Failed to remove source' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

/**
 * Update source section title and sort order
 */
export async function updateNewsletterSource(
  orgId: string,
  newsletterId: string,
  sourceId: string,
  formData: FormData
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  const sectionTitle = formData.get('sectionTitle') as string
  const sortOrder = formData.get('sortOrder') as string

  const updates: any = {}
  if (sectionTitle !== undefined) {
    updates.section_title = sectionTitle.trim() || null
  }
  if (sortOrder !== undefined) {
    updates.sort_order = parseInt(sortOrder, 10)
  }

  const { error } = await supabase
    .from('newsletter_sources')
    .update(updates)
    .eq('newsletter_id', newsletterId)
    .eq('source_id', sourceId)

  if (error) {
    console.error('Error updating source:', error)
    return { error: 'Failed to update source' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

/**
 * Test/refresh RSS feed
 */
export async function testRssFeed(url: string) {
  const validation = await validateRssFeed(url)

  if (!validation.valid) {
    return {
      error: validation.error,
    }
  }

  return {
    success: true,
    title: validation.title,
    itemCount: validation.itemCount,
  }
}

