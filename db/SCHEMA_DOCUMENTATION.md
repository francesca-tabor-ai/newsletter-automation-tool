# Database Schema Documentation

## Overview

This document describes the multi-tenant database schema for AutoNews, a newsletter automation SaaS platform. The schema is designed with Row-Level Security (RLS) to ensure strict data isolation between organizations.

## 📊 Schema Architecture

### Multi-Tenancy Model

The schema uses an **organization-based multi-tenancy** model:
- Each organization (`orgs`) is a separate tenant
- Users can be members of multiple organizations
- All data is scoped to an organization via `org_id`
- RLS policies enforce that users can only access data from their organizations

---

## 📋 Tables

### Core Tables

#### `orgs`
Organizations - the root entity for multi-tenancy.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique organization identifier |
| `name` | TEXT | Organization name |
| `slug` | TEXT (unique) | URL-friendly identifier |
| `settings` | JSONB | Organization settings |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_orgs_slug` on `slug`
- `idx_orgs_created_at` on `created_at DESC`

---

#### `org_members`
Organization membership and role assignments.

| Column | Type | Description |
|--------|------|-------------|
| `org_id` | UUID (PK, FK) | Organization reference |
| `user_id` | UUID (PK, FK) | User reference (auth.users) |
| `role` | TEXT | Role: owner, admin, editor, viewer |
| `invited_by` | UUID (FK) | User who invited this member |
| `created_at` | TIMESTAMPTZ | Join timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Primary key: `(org_id, user_id)`
- Check: `role IN ('owner', 'admin', 'editor', 'viewer')`

**Roles:**
- **owner**: Full control, can delete org, manage all members
- **admin**: Manage members, all CRUD operations
- **editor**: Create/edit content, manage newsletters
- **viewer**: Read-only access

**Indexes:**
- `idx_org_members_user_id` on `user_id`
- `idx_org_members_org_id` on `org_id`
- `idx_org_members_role` on `role`

---

### Newsletter Management

#### `newsletters`
Newsletter configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Newsletter identifier |
| `org_id` | UUID (FK) | Organization owner |
| `name` | TEXT | Newsletter name |
| `slug` | TEXT | URL-friendly identifier |
| `from_name` | TEXT | Sender name |
| `from_email` | TEXT | Sender email address |
| `reply_to` | TEXT | Reply-to email |
| `subject_template` | TEXT | Email subject template |
| `branding_json` | JSONB | Branding configuration (colors, logos, etc.) |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Unique: `(org_id, slug)`

**Indexes:**
- `idx_newsletters_org_id` on `org_id`
- `idx_newsletters_slug` on `(org_id, slug)`
- `idx_newsletters_active` on `is_active` WHERE `is_active = true`

---

#### `sources`
Content sources (RSS feeds, APIs, webhooks).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Source identifier |
| `org_id` | UUID (FK) | Organization owner |
| `type` | TEXT | Source type: rss, atom, api, webhook |
| `url` | TEXT | Source URL/endpoint |
| `name` | TEXT | Source display name |
| `description` | TEXT | Source description |
| `is_active` | BOOLEAN | Active status |
| `fetch_frequency_minutes` | INTEGER | How often to fetch (default: 60) |
| `last_fetched_at` | TIMESTAMPTZ | Last successful fetch |
| `last_fetch_status` | TEXT | Status of last fetch |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Check: `type IN ('rss', 'atom', 'api', 'webhook')`

**Indexes:**
- `idx_sources_org_id` on `org_id`
- `idx_sources_type` on `type`
- `idx_sources_active` on `is_active` WHERE `is_active = true`
- `idx_sources_last_fetched` on `last_fetched_at`
- `idx_sources_url` on `url`

---

#### `newsletter_sources`
Many-to-many relationship between newsletters and sources.

| Column | Type | Description |
|--------|------|-------------|
| `newsletter_id` | UUID (PK, FK) | Newsletter reference |
| `source_id` | UUID (PK, FK) | Source reference |
| `section_title` | TEXT | Display title for this source in newsletter |
| `sort_order` | INTEGER | Display order (default: 0) |
| `is_enabled` | BOOLEAN | Whether to include items from this source |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Constraints:**
- Primary key: `(newsletter_id, source_id)`

**Indexes:**
- `idx_newsletter_sources_newsletter` on `newsletter_id`
- `idx_newsletter_sources_source` on `source_id`
- `idx_newsletter_sources_order` on `(newsletter_id, sort_order)`

---

### Content Management

#### `items`
Content items fetched from sources.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Item identifier |
| `org_id` | UUID (FK) | Organization owner |
| `source_id` | UUID (FK) | Source that provided this item |
| `url` | TEXT | Item URL |
| `canonical_url` | TEXT | Canonical/original URL |
| `title` | TEXT | Item title |
| `author` | TEXT | Author name |
| `published_at` | TIMESTAMPTZ | Publication date |
| `summary` | TEXT | Item summary/excerpt |
| `content_text` | TEXT | Plain text content |
| `content_html` | TEXT | HTML content |
| `image_url` | TEXT | Featured image URL |
| `hash` | TEXT | Content hash for deduplication |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | When item was first fetched |

**Constraints:**
- Unique: `(org_id, hash)` - prevents duplicate items per org

**Indexes:**
- `idx_items_org_id` on `org_id`
- `idx_items_source_id` on `source_id`
- `idx_items_hash` on `(org_id, hash)`
- `idx_items_published_at` on `published_at DESC`
- `idx_items_created_at` on `created_at DESC`
- `idx_items_url` on `url`
- `idx_items_title_trgm` on `title` using GIN (for full-text search)
- `idx_items_content_trgm` on `content_text` using GIN (for full-text search)

---

#### `rules`
Content filtering and selection rules for newsletters.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Rule identifier |
| `newsletter_id` | UUID (FK) | Newsletter this rule applies to |
| `name` | TEXT | Rule name |
| `include_keywords` | TEXT[] | Keywords to include (OR logic) |
| `exclude_keywords` | TEXT[] | Keywords to exclude (OR logic) |
| `include_sources` | UUID[] | Specific sources to include |
| `exclude_sources` | UUID[] | Specific sources to exclude |
| `max_items` | INTEGER | Maximum items to select (default: 10) |
| `lookback_days` | INTEGER | How many days back to look (default: 7) |
| `dedupe` | BOOLEAN | Remove duplicate content (default: true) |
| `score_threshold` | DECIMAL(3,2) | Minimum relevance score (0.00-1.00) |
| `sort_by` | TEXT | Sort order: published_at, score, title |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Check: `sort_by IN ('published_at', 'score', 'title')`

**Indexes:**
- `idx_rules_newsletter_id` on `newsletter_id`
- `idx_rules_active` on `is_active` WHERE `is_active = true`

---

### Issue Management

#### `issues`
Newsletter editions/drafts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Issue identifier |
| `newsletter_id` | UUID (FK) | Newsletter this issue belongs to |
| `status` | TEXT | Status: draft, frozen, scheduled, sent, skipped, failed |
| `title` | TEXT | Issue title |
| `scheduled_for` | TIMESTAMPTZ | When to send this issue |
| `sent_at` | TIMESTAMPTZ | When issue was sent |
| `intro_md` | TEXT | Introduction text (Markdown) |
| `outro_md` | TEXT | Closing text (Markdown) |
| `generated_html` | TEXT | Final HTML for email |
| `metadata` | JSONB | Additional metadata |
| `created_by` | UUID (FK) | User who created this issue |
| `sent_by` | UUID (FK) | User who sent this issue |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Check: `status IN ('draft', 'frozen', 'scheduled', 'sent', 'skipped', 'failed')`
- Check: `sent_at IS NULL OR sent_at >= created_at`
- Check: `scheduled_for IS NULL OR status IN ('scheduled', 'sent')`

**Status Flow:**
- `draft` → `frozen` → `scheduled` → `sent`
- Can skip to `skipped` at any point
- Can fail with `failed` status

**Indexes:**
- `idx_issues_newsletter_id` on `newsletter_id`
- `idx_issues_status` on `status`
- `idx_issues_scheduled_for` on `scheduled_for` WHERE `scheduled_for IS NOT NULL`
- `idx_issues_sent_at` on `sent_at DESC`
- `idx_issues_created_at` on `created_at DESC`

---

#### `issue_items`
Items selected for specific issues.

| Column | Type | Description |
|--------|------|-------------|
| `issue_id` | UUID (PK, FK) | Issue reference |
| `item_id` | UUID (PK, FK) | Item reference |
| `position` | INTEGER | Display order (default: 0) |
| `section` | TEXT | Section grouping |
| `custom_title` | TEXT | Override item title |
| `custom_summary` | TEXT | Override item summary |
| `custom_url` | TEXT | Override item URL |
| `removed` | BOOLEAN | Soft delete flag |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Constraints:**
- Primary key: `(issue_id, item_id)`

**Indexes:**
- `idx_issue_items_issue_id` on `issue_id`
- `idx_issue_items_item_id` on `item_id`
- `idx_issue_items_position` on `(issue_id, position)`
- `idx_issue_items_removed` on `removed` WHERE `removed = false`

---

### Subscriber Management

#### `subscribers`
Newsletter subscribers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Subscriber identifier |
| `newsletter_id` | UUID (FK) | Newsletter subscription |
| `email` | TEXT | Subscriber email |
| `status` | TEXT | Status: active, unsubscribed, bounced, complained |
| `first_name` | TEXT | First name |
| `last_name` | TEXT | Last name |
| `metadata` | JSONB | Additional metadata |
| `subscribed_at` | TIMESTAMPTZ | Subscription timestamp |
| `unsubscribed_at` | TIMESTAMPTZ | Unsubscription timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Unique: `(newsletter_id, email)`
- Check: `status IN ('active', 'unsubscribed', 'bounced', 'complained')`
- Check: Email regex validation

**Indexes:**
- `idx_subscribers_newsletter_id` on `newsletter_id`
- `idx_subscribers_email` on `email`
- `idx_subscribers_status` on `status`
- `idx_subscribers_active` on `(newsletter_id, status)` WHERE `status = 'active'`

---

### Analytics

#### `events`
Email engagement tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Event identifier |
| `issue_id` | UUID (FK) | Issue reference |
| `subscriber_id` | UUID (FK) | Subscriber reference |
| `type` | TEXT | Event type: sent, delivered, opened, clicked, bounced, complained, unsubscribed |
| `url` | TEXT | For click events: which link was clicked |
| `user_agent` | TEXT | Browser/email client |
| `ip_address` | INET | Subscriber IP address |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Event timestamp |

**Constraints:**
- Check: `type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')`

