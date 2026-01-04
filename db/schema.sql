-- ============================================================================
-- AutoNews Multi-Tenant Newsletter SaaS - Database Schema
-- ============================================================================
-- This migration creates a complete multi-tenant architecture with RLS policies
-- Version: 1.0.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search performance

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = target_org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has a specific role in an organization
CREATE OR REPLACE FUNCTION has_org_role(target_org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = target_org_id
    AND user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin or owner of an organization
CREATE OR REPLACE FUNCTION is_org_admin(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = target_org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization IDs
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations (Multi-tenant root)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (User-Org relationship)
CREATE TABLE IF NOT EXISTS org_members (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))
);

-- Newsletters
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT,
  reply_to TEXT,
  subject_template TEXT,
  branding_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_newsletter_slug UNIQUE (org_id, slug)
);

-- Sources (RSS feeds, APIs, etc.)
CREATE TABLE IF NOT EXISTS sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'rss' CHECK (type IN ('rss', 'atom', 'api', 'webhook')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  fetch_frequency_minutes INTEGER DEFAULT 60,
  last_fetched_at TIMESTAMPTZ,
  last_fetch_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter-Source junction (many-to-many with metadata)
CREATE TABLE IF NOT EXISTS newsletter_sources (
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  section_title TEXT,
  sort_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (newsletter_id, source_id)
);

-- Items (Content from sources)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  canonical_url TEXT,
  title TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMPTZ,
  summary TEXT,
  content_text TEXT,
  content_html TEXT,
  image_url TEXT,
  hash TEXT NOT NULL, -- Content hash for deduplication
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_item_hash UNIQUE (org_id, hash)
);

-- Rules (Content filtering and selection rules)
CREATE TABLE IF NOT EXISTS rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  name TEXT,
  include_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  exclude_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  include_sources UUID[] DEFAULT ARRAY[]::UUID[],
  exclude_sources UUID[] DEFAULT ARRAY[]::UUID[],
  max_items INTEGER DEFAULT 10,
  lookback_days INTEGER DEFAULT 7,
  dedupe BOOLEAN DEFAULT true,
  score_threshold DECIMAL(3,2),
  sort_by TEXT DEFAULT 'published_at' CHECK (sort_by IN ('published_at', 'score', 'title')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues (Newsletter editions/drafts)
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'frozen', 'scheduled', 'sent', 'skipped', 'failed')),
  title TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  intro_md TEXT,
  outro_md TEXT,
  generated_html TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_sent_at CHECK (sent_at IS NULL OR sent_at >= created_at),
  CONSTRAINT valid_scheduled CHECK (scheduled_for IS NULL OR status IN ('scheduled', 'sent'))
);

