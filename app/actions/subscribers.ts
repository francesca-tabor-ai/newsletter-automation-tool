/**
 * Server Actions for Subscriber Management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Get subscribers for a newsletter
 */
export async function getNewsletterSubscribers(
  orgId: string,
  newsletterId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return []
  }

  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('newsletter_id', newsletterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }

  return subscribers || []
}

/**
 * Get subscriber count by status
 */
export async function getSubscriberStats(
  orgId: string,
  newsletterId: string
) {
  const adminClient = createAdminClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { total: 0, active: 0, unsubscribed: 0, bounced: 0, complained: 0 }
  }

  const { data: subscribers } = await adminClient
    .from('subscribers')
    .select('status')
    .eq('newsletter_id', newsletterId)

  if (!subscribers) {
    return { total: 0, active: 0, unsubscribed: 0, bounced: 0, complained: 0 }
  }

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === 'active').length,
    unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
    bounced: subscribers.filter((s) => s.status === 'bounced').length,
    complained: subscribers.filter((s) => s.status === 'complained').length,
  }

  return stats
}

/**
 * Add a single subscriber
 */
export async function addSubscriber(
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

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const firstName = (formData.get('firstName') as string)?.trim() || null
  const lastName = (formData.get('lastName') as string)?.trim() || null

  // Validate email
  if (!email) {
    return { error: 'Email is required' }
  }

  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' }
  }

  // Check for existing subscriber
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, status')
    .eq('newsletter_id', newsletterId)
    .eq('email', email)
    .single()

  if (existing) {
    if (existing.status === 'active') {
      return { error: 'This email is already subscribed' }
    } else {
      // Reactivate
      const { error } = await supabase
        .from('subscribers')
        .update({
          status: 'active',
          first_name: firstName,
          last_name: lastName,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Error reactivating subscriber:', error)
        return { error: 'Failed to reactivate subscriber' }
      }

      revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
      return { success: true, reactivated: true }
    }
  }

  // Add new subscriber
  const { error } = await supabase.from('subscribers').insert({
    newsletter_id: newsletterId,
    email,
    first_name: firstName,
    last_name: lastName,
    status: 'active',
  })

  if (error) {
    console.error('Error adding subscriber:', error)
    return { error: 'Failed to add subscriber' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

/**
 * Bulk add subscribers
 */
export async function bulkAddSubscribers(
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

  const emailsText = (formData.get('emails') as string)?.trim()

  if (!emailsText) {
    return { error: 'Please enter at least one email address' }
  }

  // Parse emails (newline, comma, or semicolon separated)
  const emailList = emailsText
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0)

  if (emailList.length === 0) {
    return { error: 'No valid email addresses found' }
  }

  // Validate all emails
  const invalidEmails = emailList.filter((email) => !isValidEmail(email))
  if (invalidEmails.length > 0) {
    return {
      error: `Invalid email format: ${invalidEmails.slice(0, 3).join(', ')}${
        invalidEmails.length > 3 ? '...' : ''
      }`,
    }
  }

  // Remove duplicates
  const uniqueEmails = [...new Set(emailList)]

  // Get existing subscribers
  const { data: existingSubscribers } = await supabase
    .from('subscribers')
    .select('email, status')
    .eq('newsletter_id', newsletterId)
    .in('email', uniqueEmails)

  const existingEmails = new Set(
    existingSubscribers?.map((s) => s.email) || []
  )
  const existingActive = new Set(
    existingSubscribers
      ?.filter((s) => s.status === 'active')
      .map((s) => s.email) || []
  )

  // Split into new and reactivate
  const newEmails = uniqueEmails.filter((email) => !existingEmails.has(email))
  const reactivateEmails = uniqueEmails.filter(
    (email) => existingEmails.has(email) && !existingActive.has(email)
  )
  const alreadyActive = uniqueEmails.filter((email) =>
    existingActive.has(email)
  )

  let added = 0
  let reactivated = 0

  // Add new subscribers
  if (newEmails.length > 0) {
    const { error } = await supabase.from('subscribers').insert(
      newEmails.map((email) => ({
        newsletter_id: newsletterId,
        email,
        status: 'active',
      }))
    )

    if (error) {
      console.error('Error bulk adding subscribers:', error)
      return { error: 'Failed to add some subscribers' }
    }

    added = newEmails.length
  }

  // Reactivate inactive subscribers
  if (reactivateEmails.length > 0) {
    const { error } = await supabase
      .from('subscribers')
      .update({
        status: 'active',
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq('newsletter_id', newsletterId)
      .in('email', reactivateEmails)

    if (error) {
      console.error('Error reactivating subscribers:', error)
    } else {
      reactivated = reactivateEmails.length
    }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)

  return {
    success: true,
    added,
    reactivated,
    skipped: alreadyActive.length,
    total: uniqueEmails.length,
  }
}

/**
 * Update subscriber status
 */
export async function updateSubscriberStatus(
  orgId: string,
  newsletterId: string,
  subscriberId: string,
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  const updateData: {
    status: string
    unsubscribed_at?: string | null
  } = { status }

  if (status === 'unsubscribed') {
    updateData.unsubscribed_at = new Date().toISOString()
  } else if (status === 'active') {
    updateData.unsubscribed_at = null
  }

  const { error } = await supabase
    .from('subscribers')
    .update(updateData)
    .eq('id', subscriberId)

  if (error) {
    console.error('Error updating subscriber status:', error)
    return { error: 'Failed to update subscriber status' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriber(
  orgId: string,
  newsletterId: string,
  subscriberId: string
) {
  const supabase = await createClient()

  // Check authorization
  const hasAccess = await checkOrgAccess(orgId)
  if (!hasAccess) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', subscriberId)

  if (error) {
    console.error('Error deleting subscriber:', error)
    return { error: 'Failed to delete subscriber' }
  }

  revalidatePath(`/app/org/${orgId}/newsletters/${newsletterId}`)
  return { success: true }
}

