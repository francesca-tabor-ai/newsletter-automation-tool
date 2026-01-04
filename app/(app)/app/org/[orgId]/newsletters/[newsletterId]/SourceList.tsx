'use client'

import { useState } from 'react'
import {
  toggleNewsletterSource,
  removeSourceFromNewsletter,
} from '@/app/actions/sources'

interface Source {
  section_title: string | null
  sort_order: number
  is_enabled: boolean
  created_at: string
  sources: {
    id: string
    name: string
    url: string
    type: string
    is_active: boolean
    last_fetched_at: string | null
    last_fetch_status: string | null
  }
}

interface SourceListProps {
  orgId: string
  newsletterId: string
  sources: Source[]
}

export default function SourceList({
  orgId,
  newsletterId,
  sources,
}: SourceListProps) {
  const [toggling, setToggling] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const handleToggle = async (sourceId: string) => {
    setToggling(sourceId)
    await toggleNewsletterSource(orgId, newsletterId, sourceId)
    setToggling(null)
  }

  const handleRemove = async (sourceId: string) => {
    setRemoving(sourceId)
    await removeSourceFromNewsletter(orgId, newsletterId, sourceId)
    setRemoving(null)
    setConfirmRemove(null)
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => {
        const sourceData = source.sources
        const isToggling = toggling === sourceData.id
        const isRemoving = removing === sourceData.id

        return (
          <div
            key={sourceData.id}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Source Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sourceData.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        source.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {source.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {/* URL */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <a
                      href={sourceData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {sourceData.url}
                    </a>
                  </div>

                  {/* Section Title */}
                  {source.section_title && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Section: {source.section_title}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <span>Added {new Date(source.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Order: #{source.sort_order}</span>
                    {sourceData.last_fetched_at && (
                      <>
                        <span>•</span>
                        <span>
                          Last fetched:{' '}
                          {new Date(sourceData.last_fetched_at).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggle(sourceData.id)}
                    disabled={isToggling}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                  >
                    {isToggling
                      ? 'Updating...'
                      : source.is_enabled
                      ? 'Disable'
                      : 'Enable'}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(sourceData.id)}
                    disabled={isRemoving}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmRemove === sourceData.id && (
              <div className="bg-red-50 border-t border-red-200 px-6 py-4">
                <p className="text-sm text-red-800 mb-3">
                  Remove this source from the newsletter? The source will still exist
                  in your organization and can be re-added later.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemove(sourceData.id)}
                    disabled={isRemoving}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    {isRemoving ? 'Removing...' : 'Yes, Remove'}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(null)}
                    disabled={isRemoving}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

