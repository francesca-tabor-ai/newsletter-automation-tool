'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  categorizeAuthError,
  withTimeout,
  validateSupabaseEnv,
  createDebugInfo,
  type CategorizedError,
  type DebugInfo,
} from '@/lib/auth/errors'
import { DebugPanel } from '@/components/auth/DebugPanel'

type AuthMode = 'password' | 'magic-link'

const AUTH_TIMEOUT_MS = 15000 // 15 seconds

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<CategorizedError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [envError, setEnvError] = useState<CategorizedError | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const showDebug = searchParams.get('debug') === '1' || process.env.NODE_ENV === 'development'

  // Validate environment on mount
  useEffect(() => {
    const validation = validateSupabaseEnv()
    if (!validation.isValid && validation.error) {
      setEnvError(validation.error)
      setDebugInfo(createDebugInfo(undefined, validation.error))
    }
  }, [])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs before setting loading state
    if (!email || !password) {
      setError({
        category: 'AUTH_INVALID',
        uiMessage: 'Please enter both email and password.',
        debugMessage: 'Missing email or password',
      })
      return
    }

    // Check env first
    const envValidation = validateSupabaseEnv()
    if (!envValidation.isValid && envValidation.error) {
      setError(envValidation.error)
      setDebugInfo(createDebugInfo('password', envValidation.error))
      return
    }

    // Reset state
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Wrap the auth call with timeout
      const { error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        AUTH_TIMEOUT_MS
      )

      if (authError) {
        const categorized = categorizeAuthError(authError)
        setError(categorized)
        setDebugInfo(createDebugInfo('password', categorized))
      } else {
        // Success - redirect to app
        router.push('/app')
        router.refresh()
      }
    } catch (err) {
      // Handle timeout or other errors
      const categorized = categorizeAuthError(err)
      setError(categorized)
      setDebugInfo(createDebugInfo('password', categorized))
    } finally {
      // ALWAYS clear loading state
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate input before setting loading state
    if (!email) {
      setError({
        category: 'AUTH_INVALID',
        uiMessage: 'Please enter your email address.',
        debugMessage: 'Missing email',
      })
      return
    }

    // Check env first
    const envValidation = validateSupabaseEnv()
    if (!envValidation.isValid && envValidation.error) {
      setError(envValidation.error)
      setDebugInfo(createDebugInfo('magic-link', envValidation.error))
      return
    }

    // Reset state
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Wrap the auth call with timeout
      const { error: authError } = await withTimeout(
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }),
        AUTH_TIMEOUT_MS
      )

      if (authError) {
        const categorized = categorizeAuthError(authError)
        setError(categorized)
        setDebugInfo(createDebugInfo('magic-link', categorized))
      } else {
        setSuccess('Check your email for the magic link!')
        setDebugInfo(createDebugInfo('magic-link'))
      }
    } catch (err) {
      // Handle timeout or other errors
      const categorized = categorizeAuthError(err)
      setError(categorized)
      setDebugInfo(createDebugInfo('magic-link', categorized))
    } finally {
      // ALWAYS clear loading state
      setLoading(false)
    }
  }

  const handleSubmit = mode === 'password' ? handlePasswordLogin : handleMagicLinkLogin

  // Show env error if configuration is broken
  if (envError) {
    return (
      <div className="flex items-center justify-center px-4 min-h-screen">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Configuration Error</h2>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="font-semibold mb-1">Authentication Misconfigured</div>
            <div>{envError.uiMessage}</div>
          </div>

          <DebugPanel debugInfo={debugInfo} show={showDebug} />

          <div className="text-center text-sm text-gray-600">
            Please contact your system administrator or check the deployment configuration.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-4 min-h-screen">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to AutoNews
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('password')
              setError(null)
              setSuccess(null)
            }}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } disabled:opacity-50`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('magic-link')
              setError(null)
              setSuccess(null)
            }}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'magic-link'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } disabled:opacity-50`}
          >
            Magic Link
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="font-semibold mb-1">{error.category.replace(/_/g, ' ')}</div>
              <div>{error.uiMessage}</div>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === 'password' && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {mode === 'password' && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/auth/reset-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? mode === 'password'
                  ? 'Signing in...'
                  : 'Sending magic link...'
                : mode === 'password'
                ? 'Sign in with password'
                : 'Send magic link'}
            </button>
          </div>

          {mode === 'magic-link' && (
            <div className="text-xs text-gray-500 text-center">
              We'll send you a secure link to sign in without a password
            </div>
          )}

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </form>

        {/* Debug Panel */}
        <DebugPanel debugInfo={debugInfo} show={showDebug} />
      </div>
    </div>
  )
}
