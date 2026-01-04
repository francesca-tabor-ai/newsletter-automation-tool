import { notFound } from 'next/navigation'
import { getOrganization } from '@/app/actions/organizations'
import { getNewsletter } from '@/app/actions/newsletters'
import Link from 'next/link'

export default async function IssueEditorPage({
  params,
}: {
  params: { orgId: string; newsletterId: string; issueId: string }
}) {
  const { orgId, newsletterId, issueId } = await params

  const [org, newsletter] = await Promise.all([
    getOrganization(orgId),
    getNewsletter(newsletterId),
  ])

  if (!org || !newsletter) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4 text-sm">
          <li>
            <Link href="/app" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link
              href={`/app/org/${orgId}/newsletters`}
              className="text-gray-500 hover:text-gray-700"
            >
              Newsletters
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link
              href={`/app/org/${orgId}/newsletters/${newsletterId}?tab=issues`}
              className="text-gray-500 hover:text-gray-700"
            >
              {newsletter.name}
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li className="text-gray-900">Issue Editor</li>
        </ol>
      </nav>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Issue Created Successfully!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Issue ID: <code className="bg-gray-100 px-2 py-1 rounded">{issueId}</code>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            What's Next?
          </h2>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              ✅ Draft issue has been generated with selected content
            </li>
            <li>
              🎨 Issue editor UI coming soon (reorder items, remove, add notes)
            </li>
            <li>
              📧 Email template rendering and preview coming soon
            </li>
            <li>
              🚀 Send/schedule functionality coming soon
            </li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href={`/app/org/${orgId}/newsletters/${newsletterId}?tab=issues`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Back to Issues
          </Link>
          <Link
            href={`/app/org/${orgId}/newsletters/${newsletterId}?tab=settings`}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Newsletter Settings
          </Link>
        </div>
      </div>
    </div>
  )
}