**Indexes:**
- `idx_events_issue_id` on `issue_id`
- `idx_events_subscriber_id` on `subscriber_id`
- `idx_events_type` on `type`
- `idx_events_created_at` on `created_at DESC`
- `idx_events_issue_type` on `(issue_id, type)`

---

## 🔒 Row-Level Security (RLS)

All tables have RLS enabled. Users can only access data belonging to organizations where they are members.

### Helper Functions

#### `is_org_member(target_org_id UUID) → BOOLEAN`
Checks if the current authenticated user is a member of the specified organization.

```sql
SELECT is_org_member('org-uuid-here');
```

#### `has_org_role(target_org_id UUID, required_role TEXT) → BOOLEAN`
Checks if the current user has a specific role in an organization.

```sql
SELECT has_org_role('org-uuid-here', 'admin');
```

#### `is_org_admin(target_org_id UUID) → BOOLEAN`
Checks if the current user is an admin or owner of an organization.

```sql
SELECT is_org_admin('org-uuid-here');
```

#### `user_org_ids() → SETOF UUID`
Returns all organization IDs that the current user is a member of.

```sql
SELECT * FROM user_org_ids();
```

### RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `orgs` | Members | Anyone | Admins | Owners |
| `org_members` | Members | Admins | Admins | Admins + Self |
| `newsletters` | Members | Editors+ | Editors+ | Admins |
| `sources` | Members | Editors+ | Editors+ | Admins |
| `newsletter_sources` | Members | Editors+ | Editors+ | Editors+ |
| `items` | Members | Editors+ | Editors+ | Admins |
| `rules` | Members | Editors+ | Editors+ | Editors+ |
| `issues` | Members | Editors+ | Editors+ | Admins |
| `issue_items` | Members | Editors+ | Editors+ | Editors+ |
| `subscribers` | Members | **Public** | Editors+ | Editors+ |
| `events` | Members | **Public** | None | None |

