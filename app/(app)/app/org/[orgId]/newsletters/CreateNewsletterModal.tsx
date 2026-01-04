'use client'

import { useState } from 'react'
import CreateNewsletterForm from './CreateNewsletterForm'

interface CreateNewsletterModalProps {
  orgId: string
  variant?: 'primary' | 'secondary'
}

export default function CreateNewsletterModal({
  orgId,
  variant = 'secondary',
}: CreateNewsletterModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const buttonClasses =
    variant === 'primary'
      ? 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors'
      : 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors'

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClasses}>
        Create Newsletter
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Newsletter
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <CreateNewsletterForm
              orgId={orgId}
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

