'use client'

import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useFormState, useFormStatus } from 'react-dom'
import { bulkAddSubscribers } from '@/app/actions/subscribers'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Subscribers'}
    </button>
  )
}

interface BulkAddModalProps {
  orgId: string
  newsletterId: string
  onClose: () => void
  onSuccess: () => void
}

export default function BulkAddModal({
  orgId,
  newsletterId,
  onClose,
  onSuccess,
}: BulkAddModalProps) {
  const bulkAddWithParams = bulkAddSubscribers.bind(null, orgId, newsletterId)
  const [state, formAction] = useFormState(bulkAddWithParams, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true)
      formRef.current?.reset()
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }
  }, [state, onSuccess])

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Bulk Add Subscribers
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Add multiple subscribers at once. Enter one email address per
                        line, or separate with commas or semicolons.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <form ref={formRef} action={formAction} className="space-y-4">
                    {state?.error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3">
                        <p className="text-sm text-red-700">{state.error}</p>
                      </div>
                    )}

                    {showSuccess && state?.success && (
                      <div className="rounded-md bg-green-50 border border-green-200 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              Bulk import completed!
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                              <ul className="list-disc list-inside space-y-1">
                                {state.added > 0 && (
                                  <li>Added {state.added} new subscriber(s)</li>
                                )}
                                {state.reactivated > 0 && (
                                  <li>Reactivated {state.reactivated} subscriber(s)</li>
                                )}
                                {state.skipped > 0 && (
                                  <li>Skipped {state.skipped} already active</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="emails"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email Addresses
                      </label>
                      <textarea
                        name="emails"
                        id="emails"
                        required
                        rows={12}
                        autoFocus
                        placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-mono"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: newline, comma, or semicolon separated.
                        Duplicates will be automatically removed.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Example formats:
                      </h4>
                      <div className="text-xs text-blue-800 font-mono space-y-1">
                        <div>user1@example.com</div>
                        <div>user2@example.com</div>
                        <div className="text-blue-600">or</div>
                        <div>user1@example.com, user2@example.com</div>
                        <div className="text-blue-600">or</div>
                        <div>user1@example.com; user2@example.com</div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                      <SubmitButton />
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

