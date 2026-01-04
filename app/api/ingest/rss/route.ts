import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import pLimit from 'p-limit'
import { createClient } from '@supabase/supabase-js'
import {
  normalizeUrl,
  computeContentHash,
  extractContent,
  parseDate,
  extractImageUrl,
} from '@/lib/ingestion'

// Initialize Supabase client with service role for server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// RSS parser instance
const parser = new Parser({
  timeout: 15000, // 15 second timeout per feed
  headers: {
    'User-Agent': 'AutoNews/1.0 RSS Ingestion Bot',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

// Rate limiting: max 5 concurrent feed fetches
const limit = pLimit(5)

interface IngestionResult {
  success: boolean
  stats: {
    sourcesProcessed: number
    sourcesSucceeded: number
    sourcesFailed: number
    itemsProcessed: number
    itemsCreated: number
    itemsUpdated: number
    itemsSkipped: number
  }
  errors: Array<{
    sourceId: string
    sourceName: string
    error: string
  }>
}

/**
 * Fetch and parse a single RSS feed
 */
async function fetchFeed(source: any) {
  try {
    const feed = await parser.parseURL(source.url)
    return {
      success: true,
      feed,
      source,
    }
  } catch (error) {
    console.error(`Error fetching feed ${source.url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source,
    }
  }
}

/**
 * Process a single feed item and upsert into database
 */
async function processItem(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  item: any,
  source: any
) {
  // Extract and normalize URL
  const rawUrl = item.link || item.guid
  if (!rawUrl) {
    return { action: 'skipped', reason: 'No URL' }
  }

  const canonicalUrl = normalizeUrl(rawUrl)
  const title = item.title?.trim() || 'Untitled'

  // Compute hash for deduplication
  const hash = computeContentHash(canonicalUrl, title)

  // Extract content
  const { summary, content_text, content_html } = extractContent(item)

  // Parse published date
  const publishedAt = parseDate(item.pubDate || item.isoDate)

  // Extract image
  const imageUrl = extractImageUrl(item)

  // Extract author
  const author = item.creator || item.author || null

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('items')
    .select('id, created_at')
    .eq('org_id', source.org_id)
    .eq('hash', hash)
    .single()

  if (existingItem) {
    // Item exists, potentially update it
    const { error: updateError } = await supabase
      .from('items')
      .update({
        title,
        url: rawUrl,
        canonical_url: canonicalUrl,
        author,
        summary,
        content_text,
        content_html,
        image_url: imageUrl,
      })
      .eq('id', existingItem.id)

    if (updateError) {
      console.error('Error updating item:', updateError)
      return { action: 'error', error: updateError.message }
    }

    return { action: 'updated' }
  }

  // Create new item
  const { error: insertError } = await supabase.from('items').insert({
    org_id: source.org_id,
    source_id: source.id,
    url: rawUrl,
    canonical_url: canonicalUrl,
    title,
    author,
    published_at: publishedAt?.toISOString() || null,
    summary,
    content_text,
    content_html,
    image_url: imageUrl,
    hash,
  })

  if (insertError) {
    // Check if it's a unique constraint violation (race condition)
    if (insertError.code === '23505') {
      return { action: 'skipped', reason: 'Already exists (race condition)' }
    }
    console.error('Error inserting item:', insertError)
    return { action: 'error', error: insertError.message }
  }

  return { action: 'created' }
}

/**
 * Update source last_fetched_at timestamp
 */
async function updateSourceTimestamp(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sourceId: string,
  status: string
) {
  await supabase
    .from('sources')
    .update({
      last_fetched_at: new Date().toISOString(),
      last_fetch_status: status,
    })
    .eq('id', sourceId)
}

/**
 * POST /api/ingest/rss
 * 
 * Ingest all active RSS sources
 */
export async function POST() {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  const result: IngestionResult = {
    success: true,
    stats: {
      sourcesProcessed: 0,
      sourcesSucceeded: 0,
      sourcesFailed: 0,
      itemsProcessed: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      itemsSkipped: 0,
    },
    errors: [],
  }

  try {
    // Fetch all active RSS sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, org_id, url, name, type')
      .eq('type', 'rss')
      .eq('is_active', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json({
        ...result,
        message: 'No active RSS sources found',
        duration: Date.now() - startTime,
      })
    }

    console.log(`Starting ingestion for ${sources.length} sources...`)

    // Fetch all feeds with concurrency control
    const feedResults = await Promise.all(
      sources.map((source) => limit(() => fetchFeed(source)))
    )

    // Process each feed
    for (const feedResult of feedResults) {
      result.stats.sourcesProcessed++

      if (!feedResult.success) {
        result.stats.sourcesFailed++
        result.errors.push({
          sourceId: feedResult.source.id,
          sourceName: feedResult.source.name,
          error: feedResult.error || 'Unknown error',
        })
        await updateSourceTimestamp(supabase, feedResult.source.id, 'failed')
        continue
      }

      result.stats.sourcesSucceeded++
      const { feed, source } = feedResult

      console.log(
        `Processing ${feed.items?.length || 0} items from ${source.name}...`
      )

      // Process each item in the feed
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items) {
          result.stats.itemsProcessed++

          const itemResult = await processItem(supabase, item, source)

          if (itemResult.action === 'created') {
            result.stats.itemsCreated++
          } else if (itemResult.action === 'updated') {
            result.stats.itemsUpdated++
          } else if (itemResult.action === 'skipped') {
            result.stats.itemsSkipped++
          }
        }
      }

      await updateSourceTimestamp(supabase, source.id, 'success')
    }

    const duration = Date.now() - startTime

    console.log('Ingestion complete:', {
      ...result.stats,
      duration: `${duration}ms`,
    })

    return NextResponse.json({
      ...result,
      message: 'Ingestion complete',
      duration,
    })
  } catch (error) {
    console.error('Ingestion error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: result.stats,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ingest/rss
 * 
 * Health check / info endpoint
 */
export async function GET() {
  const supabase = getSupabaseAdmin()

  try {
    const { data: sources, error } = await supabase
      .from('sources')
      .select('id, name, url, is_active, last_fetched_at, last_fetch_status')
      .eq('type', 'rss')

    if (error) {
      throw error
    }

    const activeSources = sources?.filter((s) => s.is_active) || []
    const inactiveSources = sources?.filter((s) => !s.is_active) || []

    return NextResponse.json({
      status: 'ready',
      sources: {
        total: sources?.length || 0,
        active: activeSources.length,
        inactive: inactiveSources.length,
      },
      activeSources: activeSources.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        lastFetched: s.last_fetched_at,
        lastStatus: s.last_fetch_status,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

