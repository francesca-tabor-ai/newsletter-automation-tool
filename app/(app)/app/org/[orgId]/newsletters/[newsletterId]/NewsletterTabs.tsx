'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import NewsletterEditForm from './NewsletterEditForm'
import SourcesTab from './SourcesTab'

interface Newsletter {
  id: string
  name: string
  from_name: string
  from_email: string | null
  reply_to: string | null
  subject_template: string | null
}

interface Source {
  section_title: string | null
  sort_order: number
  is_enabled: boolean
  created_at: string
  sources: {
    id: string
    name: string
    url: string
    type: string
    is_active: boolean
    last_fetched_at: string | null
    last_fetch_status: string | null
  }
}

interface NewsletterTabsProps {
  orgId: string
  newsletterId: string
  newsletter: Newsletter
  sources: Source[]
  currentTab: string
}

export default function NewsletterTabs({
  orgId,
  newsletterId,
  newsletter,
  sources,
  currentTab,
}: NewsletterTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'sources', name: 'Sources', icon: '📡', count: sources.length },
    { id: 'subscribers', name: 'Subscribers', icon: '👥', disabled: true },
    { id: 'issues', name: 'Issues', icon: '📰', disabled: true },
    { id: 'analytics', name: 'Analytics', icon: '📊', disabled: true },
  ]

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            const href = tab.disabled
              ? '#'
              : `${pathname}?tab=${tab.id}`

            return (
              <Link
                key={tab.id}
                href={href}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                onClick={(e) => tab.disabled && e.preventDefault()}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                    {tab.count}
                  </span>
                )}
                {tab.disabled && (
                  <span className="ml-2 text-xs text-gray-400">(Soon)</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {currentTab === 'settings' && (
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
        )}

        {currentTab === 'sources' && (
          <SourcesTab
            orgId={orgId}
            newsletterId={newsletterId}
            sources={sources}
          />
        )}

        {currentTab === 'subscribers' && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscriber Management
            </h3>
            <p className="text-gray-600">Coming soon</p>
          </div>
        )}

        {currentTab === 'issues' && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Issue Management
            </h3>
            <p className="text-gray-600">Coming soon</p>
          </div>
        )}

        {currentTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

