import { Suspense } from 'react'
import UnsubscribeForm from './UnsubscribeForm'

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  )
}

