'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { addRssSource, testRssFeed } from '@/app/actions/sources'
import { useEffect, useState } from 'react'

interface AddSourceModalProps {
  orgId: string
  newsletterId: string
  isOpen: boolean
  onClose: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Adding Source...' : 'Add Source'}
    </button>
  )
}

export default function AddSourceModal({
  orgId,
  newsletterId,
  isOpen,
  onClose,
}: AddSourceModalProps) {
  const addRssSourceWithParams = addRssSource.bind(null, orgId, newsletterId)
  const [state, formAction] = useFormState(addRssSourceWithParams, null)
  const [isTestingUrl, setIsTestingUrl] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [url, setUrl] = useState('')

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      onClose()
      // Reset form
      setUrl('')
      setTestResult(null)
    }
  }, [state, onClose])

  const handleTestUrl = async () => {
    if (!url.trim()) return

    setIsTestingUrl(true)
    setTestResult(null)

    const result = await testRssFeed(url.trim())
    setTestResult(result)
    setIsTestingUrl(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add RSS Source
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add an RSS feed to automatically pull content
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <form action={formAction} className="px-6 py-4">
          {state?.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          {state?.success && state.feedInfo && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
              <div className="font-medium mb-1">RSS feed added successfully!</div>
              <div className="text-xs">
                Found {state.feedInfo.itemCount} items in "{state.feedInfo.title}"
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* RSS URL */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                RSS Feed URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="url"
                  name="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleTestUrl}
                  disabled={isTestingUrl || !url.trim()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                >
                  {isTestingUrl ? 'Testing...' : 'Test'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                The URL of the RSS or Atom feed
              </p>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`mt-2 p-3 rounded text-sm ${
                    testResult.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {testResult.success ? (
                    <div>
                      <div className="font-medium mb-1">✓ Valid RSS feed</div>
                      <div className="text-xs">
                        Feed title: "{testResult.title}"
                        <br />
                        Found {testResult.itemCount} items
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium mb-1">✗ Invalid RSS feed</div>
                      <div className="text-xs">{testResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Source Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Source Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Tech Blog"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                A friendly name for this source
              </p>
            </div>

            {/* Section Title */}
            <div>
              <label
                htmlFor="sectionTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Section Title
              </label>
              <input
                type="text"
                id="sectionTitle"
                name="sectionTitle"
                placeholder="Tech News"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional section heading in the newsletter (e.g., "Tech News",
                "Industry Updates")
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}

