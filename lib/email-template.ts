/**
 * Email Template Builder
 * Generates HTML email templates for newsletters
 */

interface Newsletter {
  name: string
  from_name: string
  from_email: string | null
  reply_to: string | null
}

interface Issue {
  id: string
  title: string
  intro_md: string | null
}

interface IssueItem {
  position: number
  removed: boolean
  custom_title: string | null
  custom_summary: string | null
  items: {
    id: string
    title: string
    url: string
    summary: string | null
    published_at: string
    author: string | null
    sources: {
      name: string
    } | null
  }
}

interface EmailTemplateOptions {
  newsletter: Newsletter
  issue: Issue
  items: IssueItem[]
  subscriberEmail: string
  unsubscribeUrl: string
  trackingPixelUrl: string
  baseUrl: string
}

/**
 * Convert markdown to basic HTML
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  let html = markdown
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin: 0 0 1em 0; line-height: 1.6;">')
    .replace(/\n/g, '<br>')

  return `<p style="margin: 0 0 1em 0; line-height: 1.6;">${html}</p>`
}

/**
 * Create a tracked click URL
 */
function createTrackedUrl(
  originalUrl: string,
  issueId: string,
  subscriberId: string,
  baseUrl: string
): string {
  const encodedUrl = encodeURIComponent(originalUrl)
  return `${baseUrl}/api/track/click?url=${encodedUrl}&issue=${issueId}&subscriber=${subscriberId}`
}

/**
 * Build complete HTML email template
 */
export function buildEmailTemplate(options: EmailTemplateOptions): string {
  const {
    newsletter,
    issue,
    items,
    subscriberEmail,
    unsubscribeUrl,
    trackingPixelUrl,
    baseUrl,
  } = options

  const activeItems = items.filter((item) => !item.removed)
  const introHtml = issue.intro_md ? markdownToHtml(issue.intro_md) : ''

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${issue.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .intro {
      margin-bottom: 30px;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .article {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e5e7eb;
    }
    .article:last-child {
      border-bottom: none;
    }
    .article-label {
      color: #2563eb;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .article-title {
      margin: 0 0 10px 0;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
    }
    .article-title a {
      color: #111827;
      text-decoration: none;
    }
    .article-title a:hover {
      color: #2563eb;
    }
    .article-meta {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .article-summary {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .article-link {
      color: #2563eb;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
    }
    .article-link:hover {
      text-decoration: underline;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0 0 15px 0;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #6b7280;
      font-size: 13px;
      text-decoration: none;
      margin: 0 10px;
    }
    .footer-links a:hover {
      color: #111827;
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
      .article-title {
        font-size: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${issue.title}</h1>
      <p>From ${newsletter.from_name} • ${currentDate}</p>
    </div>

    <!-- Content -->
    <div class="content">
      ${
        introHtml
          ? `
      <!-- Introduction -->
      <div class="intro">
        ${introHtml}
      </div>
      `
          : ''
      }

      <!-- Articles -->
      ${activeItems
        .map((issueItem, index) => {
          const item = issueItem.items
          const title = issueItem.custom_title || item.title
          const summary = issueItem.custom_summary || item.summary
          const trackedUrl = createTrackedUrl(item.url, issue.id, subscriberEmail, baseUrl)

          let metaParts = []
          if (item.sources?.name) metaParts.push(item.sources.name)
          if (item.author) metaParts.push(`by ${item.author}`)
          if (item.published_at) {
            metaParts.push(
              new Date(item.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            )
          }
          const meta = metaParts.join(' • ')

          return `
      <div class="article">
        <div class="article-label">Article ${index + 1}</div>
        <h2 class="article-title">
          <a href="${trackedUrl}">${title}</a>
        </h2>
        ${meta ? `<div class="article-meta">${meta}</div>` : ''}
        ${summary ? `<div class="article-summary">${summary}</div>` : ''}
        <a href="${trackedUrl}" class="article-link">Read more →</a>
      </div>
      `
        })
        .join('')}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        You're receiving this email because you subscribed to ${newsletter.name}.
      </p>
      <p>
        Sent to: ${subscriberEmail}
      </p>
      <div class="footer-links">
        <a href="${unsubscribeUrl}">Unsubscribe</a>
        <span style="color: #d1d5db;">•</span>
        <a href="${baseUrl}/preferences?email=${encodeURIComponent(subscriberEmail)}">Manage Preferences</a>
        ${
          newsletter.reply_to
            ? `
        <span style="color: #d1d5db;">•</span>
        <a href="mailto:${newsletter.reply_to}">Contact Us</a>
        `
            : ''
        }
      </div>
    </div>
  </div>

  <!-- Tracking Pixel -->
  <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block; border:0;" />
</body>
</html>
  `.trim()
}

/**
 * Build plain text version
 */
export function buildPlainTextEmail(options: EmailTemplateOptions): string {
  const { newsletter, issue, items } = options

  const activeItems = items.filter((item) => !item.removed)
  const intro = issue.intro_md || ''

  let text = `${issue.title}\n`
  text += `From ${newsletter.from_name}\n`
  text += `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`

  if (intro) {
    text += `${intro.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')}\n\n`
  }

  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

  activeItems.forEach((issueItem, index) => {
    const item = issueItem.items
    const title = issueItem.custom_title || item.title
    const summary = issueItem.custom_summary || item.summary

    text += `ARTICLE ${index + 1}\n\n`
    text += `${title}\n`
    
    if (item.sources?.name || item.author) {
      let meta = []
      if (item.sources?.name) meta.push(item.sources.name)
      if (item.author) meta.push(`by ${item.author}`)
      text += `${meta.join(' • ')}\n`
    }

    if (summary) {
      text += `\n${summary}\n`
    }

    text += `\nRead more: ${item.url}\n\n`
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
  })

  text += `\n\nYou're receiving this email because you subscribed to ${newsletter.name}.\n`
  text += `Unsubscribe: ${options.unsubscribeUrl}\n`

  return text
}

