'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateNewsletter } from '@/app/actions/newsletters'
import { useEffect, useState } from 'react'

interface Newsletter {
  id: string
  name: string
  from_name: string
  from_email: string | null
  reply_to: string | null
  subject_template: string | null
}

interface NewsletterEditFormProps {
  newsletter: Newsletter
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

export default function NewsletterEditForm({
  newsletter,
}: NewsletterEditFormProps) {
  const updateNewsletterWithId = updateNewsletter.bind(null, newsletter.id)
  const [state, formAction] = useFormState(updateNewsletterWithId, null)
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
    <form action={formAction} className="px-6 py-6">
      {state?.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {state.error}
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          Newsletter updated successfully!
        </div>
      )}

      <div className="space-y-6">
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
            defaultValue={newsletter.name}
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
            defaultValue={newsletter.from_name}
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
            defaultValue={newsletter.from_email || ''}
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
            defaultValue={newsletter.reply_to || ''}
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
            defaultValue={newsletter.subject_template || ''}
            placeholder="📰 Weekly Digest - {{date}}"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Template for email subjects. Use variables like {'{'}
            {'{'}date{'}'}{'}'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

