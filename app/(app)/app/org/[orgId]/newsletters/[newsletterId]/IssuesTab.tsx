'use client'

import { useState } from 'react'
import { generateDraftIssue, deleteIssue } from '@/app/actions/issues'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Issue {
  id: string
  title: string
  status: string
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
  itemCount: number
}

interface IssuesTabProps {
  orgId: string
  newsletterId: string
  issues: Issue[]
}

export default function IssuesTab({
  orgId,
  newsletterId,
  issues,
}: IssuesTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerateDraft = async () => {
    setIsGenerating(true)
    setError(null)

    const result = await generateDraftIssue(orgId, newsletterId)

    setIsGenerating(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.issueId) {
      // Redirect to issue editor (placeholder for now)
      router.push(
        `/app/org/${orgId}/newsletters/${newsletterId}/issues/${result.issueId}`
      )
    }
  }

  const handleDelete = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) {
      return
    }

    setDeletingId(issueId)
    await deleteIssue(orgId, newsletterId, issueId)
    setDeletingId(null)
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
        frozen: {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Frozen',
        },
        scheduled: {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Scheduled',
        },
        sent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sent' },
        skipped: {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          label: 'Skipped',
        },
        failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      }

    const badge = badges[status] || badges.draft

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Issues</h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate and manage newsletter issues
          </p>
        </div>
        <button
          onClick={handleGenerateDraft}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Draft Issue'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {issues.length === 0 ? (
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No issues yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Generate your first draft issue to start creating your newsletter.
            Content will be selected based on your rules and sources.
          </p>
          <button
            onClick={handleGenerateDraft}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate First Issue'}
          </button>
        </div>
      ) : (
        /* Issues List */
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {issue.title}
                      </h3>
                      {getStatusBadge(issue.status)}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{issue.itemCount} items</span>
                      <span>•</span>
                      <span>
                        Created{' '}
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                      {issue.sent_at && (
                        <>
                          <span>•</span>
                          <span>
                            Sent {new Date(issue.sent_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {issue.scheduled_for && !issue.sent_at && (
                        <>
                          <span>•</span>
                          <span>
                            Scheduled for{' '}
                            {new Date(issue.scheduled_for).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/app/org/${orgId}/newsletters/${newsletterId}/issues/${issue.id}`}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
                    >
                      {issue.status === 'draft' ? 'Edit' : 'View'}
                    </Link>
                    {issue.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(issue.id)}
                        disabled={deletingId === issue.id}
                        className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === issue.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      {issues.length === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Before You Generate
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              • Make sure you have RSS sources added in the Sources tab
            </li>
            <li>
              • Configure content rules in the Rules tab to filter items
            </li>
            <li>
              • Run the ingestion pipeline to fetch content from your sources
            </li>
            <li>
              • Issue generation will select the best content based on your rules
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

