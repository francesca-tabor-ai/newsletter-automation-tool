/**
 * RSS Ingestion Utilities
 * 
 * Handles RSS feed fetching, parsing, URL normalization, and hashing
 */

import crypto from 'crypto'

/**
 * Normalize URL by removing tracking parameters
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Common tracking parameters to remove
    const trackingParams = [
      // Google Analytics
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      // Facebook
      'fbclid',
      // Mail trackers
      'mc_cid', 'mc_eid',
      // General trackers
      'ref', 'referrer', 'source',
      // HubSpot
      '_hsenc', '_hsmi',
      // Marketo
      'mkt_tok',
      // Other common trackers
      'WT.mc_id', 'ncid', 'nr_email_referer', 'vero_id'
    ]

    // Remove tracking parameters
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })

    // Remove trailing slash for consistency
    let normalized = urlObj.toString()
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1)
    }

    return normalized
  } catch (error) {
    // If URL parsing fails, return original
    return url
  }
}

/**
 * Compute SHA-256 hash for content deduplication
 */
export function computeContentHash(canonicalUrl: string, title: string): string {
  const content = `${canonicalUrl}||${title}`
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * Strip HTML tags from content
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Extract text content from RSS item
 */
export function extractContent(item: any): {
  summary: string | null
  content_text: string | null
  content_html: string | null
} {
  let summary: string | null = null
  let content_text: string | null = null
  let content_html: string | null = null

  // Extract summary
  if (item.contentSnippet) {
    summary = item.contentSnippet.substring(0, 500)
  } else if (item.summary) {
    summary = stripHtml(item.summary).substring(0, 500)
  } else if (item.description) {
    summary = stripHtml(item.description).substring(0, 500)
  }

  // Extract content
  if (item.content) {
    content_html = item.content.substring(0, 10000) // Limit to 10KB
    content_text = stripHtml(item.content).substring(0, 5000) // Limit to 5KB
  } else if (item['content:encoded']) {
    content_html = item['content:encoded'].substring(0, 10000)
    content_text = stripHtml(item['content:encoded']).substring(0, 5000)
  } else if (item.description && item.description.length > 200) {
    // Use description as content if it's long enough
    content_html = item.description.substring(0, 10000)
    content_text = stripHtml(item.description).substring(0, 5000)
  }

  return {
    summary,
    content_text,
    content_html,
  }
}

/**
 * Parse date safely
 */
export function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    // Check if valid date
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

/**
 * Extract image URL from content
 */
export function extractImageUrl(item: any): string | null {
  // Check enclosure for images
  if (item.enclosure?.type?.startsWith('image/')) {
    return item.enclosure.url
  }

  // Check media:content
  if (item['media:content']?.$ && item['media:content'].$.type?.startsWith('image/')) {
    return item['media:content'].$.url
  }

  // Check media:thumbnail
  if (item['media:thumbnail']?.$) {
    return item['media:thumbnail'].$.url
  }

  // Try to extract from content HTML
  if (item.content || item['content:encoded']) {
    const html = item.content || item['content:encoded']
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/)
    if (imgMatch) {
      return imgMatch[1]
    }
  }

  return null
}

