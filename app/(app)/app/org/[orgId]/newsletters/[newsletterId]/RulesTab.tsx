'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveNewsletterRules } from '@/app/actions/rules'
import { useEffect, useState } from 'react'

interface Rules {
  id?: string
  include_keywords: string[]
  exclude_keywords: string[]
  max_items: number
  lookback_days: number
  dedupe: boolean
}

interface RulesTabProps {
  orgId: string
  newsletterId: string
  rules: Rules | null
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Saving...' : 'Save Rules'}
    </button>
  )
}

export default function RulesTab({
  orgId,
  newsletterId,
  rules,
}: RulesTabProps) {
  const saveRulesWithParams = saveNewsletterRules.bind(
    null,
    orgId,
    newsletterId
  )
  const [state, formAction] = useFormState(saveRulesWithParams, null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Show success message
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Content Rules</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure how content is selected for your newsletter issues
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form action={formAction} className="px-6 py-6">
          {state?.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
              Rules saved successfully!
            </div>
          )}

          <div className="space-y-6">
            {/* Include Keywords */}
            <div>
              <label
                htmlFor="includeKeywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Include Keywords
              </label>
              <input
                type="text"
                id="includeKeywords"
                name="includeKeywords"
                defaultValue={rules?.include_keywords.join(', ') || ''}
                placeholder="AI, machine learning, technology"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma-separated keywords. Items must match at least one keyword
                (OR logic)
              </p>
            </div>

            {/* Exclude Keywords */}
            <div>
              <label
                htmlFor="excludeKeywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Exclude Keywords
              </label>
              <input
                type="text"
                id="excludeKeywords"
                name="excludeKeywords"
                defaultValue={rules?.exclude_keywords.join(', ') || ''}
                placeholder="cryptocurrency, NFT, sponsored"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma-separated keywords. Items matching any keyword will be
                excluded
              </p>
            </div>

            {/* Max Items */}
            <div>
              <label
                htmlFor="maxItems"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Maximum Items
              </label>
              <input
                type="number"
                id="maxItems"
                name="maxItems"
                min="1"
                max="100"
                defaultValue={rules?.max_items || 15}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum number of items to include in each issue (1-100)
              </p>
            </div>

            {/* Lookback Days */}
            <div>
              <label
                htmlFor="lookbackDays"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lookback Days (First Issue)
              </label>
              <input
                type="number"
                id="lookbackDays"
                name="lookbackDays"
                min="1"
                max="365"
                defaultValue={rules?.lookback_days || 62}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                How many days back to look for content when generating the first
                issue (1-365)
              </p>
            </div>

            {/* Dedupe */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="dedupe"
                  value="true"
                  defaultChecked={rules?.dedupe !== false}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Remove duplicate content
                </span>
              </label>
              <p className="mt-1 ml-6 text-xs text-gray-500">
                Automatically detect and remove duplicate items based on content
                hash
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          How Rules Work
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • <strong>First Issue:</strong> Looks back {rules?.lookback_days || 62}{' '}
            days for content, caps at {rules?.max_items || 15} items
          </li>
          <li>
            • <strong>Subsequent Issues:</strong> Only includes content since the
            last sent issue
          </li>
          <li>
            • <strong>Keywords:</strong> Searches in title, summary, and content
            (case-insensitive)
          </li>
          <li>
            • <strong>Deduplication:</strong> Prevents the same article from
            appearing multiple times
          </li>
        </ul>
      </div>
    </div>
  )
}

