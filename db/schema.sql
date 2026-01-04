-- AutoNews Database Schema
-- This file contains the SQL migrations for creating the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces table
-- Each user can have multiple workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletters table
-- Each workspace can have multiple newsletters
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject_template TEXT,
  schedule_frequency TEXT, -- daily, weekly, monthly
  schedule_day INTEGER, -- day of week (0-6) or day of month (1-31)
  schedule_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Sources table
-- Each newsletter can have multiple RSS sources
CREATE TABLE IF NOT EXISTS rss_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Issues table
-- Generated newsletter drafts/sent issues
CREATE TABLE IF NOT EXISTS newsletter_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL, -- draft, scheduled, sent
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue Items table
-- Individual RSS items included in a newsletter issue
CREATE TABLE IF NOT EXISTS issue_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  rss_source_id UUID REFERENCES rss_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
-- Track email opens, clicks, etc.
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES newsletter_issues(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- open, click, bounce, etc.
  recipient_email TEXT,
  url TEXT, -- for click events
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_workspace_id ON newsletters(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rss_sources_newsletter_id ON rss_sources(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_issues_newsletter_id ON newsletter_issues(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_issue_items_issue_id ON issue_items(issue_id);
CREATE INDEX IF NOT EXISTS idx_analytics_issue_id ON analytics(issue_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Newsletters policies
CREATE POLICY "Users can view newsletters in their workspaces"
  ON newsletters FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create newsletters in their workspaces"
  ON newsletters FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update newsletters in their workspaces"
  ON newsletters FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete newsletters in their workspaces"
  ON newsletters FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- RSS Sources policies
CREATE POLICY "Users can view rss sources in their newsletters"
  ON rss_sources FOR SELECT
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rss sources in their newsletters"
  ON rss_sources FOR INSERT
  WITH CHECK (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rss sources in their newsletters"
  ON rss_sources FOR UPDATE
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rss sources in their newsletters"
  ON rss_sources FOR DELETE
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Newsletter Issues policies (similar pattern for remaining tables)
CREATE POLICY "Users can view issues in their newsletters"
  ON newsletter_issues FOR SELECT
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues in their newsletters"
  ON newsletter_issues FOR INSERT
  WITH CHECK (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update issues in their newsletters"
  ON newsletter_issues FOR UPDATE
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete issues in their newsletters"
  ON newsletter_issues FOR DELETE
  USING (
    newsletter_id IN (
      SELECT n.id FROM newsletters n
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Issue Items policies
CREATE POLICY "Users can view items in their issues"
  ON issue_items FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM newsletter_issues i
      INNER JOIN newsletters n ON i.newsletter_id = n.id
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their issues"
  ON issue_items FOR INSERT
  WITH CHECK (
    issue_id IN (
      SELECT i.id FROM newsletter_issues i
      INNER JOIN newsletters n ON i.newsletter_id = n.id
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their issues"
  ON issue_items FOR UPDATE
  USING (
    issue_id IN (
      SELECT i.id FROM newsletter_issues i
      INNER JOIN newsletters n ON i.newsletter_id = n.id
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their issues"
  ON issue_items FOR DELETE
  USING (
    issue_id IN (
      SELECT i.id FROM newsletter_issues i
      INNER JOIN newsletters n ON i.newsletter_id = n.id
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Users can view analytics for their issues"
  ON analytics FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM newsletter_issues i
      INNER JOIN newsletters n ON i.newsletter_id = n.id
      INNER JOIN workspaces w ON n.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Analytics can be inserted by anyone (for tracking)
CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- Functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rss_sources_updated_at BEFORE UPDATE ON rss_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_issues_updated_at BEFORE UPDATE ON newsletter_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

