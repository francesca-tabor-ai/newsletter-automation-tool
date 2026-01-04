'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createNewsletter } from '@/app/actions/newsletters'
import { useEffect } from 'react'

interface CreateNewsletterFormProps {
  orgId: string
  onSuccess: () => void
  onCancel: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Creating...' : 'Create Newsletter'}
    </button>
  )
}

export default function CreateNewsletterForm({
  orgId,
  onSuccess,
  onCancel,
}: CreateNewsletterFormProps) {
  const createNewsletterWithOrgId = createNewsletter.bind(null, orgId)
  const [state, formAction] = useFormState(createNewsletterWithOrgId, null)

  // Close modal on successful creation
  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
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
          <p className="mt-1 text-xs text-gray-500">
            The name of your newsletter
          </p>
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
          <p className="mt-1 text-xs text-gray-500">
            The email address newsletters will be sent from
          </p>
        </div>

        <div>
          <label
            htmlFor="replyTo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reply-To Email
          </label>
          <input
            type="email"
            id="replyTo"
            name="replyTo"
            placeholder="replies@acme.com"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where replies should be sent (optional)
          </p>
        </div>

        <div>
          <label
            htmlFor="subjectTemplate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject Template
          </label>
          <input
            type="text"
            id="subjectTemplate"
            name="subjectTemplate"
            placeholder="📰 Weekly Digest - {{date}}"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Template for email subjects. Use variables like {'{'}
            {'{'}date{'}'}{'}'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <SubmitButton />
      </div>
    </form>
  )
}

