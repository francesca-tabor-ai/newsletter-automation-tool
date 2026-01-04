'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createDebugInfo, categorizeAuthError } from '@/lib/auth/errors'
import { DebugPanel } from '@/components/auth/DebugPanel'

export default function CallbackErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'unknown'
  const description = searchParams.get('description') || 'An unknown error occurred'

  const categorized = categorizeAuthError({
    message: description,
    code: error,
  })

  const debugInfo = createDebugInfo('magic-link', categorized)

  return (
    <div className="flex items-center justify-center px-4 min-h-screen">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-gray-900">Sign In Failed</h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem completing your sign in
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="font-semibold mb-1">{categorized.category.replace(/_/g, ' ')}</div>
          <div>{categorized.uiMessage}</div>
        </div>

        <DebugPanel debugInfo={debugInfo} show />

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

