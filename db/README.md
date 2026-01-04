# Multi-Tenant Newsletter SaaS Database Schema

## 🎯 Quick Summary

This SQL migration creates a complete **multi-tenant newsletter automation system** with:

✅ **11 Tables** with full RLS policies  
✅ **Organization-based multi-tenancy**  
✅ **4 Helper functions** for access control  
✅ **40+ Indexes** for optimal performance  
✅ **Role-based permissions** (owner, admin, editor, viewer)  
✅ **Automatic triggers** for timestamps and membership  
✅ **Full-text search** on content  
✅ **Email tracking** and analytics  

---

## 📊 Database Tables

### Core Multi-Tenancy
- **`orgs`** - Organizations (tenants)
- **`org_members`** - User membership with roles

### Newsletter Management
- **`newsletters`** - Newsletter configurations
- **`sources`** - RSS/API content sources
- **`newsletter_sources`** - Source-newsletter relationships

### Content
- **`items`** - Fetched content items
- **`rules`** - Content filtering rules
- **`issues`** - Newsletter editions/drafts
- **`issue_items`** - Items selected for issues

### Subscribers & Analytics
- **`subscribers`** - Email subscribers
- **`events`** - Engagement tracking (opens, clicks)

---

## 🔐 Security Features

### Row-Level Security (RLS)

Every table has RLS policies ensuring:
- Users only access data from their organizations
- Role-based permissions (viewer → editor → admin → owner)
- Public endpoints for subscriptions and tracking

### Helper Functions

```sql
-- Check if user is org member
SELECT is_org_member('org-uuid');

-- Check specific role
SELECT has_org_role('org-uuid', 'admin');

-- Check if admin or owner
SELECT is_org_admin('org-uuid');

-- Get all user's org IDs
SELECT * FROM user_org_ids();
```

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Viewer** | Read-only access to all org data |
| **Editor** | Create/edit newsletters, sources, issues |
| **Admin** | All editor permissions + member management |
| **Owner** | All admin permissions + delete organization |

---

## 📝 Key Features

### Deduplication
- Content items use hash-based deduplication
- Unique constraint: `(org_id, hash)`

### Content Filtering
Rules support:
- Include/exclude keywords
- Source filtering
- Item limits and lookback periods
- Scoring thresholds

### Issue Workflow
```
draft → frozen → scheduled → sent
              ↓
            skipped
              ↓
            failed
```

### Analytics Tracking
Event types:
- `sent` - Email sent
- `delivered` - Successfully delivered
- `opened` - Email opened
- `clicked` - Link clicked
- `bounced` - Delivery failed
- `complained` - Marked as spam
- `unsubscribed` - Unsubscribed

---

## 🚀 Installation

### 1. Copy SQL to Supabase

```bash
# Open your Supabase project
# Navigate to SQL Editor
# Copy contents of db/schema.sql
# Execute the SQL
```

### 2. Verify Installation

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Test helper functions
SELECT is_org_member('test-uuid');
```

### 3. Create Your First Organization

```sql
INSERT INTO orgs (name, slug) VALUES ('My Company', 'my-company');
-- You'll automatically be added as owner via trigger
```

---

## 📚 Usage Examples

### Complete Newsletter Setup

```sql
-- 1. Create organization (automatic owner assignment)
INSERT INTO orgs (name, slug) 
VALUES ('Acme Corp', 'acme-corp') 
RETURNING id;

-- 2. Create newsletter
INSERT INTO newsletters (org_id, name, from_name, from_email, subject_template)
VALUES (
  '<org-id>',
  'Weekly Tech Digest',
  'Acme Newsletter',
  'news@acme.com',
  '📰 {{ newsletter_name }} - Week of {{ issue_date }}'
) RETURNING id;

-- 3. Add RSS source
INSERT INTO sources (org_id, type, url, name)
VALUES (
  '<org-id>',
  'rss',
  'https://techcrunch.com/feed/',
  'TechCrunch'
) RETURNING id;

-- 4. Link source to newsletter
INSERT INTO newsletter_sources (newsletter_id, source_id, section_title, sort_order)
VALUES (
  '<newsletter-id>',
  '<source-id>',
  'Tech News',
  1
);

-- 5. Create content filter rule
INSERT INTO rules (
  newsletter_id,
  include_keywords,
  exclude_keywords,
  max_items,
  lookback_days,
  dedupe,
  sort_by
) VALUES (
  '<newsletter-id>',
  ARRAY['AI', 'startups', 'funding'],
  ARRAY['cryptocurrency', 'NFT'],
  10,
  7,
  true,
  'published_at'
);

