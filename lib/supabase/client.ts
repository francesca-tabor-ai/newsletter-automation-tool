import { createBrowserClient } from '@supabase/ssr'

/**
 * Validates and returns Supabase environment variables
 * Throws a descriptive error if they're missing
 */
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    )
  }

  return { url, anonKey }
}

/**
 * Creates a Supabase browser client with environment validation
 */
export function createClient() {
  try {
    const { url, anonKey } = getSupabaseConfig()
    return createBrowserClient(url, anonKey)
  } catch (error) {
    // Re-throw with additional context
    throw new Error(
      `Failed to create Supabase client: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Checks if Supabase client can be created (for health checks)
 */
export function canCreateClient(): { success: boolean; error?: string } {
  try {
    getSupabaseConfig()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
