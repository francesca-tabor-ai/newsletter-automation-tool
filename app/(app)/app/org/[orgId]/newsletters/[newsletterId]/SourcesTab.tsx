'use client'

import { useState } from 'react'
import AddSourceModal from './AddSourceModal'
import SourceList from './SourceList'

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

interface SourcesTabProps {
  orgId: string
  newsletterId: string
  sources: Source[]
}

export default function SourcesTab({
  orgId,
  newsletterId,
  sources,
}: SourcesTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Content Sources
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add RSS feeds to automatically pull content into your newsletter
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          Add RSS Source
        </button>
      </div>

      {sources.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No RSS sources yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Add RSS feeds from blogs, news sites, or any other source to
            automatically curate content for your newsletter
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Add Your First RSS Source
          </button>
        </div>
      ) : (
        /* Source List */
        <SourceList
          orgId={orgId}
          newsletterId={newsletterId}
          sources={sources}
        />
      )}

      {/* Add Source Modal */}
      <AddSourceModal
        orgId={orgId}
        newsletterId={newsletterId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}

