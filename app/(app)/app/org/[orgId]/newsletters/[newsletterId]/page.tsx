import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsletter } from '@/app/actions/newsletters'
import { getOrganization } from '@/app/actions/organizations'
import NewsletterEditForm from './NewsletterEditForm'
import NewsletterActions from './NewsletterActions'

export default async function NewsletterDetailPage({
  params,
}: {
  params: { orgId: string; newsletterId: string }
}) {
  const { orgId, newsletterId } = await params
  const [org, newsletter] = await Promise.all([
    getOrganization(orgId),
    getNewsletter(newsletterId),
  ])

  if (!org || !newsletter) {
    notFound()
  }

  // Ensure newsletter belongs to org
  if (newsletter.org_id !== orgId) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href={`/app/org/${orgId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {org.name}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href={`/app/org/${orgId}/newsletters`}
              className="text-gray-500 hover:text-gray-700"
            >
              Newsletters
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{newsletter.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {newsletter.name}
              </h1>
              {newsletter.is_active ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Created{' '}
              {new Date(newsletter.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <NewsletterActions newsletter={newsletter} />
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Newsletter Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your newsletter configuration
          </p>
        </div>
        <NewsletterEditForm newsletter={newsletter} />
      </div>

      {/* Additional Sections Placeholder */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sources</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage RSS feeds and content sources
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Configure Sources →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Subscribers
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage your subscriber list
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View Subscribers →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Issues</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create and manage newsletter issues
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View Issues →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Track opens, clicks, and engagement
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View Analytics →
          </button>
        </div>
      </div>
    </div>
  )
}

