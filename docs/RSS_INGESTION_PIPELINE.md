# RSS Ingestion Pipeline

## Overview

Automated RSS ingestion pipeline that fetches content from all active RSS sources, normalizes URLs, deduplicates content, and stores items in the database.

---

## Features

✅ **Fetches all active RSS sources** in parallel  
✅ **Rate limiting** with p-limit (5 concurrent feeds)  
✅ **URL normalization** strips tracking parameters  
✅ **Content deduplication** using SHA-256 hash  
✅ **Idempotent** - safe to run repeatedly  
✅ **Robust error handling** - continues on failures  
✅ **Automatic retry logic** via upsert  
✅ **Timestamps tracking** (last_fetched_at)  
✅ **Comprehensive logging** for monitoring  

---

## API Endpoints

### POST `/api/ingest/rss`

Triggers RSS ingestion for all active sources.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/ingest/rss
```

**Example Response:**
```json
{
  "success": true,
  "stats": {
    "sourcesProcessed": 5,
    "sourcesSucceeded": 5,
    "sourcesFailed": 0,
    "itemsProcessed": 127,
    "itemsCreated": 23,
    "itemsUpdated": 8,
    "itemsSkipped": 96
  },
  "errors": [],
  "message": "Ingestion complete",
  "duration": 8234
}
```

### GET `/api/ingest/rss`

Health check and status endpoint.

**Example Request:**
```bash
curl http://localhost:3000/api/ingest/rss
```

**Example Response:**
```json
{
  "status": "ready",
  "sources": {
    "total": 5,
    "active": 5,
    "inactive": 0
  },
  "activeSources": [
    {
      "id": "uuid",
      "name": "TechCrunch",
      "url": "https://techcrunch.com/feed/",
      "lastFetched": "2026-01-04T12:34:56.789Z",
      "lastStatus": "success"
    }
  ]
}
```

---

## How It Works

### 1. Fetch Active Sources

```sql
SELECT * FROM sources 
WHERE type = 'rss' 
AND is_active = true;
```

### 2. Fetch Feeds (Parallel with Rate Limiting)

- Uses `p-limit` to control concurrency (5 concurrent)
- Timeout: 15 seconds per feed
- Custom User-Agent: "AutoNews/1.0 RSS Ingestion Bot"

### 3. Normalize URLs

Strips common tracking parameters:
- Google Analytics: `utm_*`
- Facebook: `fbclid`
- Mail trackers: `mc_*`
- HubSpot: `_hsenc`, `_hsmi`
- Marketo: `mkt_tok`
- Generic: `ref`, `source`, etc.

**Example:**
```
Input:  https://example.com/article?utm_source=twitter&utm_campaign=promo
Output: https://example.com/article
```

### 4. Compute Hash for Deduplication

```typescript
hash = SHA-256(canonical_url || title)
```

- Prevents duplicate entries
- Unique per org_id + hash
- Handles URL variations

### 5. Upsert Items

**Check if exists:**
```sql
SELECT id FROM items 
WHERE org_id = ? AND hash = ?
```

**If exists:** Update title, content, etc.  
**If not:** Insert new item

### 6. Update Source Timestamp

```sql
UPDATE sources 
SET last_fetched_at = NOW(),
    last_fetch_status = 'success'
WHERE id = ?
```

---

## Content Extraction

### Fields Extracted

| Field | Source | Processing |
|-------|--------|------------|
| `title` | `item.title` | Trimmed |
| `url` | `item.link` or `item.guid` | Original URL |
| `canonical_url` | `item.link` | Normalized (tracking stripped) |
| `author` | `item.creator` or `item.author` | Direct |
| `published_at` | `item.pubDate` or `item.isoDate` | Parsed to timestamp |
| `summary` | `item.contentSnippet` or `item.summary` | Max 500 chars, HTML stripped |
| `content_text` | `item.content` or `item['content:encoded']` | Max 5KB, HTML stripped |
| `content_html` | `item.content` or `item['content:encoded']` | Max 10KB |
| `image_url` | `item.enclosure` or `media:*` or extracted from HTML | Direct |
| `hash` | Computed | SHA-256 |

---

## Running Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required!
```

**⚠️ Important:** The service role key is required for server-side operations.

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Trigger Ingestion

**Option A: Using curl**
```bash
curl -X POST http://localhost:3000/api/ingest/rss
```

**Option B: Using npm script**
```bash
npm run ingest
```

**Option C: Using browser/Postman**
```
POST http://localhost:3000/api/ingest/rss
```

### 5. Check Status

```bash
curl http://localhost:3000/api/ingest/rss
```

---

## Scheduling (Production)

### Option 1: Cron Job

Add to crontab:
```cron
# Every 30 minutes
*/30 * * * * curl -X POST https://your-domain.com/api/ingest/rss

# Every hour
0 * * * * curl -X POST https://your-domain.com/api/ingest/rss

# Every 6 hours
0 */6 * * * curl -X POST https://your-domain.com/api/ingest/rss
```

### Option 2: Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/ingest/rss",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

### Option 3: External Service

Use services like:
- **Cron-job.org** - Free cron service
- **EasyCron** - Scheduled HTTP requests
- **Zapier** - Schedule by Zapier
- **GitHub Actions** - Workflow scheduling

---

## Monitoring

### Check Ingestion Logs