-- Issue Items (Items selected for a specific issue)
CREATE TABLE IF NOT EXISTS issue_items (
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  section TEXT,
  custom_title TEXT,
  custom_summary TEXT,
  custom_url TEXT,
  removed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (issue_id, item_id)
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  first_name TEXT,
  last_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_subscriber_email UNIQUE (newsletter_id, email),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Events (Email engagement tracking)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  url TEXT, -- For click events
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_created_at ON orgs(created_at DESC);

-- Organization members indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON org_members(role);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_org_id ON newsletters(org_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters(org_id, slug);
CREATE INDEX IF NOT EXISTS idx_newsletters_active ON newsletters(is_active) WHERE is_active = true;

-- Source indexes
CREATE INDEX IF NOT EXISTS idx_sources_org_id ON sources(org_id);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sources_last_fetched ON sources(last_fetched_at);
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url);

-- Newsletter sources indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_sources_newsletter ON newsletter_sources(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sources_source ON newsletter_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sources_order ON newsletter_sources(newsletter_id, sort_order);

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_org_id ON items(org_id);
CREATE INDEX IF NOT EXISTS idx_items_source_id ON items(source_id);
CREATE INDEX IF NOT EXISTS idx_items_hash ON items(org_id, hash);
CREATE INDEX IF NOT EXISTS idx_items_published_at ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_url ON items(url);
CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_content_trgm ON items USING gin(content_text gin_trgm_ops);

-- Rules indexes
CREATE INDEX IF NOT EXISTS idx_rules_newsletter_id ON rules(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_rules_active ON rules(is_active) WHERE is_active = true;

-- Issues indexes
CREATE INDEX IF NOT EXISTS idx_issues_newsletter_id ON issues(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_scheduled_for ON issues(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_issues_sent_at ON issues(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- Issue items indexes
CREATE INDEX IF NOT EXISTS idx_issue_items_issue_id ON issue_items(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_items_item_id ON issue_items(item_id);
CREATE INDEX IF NOT EXISTS idx_issue_items_position ON issue_items(issue_id, position);
CREATE INDEX IF NOT EXISTS idx_issue_items_removed ON issue_items(removed) WHERE removed = false;

-- Subscriber indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_newsletter_id ON subscribers(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(newsletter_id, status) WHERE status = 'active';

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_issue_id ON events(issue_id);
CREATE INDEX IF NOT EXISTS idx_events_subscriber_id ON events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_issue_type ON events(issue_id, type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: ORGS
-- ============================================================================

CREATE POLICY "Users can view orgs they are members of"
  ON orgs FOR SELECT
  USING (id IN (SELECT user_org_ids()));

CREATE POLICY "Users can create orgs"
  ON orgs FOR INSERT
  WITH CHECK (true); -- Any authenticated user can create an org

CREATE POLICY "Org admins can update their orgs"
  ON orgs FOR UPDATE
  USING (is_org_admin(id));

CREATE POLICY "Org owners can delete their orgs"
  ON orgs FOR DELETE
  USING (has_org_role(id, 'owner'));

-- ============================================================================
-- RLS POLICIES: ORG_MEMBERS
-- ============================================================================

CREATE POLICY "Users can view members of their orgs"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Org admins can add members"
  ON org_members FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Org admins can update member roles"
  ON org_members FOR UPDATE
  USING (is_org_admin(org_id));

CREATE POLICY "Org admins can remove members"
  ON org_members FOR DELETE
  USING (is_org_admin(org_id));

CREATE POLICY "Users can remove themselves from orgs"
  ON org_members FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: NEWSLETTERS
-- ============================================================================

CREATE POLICY "Org members can view newsletters"
  ON newsletters FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Org editors can create newsletters"
  ON newsletters FOR INSERT
  WITH CHECK (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org editors can update newsletters"
  ON newsletters FOR UPDATE
  USING (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org admins can delete newsletters"
  ON newsletters FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================================
-- RLS POLICIES: SOURCES
-- ============================================================================

CREATE POLICY "Org members can view sources"
  ON sources FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Org editors can create sources"
  ON sources FOR INSERT
  WITH CHECK (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org editors can update sources"
  ON sources FOR UPDATE
  USING (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org admins can delete sources"
  ON sources FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================================
-- RLS POLICIES: NEWSLETTER_SOURCES
-- ============================================================================

CREATE POLICY "Org members can view newsletter sources"
  ON newsletter_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = newsletter_sources.newsletter_id
      AND is_org_member(newsletters.org_id)
    )
  );

CREATE POLICY "Org editors can manage newsletter sources"
  ON newsletter_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = newsletter_sources.newsletter_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

-- ============================================================================
-- RLS POLICIES: ITEMS
-- ============================================================================

CREATE POLICY "Org members can view items"
  ON items FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Org editors can create items"
  ON items FOR INSERT
  WITH CHECK (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org editors can update items"
  ON items FOR UPDATE
  USING (
    is_org_member(org_id) AND
    NOT has_org_role(org_id, 'viewer')
  );

CREATE POLICY "Org admins can delete items"
  ON items FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================================
-- RLS POLICIES: RULES
-- ============================================================================

CREATE POLICY "Org members can view rules"
  ON rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = rules.newsletter_id
      AND is_org_member(newsletters.org_id)
    )
  );

CREATE POLICY "Org editors can manage rules"
  ON rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = rules.newsletter_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

-- ============================================================================
-- RLS POLICIES: ISSUES
-- ============================================================================

CREATE POLICY "Org members can view issues"
  ON issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = issues.newsletter_id
      AND is_org_member(newsletters.org_id)
    )
  );

CREATE POLICY "Org editors can create issues"
  ON issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = issues.newsletter_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

CREATE POLICY "Org editors can update issues"
  ON issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = issues.newsletter_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

CREATE POLICY "Org admins can delete issues"
  ON issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = issues.newsletter_id
      AND is_org_admin(newsletters.org_id)
    )
  );

-- ============================================================================
-- RLS POLICIES: ISSUE_ITEMS
-- ============================================================================

CREATE POLICY "Org members can view issue items"
  ON issue_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues
      INNER JOIN newsletters ON newsletters.id = issues.newsletter_id
      WHERE issues.id = issue_items.issue_id
      AND is_org_member(newsletters.org_id)
    )
  );

CREATE POLICY "Org editors can manage issue items"
  ON issue_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM issues
      INNER JOIN newsletters ON newsletters.id = issues.newsletter_id
      WHERE issues.id = issue_items.issue_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

-- ============================================================================
-- RLS POLICIES: SUBSCRIBERS
-- ============================================================================

CREATE POLICY "Org members can view subscribers"
  ON subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = subscribers.newsletter_id
      AND is_org_member(newsletters.org_id)
    )
  );

CREATE POLICY "Org editors can manage subscribers"
  ON subscribers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = subscribers.newsletter_id
      AND is_org_member(newsletters.org_id)
      AND NOT has_org_role(newsletters.org_id, 'viewer')
    )
  );

