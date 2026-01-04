'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateNewsletter } from '@/app/actions/newsletters'
import { useEffect, useState } from 'react'

interface Newsletter {
  id: string
  name: string
  from_name: string
  from_email: string | null
  reply_to: string | null
  subject_template: string | null
  schedule_enabled: boolean | null
  schedule_days: number[] | null
  schedule_time: string | null
  schedule_timezone: string | null
}

interface NewsletterEditFormProps {
  newsletter: Newsletter
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

export default function NewsletterEditForm({
  newsletter,
}: NewsletterEditFormProps) {
  const updateNewsletterWithId = updateNewsletter.bind(null, newsletter.id)
  const [state, formAction] = useFormState(updateNewsletterWithId, null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [scheduleEnabled, setScheduleEnabled] = useState(newsletter.schedule_enabled || false)
  const [selectedDays, setSelectedDays] = useState<number[]>(
    newsletter.schedule_days || [1, 2, 3, 4, 5]
  )

  // Show success message
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state])

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ]

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ]

  return (
    <form action={formAction} className="px-6 py-6">
      {state?.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {state.error}
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          Newsletter updated successfully!
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Newsletter Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={newsletter.name}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            The name of your newsletter
          </p>
        </div>

        <div>
          <label
            htmlFor="fromName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Name *
          </label>
          <input
            type="text"
            id="fromName"
            name="fromName"
            required
            defaultValue={newsletter.from_name}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This name will appear in subscribers' inboxes
          </p>
        </div>

        <div>
          <label
            htmlFor="fromEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Email
          </label>
          <input
            type="email"
            id="fromEmail"
            name="fromEmail"
            defaultValue={newsletter.from_email || ''}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            The email address newsletters will be sent from
          </p>
        </div>

        <div>
          <label
            htmlFor="replyTo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reply-To Email
          </label>
          <input
            type="email"
            id="replyTo"
            name="replyTo"
            defaultValue={newsletter.reply_to || ''}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where replies should be sent (optional)
          </p>
        </div>

        <div>
          <label
            htmlFor="subjectTemplate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject Template
          </label>
          <input
            type="text"
            id="subjectTemplate"
            name="subjectTemplate"
            defaultValue={newsletter.subject_template || ''}
            placeholder="📰 Weekly Digest - {{date}}"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Template for email subjects. Use variables like {'{'}
            {'{'}date{'}'}{'}'}
          </p>
        </div>

        {/* Scheduling Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Automated Scheduling
              </h3>
              <p className="text-sm text-gray-500">
                Automatically generate and send issues on a schedule
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="scheduleEnabled"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {scheduleEnabled && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week *
                </label>
                <div className="flex gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          selectedDays.includes(day.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="scheduleDays"
                  value={JSON.stringify(selectedDays)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select which days to generate issues
                </p>
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="scheduleTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time of Day *
                </label>
                <input
                  type="time"
                  id="scheduleTime"
                  name="scheduleTime"
                  defaultValue={newsletter.schedule_time || '09:00'}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  What time to generate and send issues (24-hour format)
                </p>
              </div>

              {/* Timezone */}
              <div>
                <label
                  htmlFor="scheduleTimezone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Timezone *
                </label>
                <select
                  id="scheduleTimezone"
                  name="scheduleTimezone"
                  defaultValue={newsletter.schedule_timezone || 'UTC'}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Timezone for scheduling
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  <strong>How it works:</strong> On the selected days at the specified
                  time, the system will automatically generate a new draft issue with
                  recent items. If there are no eligible items, the issue will be marked
                  as skipped. The issue will then be sent immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

