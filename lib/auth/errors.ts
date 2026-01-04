// Auth error categorization and helper utilities

export type AuthErrorCategory =
  | 'ENV_MISSING'
  | 'AUTH_INVALID'
  | 'AUTH_UNCONFIRMED'
  | 'AUTH_RATE_LIMIT'
  | 'AUTH_NETWORK'
  | 'AUTH_TIMEOUT'
  | 'AUTH_UNKNOWN'

export interface CategorizedError {
  category: AuthErrorCategory
  uiMessage: string
  debugMessage: string
}

/**
 * Categorizes any auth-related error into a user-friendly format
 */
export function categorizeAuthError(error: unknown): CategorizedError {
  // Handle timeout errors
  if (error instanceof Error && error.message === 'AUTH_TIMEOUT') {
    return {
      category: 'AUTH_TIMEOUT',
      uiMessage: 'Request timed out. Please check your connection and try again.',
      debugMessage: 'Auth request exceeded 15 second timeout',
    }
  }

  // Handle Supabase auth errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase()
    const status = 'status' in error ? Number(error.status) : null

    // Invalid credentials
    if (message.includes('invalid') || message.includes('incorrect')) {
      return {
        category: 'AUTH_INVALID',
        uiMessage: 'Invalid email or password. Please try again.',
        debugMessage: `Auth validation failed: ${error.message}`,
      }
    }

    // Unconfirmed email
    if (message.includes('confirm') || message.includes('verify')) {
      return {
        category: 'AUTH_UNCONFIRMED',
        uiMessage: 'Please verify your email address before signing in.',
        debugMessage: `Email not confirmed: ${error.message}`,
      }
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many') || status === 429) {
      return {
        category: 'AUTH_RATE_LIMIT',
        uiMessage: 'Too many attempts. Please wait a few minutes and try again.',
        debugMessage: `Rate limited: ${error.message}`,
      }
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      return {
        category: 'AUTH_NETWORK',
        uiMessage: 'Network error. Please check your connection.',
        debugMessage: `Network issue: ${error.message}`,
      }
    }

    // Generic error with message
    return {
      category: 'AUTH_UNKNOWN',
      uiMessage: 'Sign in failed. Please try again.',
      debugMessage: `Unknown error: ${error.message}`,
    }
  }

  // Completely unknown error
  return {
    category: 'AUTH_UNKNOWN',
    uiMessage: 'An unexpected error occurred. Please try again.',
    debugMessage: `Uncategorized error: ${String(error)}`,
  }
}

/**
 * Creates a promise that times out after specified milliseconds
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AUTH_TIMEOUT')), timeoutMs)
    ),
  ])
}

/**
 * Validates Supabase environment variables are present
 */
export interface EnvValidation {
  isValid: boolean
  hasUrl: boolean
  hasAnonKey: boolean
  error?: CategorizedError
}

export function validateSupabaseEnv(): EnvValidation {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasUrl || !hasAnonKey) {
    return {
      isValid: false,
      hasUrl,
      hasAnonKey,
      error: {
        category: 'ENV_MISSING',
        uiMessage: 'Authentication is not configured. Please contact support.',
        debugMessage: `Missing env vars - URL: ${hasUrl}, Key: ${hasAnonKey}`,
      },
    }
  }

  return {
    isValid: true,
    hasUrl,
    hasAnonKey,
  }
}

/**
 * Debug information for troubleshooting (non-sensitive)
 */
export interface DebugInfo {
  timestamp: string
  authMethod?: 'password' | 'magic-link'
  error?: CategorizedError
  envStatus: EnvValidation
}

export function createDebugInfo(
  authMethod?: 'password' | 'magic-link',
  error?: CategorizedError
): DebugInfo {
  return {
    timestamp: new Date().toISOString(),
    authMethod,
    error,
    envStatus: validateSupabaseEnv(),
  }
}

