/**
 * Server Actions for Organization Management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Create a new organization
 */
export async function createOrganization(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string

  if (!name || name.trim().length === 0) {
    return { error: 'Organization name is required' }
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Check if slug already exists
  const { data: existingOrg } = await supabase
    .from('orgs')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existingOrg) {
    return { error: 'An organization with this name already exists' }
  }

  // Create the organization
  const { data: org, error } = await supabase
    .from('orgs')
    .insert({
      name: name.trim(),
      slug,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating organization:', error)
    return { error: 'Failed to create organization' }
  }

  // The trigger will automatically add the user as owner
  // Revalidate and redirect
  revalidatePath('/app')
  redirect(`/app/org/${org.id}`)
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations() {
  const supabase = await createClient()

  const { data: orgs, error } = await supabase
    .from('orgs')
    .select(
      `
      id,
      name,
      slug,
      created_at,
      org_members!inner (
        role,
        user_id
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  return orgs || []
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string) {
  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('orgs')
    .select(
      `
      id,
      name,
      slug,
      created_at,
      org_members (
        role,
        user_id
      )
    `
    )
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return org
}

