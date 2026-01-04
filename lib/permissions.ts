/**
 * Permissions Utility
 * Check user roles and enforce permissions
 */

import { createClient } from '@/lib/supabase/server'

export type Role = 'owner' | 'editor' | 'viewer'

export interface OrgMember {
  org_id: string
  user_id: string
  role: Role
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(orgId: string): Promise<Role | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as Role
}

/**
 * Check if user has required role (or higher)
 * Hierarchy: owner > editor > viewer
 */
export async function hasPermission(
  orgId: string,
  requiredRole: Role
): Promise<boolean> {
  const userRole = await getUserRole(orgId)

  if (!userRole) {
    return false
  }

  const roleHierarchy: Record<Role, number> = {
    owner: 3,
    editor: 2,
    viewer: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user can read (all roles)
 */
export async function canRead(orgId: string): Promise<boolean> {
  return hasPermission(orgId, 'viewer')
}

/**
 * Check if user can edit/manage content
 */
export async function canEdit(orgId: string): Promise<boolean> {
  return hasPermission(orgId, 'editor')
}

/**
 * Check if user is owner (full access)
 */
export async function isOwner(orgId: string): Promise<boolean> {
  return hasPermission(orgId, 'owner')
}

/**
 * Throw error if user doesn't have permission
 */
export async function requirePermission(
  orgId: string,
  requiredRole: Role
): Promise<void> {
  const hasAccess = await hasPermission(orgId, requiredRole)

  if (!hasAccess) {
    throw new Error(
      `Insufficient permissions. Required role: ${requiredRole}`
    )
  }
}

/**
 * Get permission error message
 */
export function getPermissionError(requiredRole: Role): string {
  const messages: Record<Role, string> = {
    viewer: 'You need at least viewer access to perform this action.',
    editor: 'You need editor or owner access to perform this action.',
    owner: 'Only organization owners can perform this action.',
  }

  return messages[requiredRole]
}

