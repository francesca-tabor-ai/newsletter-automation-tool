import { notFound } from 'next/navigation'
import { getOrganization } from '@/app/actions/organizations'
import { getNewsletters } from '@/app/actions/newsletters'
import CreateNewsletterButton from './CreateNewsletterButton'

export default async function OrgDashboardPage({
  params,
}: {
  params: { orgId: string }
}) {
  const { orgId } = await params
  const [org, newsletters] = await Promise.all([
    getOrganization(orgId),
    getNewsletters(orgId),
  ])

  if (!org) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your newsletters and content sources
        </p>
      </div>

      {/* Newsletters Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Newsletters
            </h2>
            {newsletters.length > 0 && (
              <Link
                href={`/app/org/${orgId}/newsletters`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            )}
          </div>
          <CreateNewsletterButton orgId={orgId} />
        </div>

        {newsletters.length === 0 ? (
          /* Empty State */
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No newsletters yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Get started by creating your first newsletter. You'll be able to
              add RSS sources and automate your content.
            </p>
            <CreateNewsletterButton orgId={orgId} variant="primary" />
          </div>
        ) : (
          /* Newsletter List */
          <div className="divide-y">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {newsletter.name}
                      </h3>
                      {newsletter.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>From: {newsletter.from_name}</span>
                      {newsletter.from_email && (
                        <span className="text-gray-400">•</span>
                      )}
                      {newsletter.from_email && <span>{newsletter.from_email}</span>}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Created{' '}
                      {new Date(newsletter.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/app/org/${orgId}/newsletters/${newsletter.id}`}
                    className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Newsletters
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {newsletters.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Sources</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-1">Coming soon</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Subscribers
          </div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-1">Coming soon</div>
        </div>
      </div>
    </div>
  )
}

