'use client'

import ReactMarkdown from 'react-markdown'

interface Newsletter {
  id: string
  name: string
  from_name: string
  from_email: string | null
  reply_to: string | null
}

interface IssueItem {
  id: string
  position: number
  removed: boolean
  custom_title: string | null
  custom_summary: string | null
  items: {
    id: string
    title: string
    url: string
    canonical_url: string
    author: string | null
    published_at: string
    summary: string | null
    content_text: string | null
    content_html: string | null
    image_url: string | null
    sources: {
      id: string
      name: string
      url: string
    } | null
  }
}

interface Issue {
  id: string
  title: string
  status: string
  intro_md: string | null
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
}

interface PreviewPanelProps {
  newsletter: Newsletter
  issue: Issue
  items: IssueItem[]
  introMd: string
}

export default function PreviewPanel({
  newsletter,
  issue,
  items,
  introMd,
}: PreviewPanelProps) {
  const activeItems = items.filter((item) => !item.removed)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
        <p className="text-sm text-gray-500">
          How your newsletter will appear to subscribers
        </p>
      </div>

      {/* Email Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
        {/* Email Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">{issue.title}</h1>
          <p className="text-blue-100 text-sm">
            From {newsletter.from_name} • {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Email Body */}
        <div className="px-6 py-6">
          {/* Introduction */}
          {introMd && (
            <div className="mb-8 prose prose-sm max-w-none">
              <ReactMarkdown>{introMd}</ReactMarkdown>
            </div>
          )}

          {/* Items */}
          <div className="space-y-6">
            {activeItems.map((issueItem, index) => {
              const item = issueItem.items
              const title = issueItem.custom_title || item.title
              const summary = issueItem.custom_summary || item.summary

              return (
                <div
                  key={issueItem.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  {/* Item Number */}
                  <div className="text-xs font-semibold text-blue-600 mb-2">
                    ARTICLE {index + 1}
                  </div>

                  {/* Item Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    <a
                      href={item.url}
                      className="hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {title}
                    </a>
                  </h3>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    {item.sources && (
                      <>
                        <span>{item.sources.name}</span>
                        <span>•</span>
                      </>
                    )}
                    {item.author && (
                      <>
                        <span>by {item.author}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Item Summary */}
                  {summary && (
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {summary}
                    </p>
                  )}

                  {/* Read More Link */}
                  <a
                    href={item.url}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more →
                  </a>
                </div>
              )
            })}
          </div>

          {/* No items message */}
          {activeItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No items in this issue yet.</p>
              <p className="text-xs mt-1">
                Add items from the editor panel on the left.
              </p>
            </div>
          )}
        </div>

        {/* Email Footer */}
        <div className="bg-gray-50 px-6 py-6 text-center border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">
            You're receiving this email because you subscribed to{' '}
            {newsletter.name}.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Unsubscribe
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Manage Preferences
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              View in Browser
            </a>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Preview is approximate. Actual rendering may vary by email client.
        </p>
      </div>
    </div>
  )
}

