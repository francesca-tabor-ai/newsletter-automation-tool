'use client'

import { useState } from 'react'
import type { DebugInfo } from '@/lib/auth/errors'

interface DebugPanelProps {
  debugInfo: DebugInfo | null
  show?: boolean
}

export function DebugPanel({ debugInfo, show = false }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development or when explicitly enabled
  const shouldShow = show || process.env.NODE_ENV === 'development'

  if (!shouldShow || !debugInfo) {
    return null
  }

  return (
    <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-left text-sm font-medium text-gray-700 flex items-center justify-between transition-colors"
      >
        <span>🔍 Debug Details</span>
        <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 text-xs font-mono space-y-3">
          {/* Timestamp */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">Timestamp</div>
            <div className="text-gray-600">{debugInfo.timestamp}</div>
          </div>

          {/* Auth Method */}
          {debugInfo.authMethod && (
            <div>
              <div className="font-semibold text-gray-700 mb-1">Auth Method</div>
              <div className="text-gray-600">{debugInfo.authMethod}</div>
            </div>
          )}

          {/* Environment Status */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">Environment Check</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span>{debugInfo.envStatus.hasUrl ? '✅' : '❌'}</span>
                <span className="text-gray-600">Supabase URL configured</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{debugInfo.envStatus.hasAnonKey ? '✅' : '❌'}</span>
                <span className="text-gray-600">Supabase anon key configured</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{debugInfo.envStatus.isValid ? '✅' : '❌'}</span>
                <span className="text-gray-600">
                  Configuration {debugInfo.envStatus.isValid ? 'valid' : 'invalid'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Information */}
          {debugInfo.error && (
            <div>
              <div className="font-semibold text-gray-700 mb-1">Error Details</div>
              <div className="space-y-1">
                <div>
                  <span className="text-gray-500">Category: </span>
                  <span className="text-red-600 font-semibold">{debugInfo.error.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Message: </span>
                  <span className="text-gray-600">{debugInfo.error.debugMessage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info message */}
          <div className="pt-2 border-t border-gray-200 text-gray-500 italic">
            This panel is only visible in development mode. No sensitive data is displayed.
          </div>
        </div>
      )}
    </div>
  )
}