-- Public subscription (anyone can subscribe via public form)
CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: EVENTS
-- ============================================================================

CREATE POLICY "Org members can view events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues
      INNER JOIN newsletters ON newsletters.id = issues.newsletter_id
      WHERE issues.id = events.issue_id
      AND is_org_member(newsletters.org_id)
    )
  );

-- Public event tracking (for email opens, clicks)
CREATE POLICY "Anyone can insert tracking events"
  ON events FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically add creator as owner when creating an org
CREATE OR REPLACE FUNCTION auto_add_org_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO org_members (org_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_org_created
  AFTER INSERT ON orgs
  FOR EACH ROW EXECUTE FUNCTION auto_add_org_owner();

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for newsletter analytics summary
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
  n.id as newsletter_id,
  n.name as newsletter_name,
  n.org_id,
  COUNT(DISTINCT s.id) as total_subscribers,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscribers,
  COUNT(DISTINCT i.id) as total_issues,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'sent') as sent_issues,
  COUNT(DISTINCT e.id) FILTER (WHERE e.type = 'opened') as total_opens,
  COUNT(DISTINCT e.id) FILTER (WHERE e.type = 'clicked') as total_clicks
FROM newsletters n
LEFT JOIN subscribers s ON s.newsletter_id = n.id
LEFT JOIN issues i ON i.newsletter_id = n.id
LEFT JOIN events e ON e.issue_id = i.id
GROUP BY n.id, n.name, n.org_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE orgs IS 'Organizations - multi-tenant root entities';
COMMENT ON TABLE org_members IS 'Organization membership and roles';
COMMENT ON TABLE newsletters IS 'Newsletter configurations';
COMMENT ON TABLE sources IS 'Content sources (RSS, APIs, etc.)';
COMMENT ON TABLE newsletter_sources IS 'Many-to-many relationship between newsletters and sources';
COMMENT ON TABLE items IS 'Content items fetched from sources';
COMMENT ON TABLE rules IS 'Content filtering and selection rules for newsletters';
COMMENT ON TABLE issues IS 'Newsletter editions/drafts';
COMMENT ON TABLE issue_items IS 'Items selected for specific issues';
COMMENT ON TABLE subscribers IS 'Newsletter subscribers';
COMMENT ON TABLE events IS 'Email engagement tracking events';

COMMENT ON FUNCTION is_org_member IS 'Check if current user is a member of an organization';
COMMENT ON FUNCTION has_org_role IS 'Check if current user has a specific role in an organization';
COMMENT ON FUNCTION is_org_admin IS 'Check if current user is admin or owner of an organization';
COMMENT ON FUNCTION user_org_ids IS 'Get all organization IDs for current user';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
