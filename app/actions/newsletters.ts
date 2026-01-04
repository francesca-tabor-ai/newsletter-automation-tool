/**
 * Server Actions for Newsletter CRUD Operations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Check if user is a member of the organization
 */
async function checkOrgMembership(orgId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: membership } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', orgId)
    .single()
  
  return !!membership
}

/**
 * Create a new newsletter
 */
export async function createNewsletter(orgId: string, formData: FormData) {
  const supabase = await createClient()

  // Check authorization
  const isMember = await checkOrgMembership(orgId)
  if (!isMember) {
    return { error: 'Unauthorized: You must be a member of this organization' }
  }

  const name = formData.get('name') as string
  const fromName = formData.get('fromName') as string
  const fromEmail = formData.get('fromEmail') as string
  const replyTo = formData.get('replyTo') as string
  const subjectTemplate = formData.get('subjectTemplate') as string

  // Validation
  if (!name || name.trim().length === 0) {
    return { error: 'Newsletter name is required' }
  }

  if (!fromName || fromName.trim().length === 0) {
    return { error: 'From name is required' }
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Create the newsletter
  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .insert({
      org_id: orgId,
      name: name.trim(),
      slug,
      from_name: fromName.trim(),
      from_email: fromEmail?.trim() || null,
      reply_to: replyTo?.trim() || null,
      subject_template: subjectTemplate?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating newsletter:', error)
    return { error: 'Failed to create newsletter' }
  }

  revalidatePath(`/app/org/${orgId}`)
  revalidatePath(`/app/org/${orgId}/newsletters`)
  return { success: true, newsletter }
}

/**
 * Get newsletters for an organization
 */
export async function getNewsletters(orgId: string) {
  const supabase = await createClient()

  // Check authorization
  const isMember = await checkOrgMembership(orgId)
  if (!isMember) {
    return []
  }

  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select(
      `
      id,
      name,
      slug,
      from_name,
      from_email,
      reply_to,
      subject_template,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching newsletters:', error)
    return []
  }

  return newsletters || []
}

/**
 * Get a single newsletter by ID
 */
export async function getNewsletter(newsletterId: string) {
  const supabase = await createClient()

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select(
      `
      id,
      org_id,
      name,
      slug,
      from_name,
      from_email,
      reply_to,
      subject_template,
      branding_json,
      is_active,
      created_at,
      updated_at
    `
    )
    .eq('id', newsletterId)
    .single()

  if (error) {
    console.error('Error fetching newsletter:', error)
    return null
  }

  // Check authorization
  if (newsletter) {
    const isMember = await checkOrgMembership(newsletter.org_id)
    if (!isMember) {
      return null
    }
  }

  return newsletter
}

/**
 * Update a newsletter
 */
export async function updateNewsletter(
  newsletterId: string,
  formData: FormData
) {
  const supabase = await createClient()

  // Get newsletter to check org ownership
  const newsletter = await getNewsletter(newsletterId)
  if (!newsletter) {
    return { error: 'Newsletter not found or unauthorized' }
  }

  const name = formData.get('name') as string
  const fromName = formData.get('fromName') as string
  const fromEmail = formData.get('fromEmail') as string
  const replyTo = formData.get('replyTo') as string
  const subjectTemplate = formData.get('subjectTemplate') as string
  const scheduleEnabled = formData.get('scheduleEnabled') === 'on'
  const scheduleDaysRaw = formData.get('scheduleDays') as string
  const scheduleTime = formData.get('scheduleTime') as string
  const scheduleTimezone = formData.get('scheduleTimezone') as string

  // Validation
  if (!name || name.trim().length === 0) {
    return { error: 'Newsletter name is required' }
  }

  if (!fromName || fromName.trim().length === 0) {
    return { error: 'From name is required' }
  }

  // Parse schedule days
  let scheduleDays = [1, 2, 3, 4, 5] // Default: weekdays
  if (scheduleDaysRaw) {
    try {
      scheduleDays = JSON.parse(scheduleDaysRaw)
    } catch {
      // Keep default
    }
  }

  // Generate new slug if name changed
  const slug =
    name.trim() !== newsletter.name
      ? name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : newsletter.slug

  // Calculate next run if scheduling is enabled
  let nextScheduledRun = null
  if (scheduleEnabled && scheduleTime) {
    const now = new Date()
    const [hours, minutes] = scheduleTime.split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)
    
    // If today's time has passed, start from tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
    
    // Find next day that matches schedule
    let attempts = 0
    while (!scheduleDays.includes(nextRun.getDay()) && attempts < 7) {
      nextRun.setDate(nextRun.getDate() + 1)
      attempts++
    }
    
    nextScheduledRun = nextRun.toISOString()
  }

  // Update the newsletter
  const { error } = await supabase
    .from('newsletters')
    .update({
      name: name.trim(),
      slug,
      from_name: fromName.trim(),
      from_email: fromEmail?.trim() || null,
      reply_to: replyTo?.trim() || null,
      subject_template: subjectTemplate?.trim() || null,
      schedule_enabled: scheduleEnabled,
      schedule_days: scheduleDays,
      schedule_time: scheduleTime || '09:00:00',
      schedule_timezone: scheduleTimezone || 'UTC',
      next_scheduled_run: nextScheduledRun,
    })
    .eq('id', newsletterId)

  if (error) {
    console.error('Error updating newsletter:', error)
    return { error: 'Failed to update newsletter' }
  }

  revalidatePath(`/app/org/${newsletter.org_id}/newsletters`)
  revalidatePath(`/app/org/${newsletter.org_id}/newsletters/${newsletterId}`)
  return { success: true }
}

/**
 * Toggle newsletter active status
 */
export async function toggleNewsletterStatus(newsletterId: string) {
  const supabase = await createClient()

  // Get newsletter to check org ownership
  const newsletter = await getNewsletter(newsletterId)
  if (!newsletter) {
    return { error: 'Newsletter not found or unauthorized' }
  }

  // Toggle status
  const { error } = await supabase
    .from('newsletters')
    .update({
      is_active: !newsletter.is_active,
    })
    .eq('id', newsletterId)

  if (error) {
    console.error('Error toggling newsletter status:', error)
    return { error: 'Failed to update newsletter status' }
  }

  revalidatePath(`/app/org/${newsletter.org_id}/newsletters`)
  revalidatePath(`/app/org/${newsletter.org_id}/newsletters/${newsletterId}`)
  return { success: true, is_active: !newsletter.is_active }
}

/**
 * Delete a newsletter
 */
export async function deleteNewsletter(newsletterId: string) {
  const supabase = await createClient()

  // Get newsletter to check org ownership
  const newsletter = await getNewsletter(newsletterId)
  if (!newsletter) {
    return { error: 'Newsletter not found or unauthorized' }
  }

  // Delete the newsletter
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', newsletterId)

  if (error) {
    console.error('Error deleting newsletter:', error)
    return { error: 'Failed to delete newsletter' }
  }

  revalidatePath(`/app/org/${newsletter.org_id}/newsletters`)
  redirect(`/app/org/${newsletter.org_id}/newsletters`)
}
