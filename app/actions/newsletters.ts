/**
 * Server Actions for Newsletter Management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Create a new newsletter
 */
export async function createNewsletter(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const fromName = formData.get('fromName') as string
  const fromEmail = formData.get('fromEmail') as string

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
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating newsletter:', error)
    return { error: 'Failed to create newsletter' }
  }

  revalidatePath(`/app/org/${orgId}`)
  return { success: true, newsletter }
}

/**
 * Get newsletters for an organization
 */
export async function getNewsletters(orgId: string) {
  const supabase = await createClient()

  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select(
      `
      id,
      name,
      slug,
      from_name,
      from_email,
      is_active,
      created_at
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