**Notes:**
- "Members" = any org member can view
- "Editors+" = editors, admins, and owners
- "Admins" = admins and owners only
- "Public" = anyone can insert (for public signup/tracking)

---

## 🔄 Triggers

### Automatic Timestamps

The `updated_at` column is automatically updated on all tables that have it via the `update_updated_at_column()` trigger.

### Auto-Add Org Owner

When a new organization is created, the creator is automatically added as an "owner" via the `auto_add_org_owner()` trigger.

---

## 📊 Views

### `newsletter_stats`
Aggregated statistics per newsletter.

```sql
SELECT * FROM newsletter_stats WHERE org_id = 'your-org-id';
```

**Columns:**
- `newsletter_id`
- `newsletter_name`
- `org_id`
- `total_subscribers`
- `active_subscribers`
- `total_issues`
- `sent_issues`
- `total_opens`
- `total_clicks`

---

## 🚀 Usage Examples

### Create an Organization
```sql
INSERT INTO orgs (name, slug)
VALUES ('Acme Corp', 'acme-corp');
-- Trigger automatically adds you as owner
```

### Create a Newsletter
```sql
INSERT INTO newsletters (org_id, name, from_name, from_email, subject_template)
VALUES (
  'your-org-id',
  'Weekly Digest',
  'Acme Newsletter',
  'newsletter@acme.com',
  '📰 {{ newsletter_name }} - {{ issue_date }}'
);
```