-- 6. Create draft issue
INSERT INTO issues (newsletter_id, status, title, intro_md)
VALUES (
  '<newsletter-id>',
  'draft',
  'Weekly Update - January 2026',
  '# Hello Subscribers!\n\nHere are this week''s top tech stories...'
) RETURNING id;

-- 7. Add subscriber
INSERT INTO subscribers (newsletter_id, email, first_name, status)
VALUES (
  '<newsletter-id>',
  'subscriber@example.com',
  'John',
  'active'
);
```

### Query Examples

```sql
-- Get all newsletters for current user's orgs
SELECT n.* 
FROM newsletters n
WHERE n.org_id IN (SELECT user_org_ids());

-- Get recent items from all sources
SELECT i.* 
FROM items i
WHERE i.org_id = '<your-org-id>'
AND i.published_at > NOW() - INTERVAL '7 days'
ORDER BY i.published_at DESC
LIMIT 20;

-- Get newsletter analytics
SELECT * FROM newsletter_stats WHERE org_id = '<your-org-id>';

-- Get issue engagement metrics
SELECT 
  i.title,
  COUNT(DISTINCT e.subscriber_id) FILTER (WHERE e.type = 'opened') as opens,
  COUNT(DISTINCT e.subscriber_id) FILTER (WHERE e.type = 'clicked') as clicks
FROM issues i
LEFT JOIN events e ON e.issue_id = i.id
WHERE i.newsletter_id = '<newsletter-id>'
GROUP BY i.id, i.title;
```

---

## 🔧 Performance Optimization

### Indexes Created

- **40+ indexes** on frequently queried columns
- **GIN indexes** for full-text search on items
- **Partial indexes** for boolean filters
- **Composite indexes** for complex queries

### Search Capabilities

```sql
-- Full-text search on item titles
SELECT * FROM items
WHERE org_id = '<org-id>'
AND title ILIKE '%machine learning%'
ORDER BY published_at DESC;

-- Search in content (uses GIN index)
SELECT * FROM items
WHERE org_id = '<org-id>'
AND content_text ILIKE '%artificial intelligence%'
LIMIT 10;
```

---

## 🔄 Automatic Features

### Triggers

1. **`update_updated_at_column()`**
   - Automatically updates `updated_at` timestamp on changes
   - Applied to: orgs, org_members, newsletters, sources, rules, issues, subscribers

2. **`auto_add_org_owner()`**
   - Automatically adds creator as organization owner
   - Triggered after org creation

### Constraints

- Email validation regex
- Status enums for type safety
- Unique constraints for deduplication
- Foreign key cascades for data integrity

---

## 📊 Entity Relationships

```
orgs
 ├── org_members (users)
 ├── newsletters
 │   ├── newsletter_sources → sources
 │   ├── rules
 │   ├── issues
 │   │   └── issue_items → items
 │   └── subscribers
 │       └── events
 ├── sources
 │   └── items
 └── items
```

---

## 🛡️ RLS Policy Examples

### View Newsletters (All Members)
```sql
CREATE POLICY "Org members can view newsletters"
  ON newsletters FOR SELECT
  USING (is_org_member(org_id));
```

### Create Newsletter (Editors+)
```sql
CREATE POLICY "Org editors can create newsletters"
  ON newsletters FOR INSERT
  WITH CHECK (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );
```

### Delete Newsletter (Admins Only)
```sql
CREATE POLICY "Org admins can delete newsletters"
  ON newsletters FOR DELETE
  USING (is_org_admin(org_id));
```

---

## 📖 Documentation

See **`db/SCHEMA_DOCUMENTATION.md`** for:
- Detailed table descriptions
- Column specifications
- Index strategies
- RLS policy details
- Query examples
- Best practices

---

## 🔗 TypeScript Integration

```typescript
import { Database } from '@/db/types'
import { createClient } from '@/lib/supabase/server'

// Type-safe queries
const supabase = createClient<Database>()

const { data: newsletters } = await supabase
  .from('newsletters')
  .select('*')
  .eq('org_id', orgId)

// Types are automatically inferred!
```

---

## ✅ Migration Checklist

- [x] 11 tables with proper relationships
- [x] RLS policies on all tables
- [x] Helper functions for access control
- [x] Indexes for performance
- [x] Triggers for automation
- [x] Email validation
- [x] Deduplication support
- [x] Full-text search
- [x] Analytics tracking
- [x] TypeScript types
- [x] Comprehensive documentation

---

## 🚀 Ready to Use!

The schema is production-ready and includes everything needed for a multi-tenant newsletter SaaS:

- Multi-organization support
- Role-based access control
- RSS/API content aggregation
- Smart content filtering
- Newsletter drafting and scheduling
- Subscriber management
- Email engagement analytics
- Full security with RLS

**Next steps**: Build your application UI on top of this solid database foundation!
