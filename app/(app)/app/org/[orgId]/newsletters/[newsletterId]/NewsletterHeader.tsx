import NewsletterActions from './NewsletterActions'

interface Newsletter {
  id: string
  org_id: string
  name: string
  is_active: boolean
  created_at: string
}

interface NewsletterHeaderProps {
  newsletter: Newsletter
}

export default function NewsletterHeader({
  newsletter,
}: NewsletterHeaderProps) {
  return (
    <div className="mb-6">
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
  )
}

