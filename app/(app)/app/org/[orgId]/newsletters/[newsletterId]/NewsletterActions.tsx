'use client'

import { useState } from 'react'
import {
  toggleNewsletterStatus,
  deleteNewsletter,
} from '@/app/actions/newsletters'

interface Newsletter {
  id: string
  org_id: string
  is_active: boolean
}

interface NewsletterActionsProps {
  newsletter: Newsletter
}

export default function NewsletterActions({
  newsletter,
}: NewsletterActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleStatus = async () => {
    setIsToggling(true)
    await toggleNewsletterStatus(newsletter.id)
    setIsToggling(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteNewsletter(newsletter.id)
    // Redirect happens in server action
  }

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Active/Inactive */}
      <button
        onClick={handleToggleStatus}
        disabled={isToggling}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
      >
        {isToggling
          ? 'Updating...'
          : newsletter.is_active
          ? 'Deactivate'
          : 'Activate'}
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 font-medium transition-colors"
      >
        Delete
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Newsletter?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All subscribers, issues, and
              analytics data for this newsletter will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Newsletter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

