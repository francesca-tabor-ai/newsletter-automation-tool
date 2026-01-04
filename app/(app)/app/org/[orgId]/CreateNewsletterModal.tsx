'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createNewsletter } from '@/app/actions/newsletters'
import { useEffect } from 'react'

interface CreateNewsletterModalProps {
  orgId: string
  isOpen: boolean
  onClose: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Creating...' : 'Create Newsletter'}
    </button>
  )
}

export default function CreateNewsletterModal({
  orgId,
  isOpen,
  onClose,
}: CreateNewsletterModalProps) {
  const createNewsletterWithOrgId = createNewsletter.bind(null, orgId)
  const [state, formAction] = useFormState(createNewsletterWithOrgId, null)

  // Close modal on successful creation
  useEffect(() => {
    if (state?.success) {
      onClose()
    }
  }, [state, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Newsletter
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Newsletter Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Weekly Tech Digest"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="fromName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Name *
              </label>
              <input
                type="text"
                id="fromName"
                name="fromName"
                required
                placeholder="Acme Newsletter"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                This name will appear in subscribers' inboxes
              </p>
            </div>

            <div>
              <label
                htmlFor="fromEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Email
              </label>
              <input
                type="email"
                id="fromEmail"
                name="fromEmail"
                placeholder="newsletter@acme.com"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
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

