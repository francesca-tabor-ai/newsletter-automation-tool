'use client'

import { useState } from 'react'
import CreateNewsletterModal from './CreateNewsletterModal'

interface CreateNewsletterButtonProps {
  orgId: string
  variant?: 'primary' | 'secondary'
}

export default function CreateNewsletterButton({
  orgId,
  variant = 'secondary',
}: CreateNewsletterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const buttonClasses =
    variant === 'primary'
      ? 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
      : 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium'

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={buttonClasses}>
        Create Newsletter
      </button>

      <CreateNewsletterModal
        orgId={orgId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

