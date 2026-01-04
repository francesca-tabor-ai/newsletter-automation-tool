import OnboardingForm from './OnboardingForm'

export default function OnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AutoNews!
          </h1>
          <p className="text-gray-600">
            Let's get started by creating your organization
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <OnboardingForm />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          You can create multiple organizations later from your dashboard
        </div>
      </div>
    </div>
  )
}

