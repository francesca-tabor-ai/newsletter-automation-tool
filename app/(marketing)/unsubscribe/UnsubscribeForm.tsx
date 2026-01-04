'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export default function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  
  const [status, setStatus] = useState<'loading' | 'confirming' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Invalid or missing unsubscribe link')
      return
    }

    // Verify token
    const payload = verifyUnsubscribeToken(token)
    if (!payload) {
      setStatus('error')
      setError('Invalid or expired unsubscribe link')
      return
    }

    setEmail(payload.email)
    setStatus('confirming')
  }, [token])

  const handleUnsubscribe = async () => {
    if (!token) return

    setStatus('loading')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(data.error || 'Failed to unsubscribe')
      }
    } catch (err) {
      setStatus('error')
      setError('An unexpected error occurred')
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Successfully Unsubscribed
          </h2>
          <p className="mt-2 text-gray-600">
            You have been unsubscribed from this newsletter.
          </p>
          {email && (
            <p className="mt-2 text-sm text-gray-500">
              Email: {email}
            </p>
          )}
          <p className="mt-6 text-sm text-gray-500">
            We're sorry to see you go. If you change your mind, you can always
            resubscribe later.
          </p>
        </div>
      </div>
    )
  }

  // Confirming status
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Confirm Unsubscribe
        </h2>
        <p className="mt-2 text-gray-600">
          Are you sure you want to unsubscribe from this newsletter?
        </p>
        {email && (
          <p className="mt-2 text-sm text-gray-500">
            Email: {email}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={handleUnsubscribe}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Yes, Unsubscribe
          </button>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

