'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createOrganization } from '@/app/actions/organizations'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Creating...' : 'Create Organization'}
    </button>
  )
}

export default function OnboardingForm() {
  const [state, formAction] = useFormState(createOrganization, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Organization Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoFocus
          placeholder="Acme Corp"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          This will be the name of your workspace
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}

