'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddSubscriberModal from './AddSubscriberModal'
import BulkAddModal from './BulkAddModal'
import SubscribersList from './SubscribersList'

interface Subscriber {
  id: string
  email: string
  status: string
  first_name: string | null
  last_name: string | null
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
  bounced: number
  complained: number
}

interface RecipientsTabProps {
  orgId: string
  newsletterId: string
  subscribers: Subscriber[]
  stats: Stats
}

export default function RecipientsTab({
  orgId,
  newsletterId,
  subscribers,
  stats,
}: RecipientsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()

  const filteredSubscribers = subscribers.filter((sub) => {
    if (filter === 'all') return true
    return sub.status === filter
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage subscribers for this newsletter
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
          >
            Bulk Add
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {stats.total}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {stats.active}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Unsubscribed</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">
            {stats.unsubscribed}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Bounced</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {stats.bounced}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Complained</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {stats.complained}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'active', label: 'Active', count: stats.active },
            {
              id: 'unsubscribed',
              label: 'Unsubscribed',
              count: stats.unsubscribed,
            },
            { id: 'bounced', label: 'Bounced', count: stats.bounced },
            { id: 'complained', label: 'Complained', count: stats.complained },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Subscribers List */}
      <SubscribersList
        orgId={orgId}
        newsletterId={newsletterId}
        subscribers={filteredSubscribers}
        onUpdate={() => router.refresh()}
      />

      {/* Modals */}
      {showAddModal && (
        <AddSubscriberModal
          orgId={orgId}
          newsletterId={newsletterId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}

      {showBulkModal && (
        <BulkAddModal
          orgId={orgId}
          newsletterId={newsletterId}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

