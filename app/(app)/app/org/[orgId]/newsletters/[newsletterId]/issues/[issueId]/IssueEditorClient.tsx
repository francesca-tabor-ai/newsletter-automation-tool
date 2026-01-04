'use client'

import { useState } from 'react'
import Link from 'next/link'
import EditorPanel from './EditorPanel'
import PreviewPanel from './PreviewPanel'

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
  items: IssueItem[]
}

interface IssueEditorClientProps {
  orgId: string
  newsletterId: string
  newsletter: Newsletter
  issue: Issue
}

export default function IssueEditorClient({
  orgId,
  newsletterId,
  newsletter,
  issue,
}: IssueEditorClientProps) {
  const [items, setItems] = useState<IssueItem[]>(issue.items)
  const [introMd, setIntroMd] = useState(issue.intro_md || '')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href={`/app/org/${orgId}/newsletters/${newsletterId}?tab=issues`}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Issues
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{issue.title}</span>
            </nav>

            {/* Right: Status Badge */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'frozen'
                    ? 'bg-blue-100 text-blue-800'
                    : issue.status === 'draft'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-64px)]">
          {/* Left: Editor */}
          <div className="bg-white border-r overflow-y-auto">
            <EditorPanel
              orgId={orgId}
              newsletterId={newsletterId}
              issueId={issue.id}
              items={items}
              setItems={setItems}
              introMd={introMd}
              setIntroMd={setIntroMd}
            />
          </div>

          {/* Right: Preview */}
          <div className="bg-gray-100 overflow-y-auto">
            <PreviewPanel
              newsletter={newsletter}
              issue={issue}
              items={items}
              introMd={introMd}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