```bash
# In terminal running dev server, you'll see:
Starting ingestion for 5 sources...
Processing 25 items from TechCrunch...
Processing 18 items from Ars Technica...
Ingestion complete: {
  sourcesProcessed: 5,
  itemsCreated: 23,
  ...
  duration: '8234ms'
}
```

### Query Database

```sql
-- Check latest items
SELECT title, source_id, created_at 
FROM items 
ORDER BY created_at DESC 
LIMIT 10;

-- Check source status
SELECT name, last_fetched_at, last_fetch_status 
FROM sources 
WHERE type = 'rss';

-- Count items per source
SELECT s.name, COUNT(i.id) as item_count
FROM sources s
LEFT JOIN items i ON i.source_id = s.id
GROUP BY s.id, s.name;
```

---

## Error Handling

### Source-Level Errors

If a feed fails to fetch:
- Error is logged
- Added to `errors` array in response
- Source marked with `last_fetch_status = 'failed'`
- Other sources continue processing

### Item-Level Errors

If an item fails to process:
- Error is logged
- Item is skipped
- Counter incremented
- Next item continues

### Network Errors

- 15-second timeout per feed
- Failed feeds don't block others
- Retry on next ingestion run

### Duplicate Handling

- Unique constraint: `(org_id, hash)`
- Race condition caught: `error.code === '23505'`
- Marked as skipped

---

## Rate Limiting

### Concurrency Control

```typescript
import pLimit from 'p-limit'

// Max 5 concurrent feed fetches
const limit = pLimit(5)

// Apply limit to all fetches
await Promise.all(
  sources.map(source => 
    limit(() => fetchFeed(source))
  )
)
```

**Benefits:**
- Prevents overwhelming servers
- Reduces memory usage
- Improves reliability
- Faster overall completion

---

## Idempotency

The pipeline is **safe to run multiple times**:

1. **Hash-based deduplication** - Same content = same hash
2. **Upsert logic** - Updates existing items
3. **Unique constraints** - Database prevents duplicates
4. **Timestamp tracking** - Records last run
5. **Race condition handling** - Catches concurrent inserts

**Example:**
```bash
# Run 1
POST /api/ingest/rss
# Result: 23 created, 0 updated

# Run 2 (same data)
POST /api/ingest/rss
# Result: 0 created, 23 updated

# Run 3 (some new items)
POST /api/ingest/rss
# Result: 5 created, 23 updated
```

---

## Performance

### Typical Metrics

| Metric | Value |
|--------|-------|
| Sources processed | 5-10 |
| Items per source | 10-50 |
| Total items | 50-500 |
| Duration | 5-15 seconds |
| Concurrency | 5 feeds at once |
| Memory usage | ~100-200MB |

### Optimization Tips

1. **Increase concurrency** for more feeds:
   ```typescript
   const limit = pLimit(10) // Up from 5
   ```

2. **Adjust timeouts** for slow feeds:
   ```typescript
   timeout: 30000 // 30 seconds
   ```

3. **Batch inserts** for large feeds (advanced)

4. **Use indexes** on frequently queried columns

---

## Troubleshooting

### "No active RSS sources found"

**Solution:** Add RSS sources via the UI or check:
```sql
SELECT * FROM sources WHERE type = 'rss' AND is_active = true;
```

### "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` has all three keys:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Don't forget this!
```

### Feeds timing out

**Solution:** Increase timeout or skip problematic feeds:
```typescript
timeout: 30000 // Increase from 15000
```

### High memory usage

**Solution:** Reduce concurrency:
```typescript
const limit = pLimit(3) // Reduce from 5
```

### Items not appearing

**Check:**
1. Source is active: `is_active = true`
2. Feed has items: Check feed URL in browser
3. Org ID matches: Items belong to correct org
4. Hash collisions: Check if content already exists

---

## File Structure

```
app/
├── api/
│   └── ingest/
│       └── rss/
│           └── route.ts          # Main ingestion endpoint

lib/
└── ingestion.ts                  # Utility functions

package.json                      # Added p-limit dependency
```

---

## Dependencies

### p-limit v5.0.0

- Concurrency control
- Limits parallel operations
- Memory efficient
- Promise-based

```typescript
import pLimit from 'p-limit'
const limit = pLimit(5)
await limit(() => doWork())
```

---

## Next Steps

### Enhancements

1. **Content scoring** - Rank items by relevance
2. **Duplicate detection** - Fuzzy matching
3. **Image caching** - Download and store images
4. **Full-text search** - Index content for search
5. **Webhook support** - Real-time ingestion
6. **API sources** - Support non-RSS APIs
7. **AI summarization** - Generate summaries
8. **Category detection** - Auto-categorize items

### Integration

1. **Newsletter generation** - Use items to create issues
2. **Content rules** - Filter by keywords
3. **Scheduling** - Automated periodic runs
4. **Notifications** - Alert on ingestion failures
5. **Analytics** - Track most popular sources

---

## Summary

✅ Complete RSS ingestion pipeline  
✅ Rate-limited parallel fetching  
✅ URL normalization & deduplication  
✅ Robust error handling  
✅ Safe to run repeatedly  
✅ Easy to run locally  
✅ Production-ready  
✅ Comprehensive logging  
✅ Health check endpoint  

**Start ingesting content now!** 🚀

