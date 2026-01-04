'use client'

import { useEffect, useState } from 'react'
import { createClient, canCreateClient } from '@/lib/supabase/client'
import { validateSupabaseEnv } from '@/lib/auth/errors'
import Link from 'next/link'

interface HealthStatus {
  timestamp: string
  environment: {
    hasUrl: boolean
    hasAnonKey: boolean
    isValid: boolean
  }
  client: {
    canCreate: boolean
    error?: string
  }
  session: {
    checked: boolean
    hasSession: boolean
    error?: string
  }
}

export default function AuthHealthPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkHealth() {
      const healthStatus: HealthStatus = {
        timestamp: new Date().toISOString(),
        environment: validateSupabaseEnv(),
        client: { canCreate: false },
        session: { checked: false, hasSession: false },
      }

      // Check if client can be created
      const clientCheck = canCreateClient()
      healthStatus.client = clientCheck

      // Check session if client is valid
      if (clientCheck.success) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.getSession()
          healthStatus.session = {
            checked: true,
            hasSession: !!data.session,
            error: error?.message,
          }
        } catch (err) {
          healthStatus.session = {
            checked: true,
            hasSession: false,
            error: String(err),
          }
        }
      }

      setStatus(healthStatus)
      setLoading(false)
    }

    checkHealth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center px-4 min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-gray-600">Running health checks...</div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center px-4 min-h-screen">
        <div className="text-center text-red-600">
          Failed to run health checks
        </div>
      </div>
    )
  }

  const allHealthy =
    status.environment.isValid &&
    status.client.canCreate &&
    !status.session.error

  return (
    <div className="flex items-center justify-center px-4 min-h-screen">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">{allHealthy ? '✅' : '⚠️'}</div>
          <h1 className="text-3xl font-bold text-gray-900">Auth Health Check</h1>
          <p className="mt-2 text-sm text-gray-600">
            Development diagnostic tool - not for production use
          </p>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg border-2 ${
          allHealthy
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="text-center">
            <div className="text-xl font-semibold">
              {allHealthy ? 'All Systems Operational' : 'Issues Detected'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔐</span>
            <span>Environment Variables</span>
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status.environment.hasUrl ? '✅' : '❌'}
              </span>
              <div>
                <div className="font-semibold">NEXT_PUBLIC_SUPABASE_URL</div>
                <div className="text-gray-600">
                  {status.environment.hasUrl ? 'Configured' : 'Missing'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status.environment.hasAnonKey ? '✅' : '❌'}
              </span>
              <div>
                <div className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div className="text-gray-600">
                  {status.environment.hasAnonKey ? 'Configured' : 'Missing'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status.environment.isValid ? '✅' : '❌'}
              </span>
              <div>
                <div className="font-semibold">Configuration Valid</div>
                <div className="text-gray-600">
                  {status.environment.isValid ? 'Yes' : 'No - check missing vars'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Client */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔧</span>
            <span>Supabase Client</span>
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status.client.canCreate ? '✅' : '❌'}
              </span>
              <div>
                <div className="font-semibold">Client Creation</div>
                <div className="text-gray-600">
                  {status.client.canCreate ? 'Success' : 'Failed'}
                </div>
                {status.client.error && (
                  <div className="text-red-600 text-xs mt-1">
                    {status.client.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>👤</span>
            <span>Auth Session</span>
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status.session.checked ? '✅' : '⚠️'}
              </span>
              <div>
                <div className="font-semibold">Session Check</div>
                <div className="text-gray-600">
                  {status.session.checked ? 'Completed' : 'Skipped (client error)'}
                </div>
              </div>
            </div>
            {status.session.checked && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {status.session.hasSession ? '✅' : 'ℹ️'}
                </span>
                <div>
                  <div className="font-semibold">Active Session</div>
                  <div className="text-gray-600">
                    {status.session.hasSession ? 'User is signed in' : 'No active session'}
                  </div>
                </div>
              </div>
            )}
            {status.session.error && (
              <div className="text-red-600 text-xs mt-1 ml-11">
                Error: {status.session.error}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="flex-1 text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Refresh Check
          </button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <div className="font-semibold mb-1">⚠️ Development Only</div>
          <div>
            This page should not be accessible in production. It exposes
            non-sensitive configuration status for debugging purposes.
          </div>
        </div>
      </div>
    </div>
  )
}

