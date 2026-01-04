import SignOutButton from '@/components/auth/SignOutButton'

export default function AppPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <SignOutButton />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <p className="text-gray-700 text-lg">
          This page can only be seen by logged-in users.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Workspaces</h3>
          <p className="text-sm text-gray-600">
            Create and manage your newsletter workspaces
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Newsletters</h3>
          <p className="text-sm text-gray-600">
            Set up automated newsletters from RSS feeds
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-sm text-gray-600">
            Track performance and engagement metrics
          </p>
        </div>
      </div>
    </div>
  )
}