### Add RSS Source
```sql
INSERT INTO sources (org_id, type, url, name)
VALUES (
  'your-org-id',
  'rss',
  'https://example.com/feed.xml',
  'Example Blog'
);
```

### Link Source to Newsletter
```sql
INSERT INTO newsletter_sources (newsletter_id, source_id, section_title, sort_order)
VALUES (
  'your-newsletter-id',
  'your-source-id',
  'Tech News',
  1
);
```

### Create Content Rule
```sql
INSERT INTO rules (
  newsletter_id,
  include_keywords,
  max_items,
  lookback_days,
  sort_by
)
VALUES (
  'your-newsletter-id',
  ARRAY['AI', 'machine learning', 'GPT'],
  10,
  7,
  'published_at'
);
```

### Create Draft Issue
```sql
INSERT INTO issues (newsletter_id, status, title, intro_md)
VALUES (
  'your-newsletter-id',
  'draft',
  'Weekly Update - January 2026',
  '# Welcome!\n\nHere are this week''s top stories...'
);
```

---

## 🔧 Maintenance

### Regenerate TypeScript Types
```bash
npx supabase gen types typescript --project-id <project-id> > db/types.ts
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Analyze Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM items
WHERE org_id = 'your-org-id'
AND published_at > NOW() - INTERVAL '7 days'
ORDER BY published_at DESC;
```

---

## 📈 Performance Considerations

1. **Indexes**: Comprehensive indexes on foreign keys, dates, and frequently queried columns
2. **GIN Indexes**: Full-text search on item titles and content
3. **Partial Indexes**: For boolean filters (e.g., `is_active = true`)
4. **RLS Overhead**: RLS policies add overhead but ensure security
5. **Connection Pooling**: Use Supabase's built-in pooling for high concurrency

---

## 🔐 Security Best Practices

1. **Never bypass RLS** in application code
2. **Use service role key** only in trusted server environments
3. **Validate emails** before inserting subscribers
4. **Rate limit** public endpoints (subscriptions, tracking)
5. **Sanitize** user input in custom fields
6. **Audit** org_members changes for security

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/database-design)

