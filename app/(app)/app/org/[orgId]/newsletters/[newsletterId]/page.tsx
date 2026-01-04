import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsletter } from '@/app/actions/newsletters'
import { getOrganization } from '@/app/actions/organizations'
import { getNewsletterSources } from '@/app/actions/sources'
import { getNewsletterRules } from '@/app/actions/rules'
import { getNewsletterIssues } from '@/app/actions/issues'
import { getNewsletterSubscribers, getSubscriberStats } from '@/app/actions/subscribers'
import { getNewsletterAnalytics } from '@/app/actions/analytics'
import NewsletterTabs from './NewsletterTabs'
import NewsletterHeader from './NewsletterHeader'

export default async function NewsletterDetailPage({
  params,
  searchParams,
}: {
  params: { orgId: string; newsletterId: string }
  searchParams: { tab?: string }
}) {
  const { orgId, newsletterId } = await params
  const { tab } = await searchParams
  
  const [org, newsletter, sources, rules, issues, subscribers, subscriberStats, analytics] = await Promise.all([
    getOrganization(orgId),
    getNewsletter(newsletterId),
    getNewsletterSources(orgId, newsletterId),
    getNewsletterRules(orgId, newsletterId),
    getNewsletterIssues(orgId, newsletterId),
    getNewsletterSubscribers(orgId, newsletterId),
    getSubscriberStats(orgId, newsletterId),
    getNewsletterAnalytics(orgId, newsletterId),
  ])

  if (!org || !newsletter) {
    notFound()
  }

  // Ensure newsletter belongs to org
  if (newsletter.org_id !== orgId) {
    notFound()
  }

  const currentTab = tab || 'settings'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <NewsletterHeader newsletter={newsletter} />

      {/* Tabs */}
      <NewsletterTabs
        orgId={orgId}
        newsletterId={newsletterId}
        newsletter={newsletter}
        sources={sources}
        rules={rules}
        issues={issues}
        subscribers={subscribers}
        subscriberStats={subscriberStats}
        analyticsIssues={analytics.issues}
        topUrls={analytics.topUrls}
        currentTab={currentTab}
      />
    </div>
  )
}
