'use client'

import { useState } from 'react'
import Link from 'next/link'

interface IssueStats {
  id: string
  title: string
  sent_at: string
  sent: number
  opens: number
  clicks: number
  open_rate: number
  click_rate: number
}

interface TopUrl {
  url: string
  count: number
}

interface AnalyticsTabProps {
  orgId: string
  newsletterId: string
  issues: IssueStats[]
  topUrls: TopUrl[]
}

export default function AnalyticsTab({
  orgId,
  newsletterId,
  issues,
  topUrls,
}: AnalyticsTabProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  // Calculate totals
  const totals = issues.reduce(
    (acc, issue) => ({
      sent: acc.sent + issue.sent,
      opens: acc.opens + issue.opens,
      clicks: acc.clicks + issue.clicks,
    }),
    { sent: 0, opens: 0, clicks: 0 }
  )

  const avgOpenRate = totals.sent
    ? (totals.opens / totals.sent) * 100
    : 0
  const avgClickRate = totals.sent
    ? (totals.clicks / totals.sent) * 100
    : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track opens, clicks, and engagement for your newsletter
        </p>
      </div>

      {issues.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analytics Yet
          </h3>
          <p className="text-gray-600">
            Send your first issue to start tracking analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Sent
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {totals.sent.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Opens
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {totals.opens.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Clicks
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {totals.clicks.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-500">
                Avg Open Rate
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {avgOpenRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm font-medium text-gray-500">
                Avg Click Rate
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {avgClickRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Issues Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Issue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sent
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Opens
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Clicks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Open Rate
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Click Rate
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/app/org/${orgId}/newsletters/${newsletterId}/issues/${issue.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {issue.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.sent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {issue.opens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {issue.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.open_rate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.click_rate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(issue.sent_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Clicked URLs */}
          {topUrls.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Clicked URLs
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Most popular links across all issues
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        URL
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topUrls.map((urlData, index) => (
                      <tr key={urlData.url} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600">
                          <a
                            href={urlData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate block max-w-xl"
                          >
                            {urlData.url}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {urlData.count} clicks
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Understanding Analytics
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>
                • <strong>Open Rate:</strong> Percentage of recipients who opened
                the email (tracked via pixel)
              </li>
              <li>
                • <strong>Click Rate:</strong> Percentage of recipients who clicked
                any link in the email
              </li>
              <li>
                • <strong>Note:</strong> Open tracking requires image loading,
                which some email clients block
              </li>
              <li>
                • <strong>Benchmarks:</strong> Typical open rates are 15-25%, click
                rates are 2-5%
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

