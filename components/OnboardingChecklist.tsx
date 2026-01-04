'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

interface OnboardingChecklistProps {
  orgId: string
  newsletterId?: string
  hasNewsletter: boolean
  hasSources: boolean
  hasRules: boolean
  hasSubscribers: boolean
  hasSentIssue: boolean
}

export default function OnboardingChecklist({
  orgId,
  newsletterId,
  hasNewsletter,
  hasSources,
  hasRules,
  hasSubscribers,
  hasSentIssue,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const items: ChecklistItem[] = [
    {
      id: 'newsletter',
      title: 'Create your first newsletter',
      description: 'Set up your newsletter name and sender information',
      href: `/app/org/${orgId}/newsletters?create=true`,
      completed: hasNewsletter,
    },
    {
      id: 'sources',
      title: 'Add content sources',
      description: 'Connect RSS feeds or APIs to pull content from',
      href: newsletterId ? `/app/org/${orgId}/newsletters/${newsletterId}?tab=sources&addSource=true` : '#',
      completed: hasSources,
    },
    {
      id: 'rules',
      title: 'Configure filtering rules',
      description: 'Set keywords and preferences for content curation',
      href: newsletterId ? `/app/org/${orgId}/newsletters/${newsletterId}?tab=rules` : '#',
      completed: hasRules,
    },
    {
      id: 'subscribers',
      title: 'Add subscribers',
      description: 'Import your audience or add individual subscribers',
      href: newsletterId ? `/app/org/${orgId}/newsletters/${newsletterId}?tab=subscribers&add=true` : '#',
      completed: hasSubscribers,
    },
    {
      id: 'send',
      title: 'Send your first issue',
      description: 'Generate and send your first newsletter',
      href: newsletterId ? `/app/org/${orgId}/newsletters/${newsletterId}?tab=issues` : '#',
      completed: hasSentIssue,
    },
  ]

  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const progress = (completedCount / totalCount) * 100

  // Don't show if dismissed or all completed
  if (isDismissed || completedCount === totalCount) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🚀</span>
            Get Started with Newsletter Automation
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete these steps to start sending automated newsletters
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{completedCount} of {totalCount} completed</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={item.completed ? '#' : item.href}
            className={`
              block p-4 rounded-lg border transition-all
              ${
                item.completed
                  ? 'bg-white border-green-200 opacity-75'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }
            `}
            onClick={(e) => {
              if (item.completed || item.href === '#') {
                e.preventDefault()
              }
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              </div>
              {!item.completed && item.href !== '#' && (
                <div className="ml-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Start →
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

