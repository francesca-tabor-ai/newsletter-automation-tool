/**
 * Server Actions for Content Rules Management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
 * Get rules for a newsletter
 */
export async function getNewsletterRules(orgId: string, newsletterId: string) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return null
  }

  const { data: rules, error } = await supabase
    .from('rules')
    .select('*')
    .eq('newsletter_id', newsletterId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    console.error('Error fetching rules:', error)
    return null
  }

  return rules
}

/**
 * Create or update newsletter rules
 */
export async function saveNewsletterRules(
  orgId: string,
  newsletterId: string,
  formData: FormData
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  // Parse form data
  const includeKeywords = (formData.get('includeKeywords') as string) || ''
  const excludeKeywords = (formData.get('excludeKeywords') as string) || ''
  const maxItems = parseInt(formData.get('maxItems') as string) || 15
  const lookbackDays = parseInt(formData.get('lookbackDays') as string) || 62
  const dedupe = formData.get('dedupe') === 'true'

  // Convert comma-separated strings to arrays
  const includeArray = includeKeywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)

  const excludeArray = excludeKeywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)

  // Check if rules exist
  const { data: existing } = await supabase
    .from('rules')
    .select('id')
    .eq('newsletter_id', newsletterId)
    .single()

  const rulesData = {
    newsletter_id: newsletterId,
    include_keywords: includeArray,
    exclude_keywords: excludeArray,
    max_items: maxItems,
    lookback_days: lookbackDays,
    dedupe: dedupe,
    is_active: true,
  }

  if (existing) {
    // Update
    const { error } = await supabase
      .from('rules')
      .update(rulesData)
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating rules:', error)
      return { error: 'Failed to update rules' }
    }
  } else {
    // Create
    const { error } = await supabase.from('rules').insert(rulesData)

    if (error) {
      console.error('Error creating rules:', error)
      return { error: 'Failed to create rules' }
    }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

