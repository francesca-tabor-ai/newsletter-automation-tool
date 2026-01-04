/**
 * Database Types for AutoNews Multi-Tenant SaaS
 * 
 * Generated types for the Supabase database schema.
 * 
 * To regenerate these types automatically, run:
 * npx supabase gen types typescript --project-id <project-id> > db/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type OrgMemberRole = 'owner' | 'admin' | 'editor' | 'viewer'

export type SourceType = 'rss' | 'atom' | 'api' | 'webhook'

export type IssueStatus = 'draft' | 'frozen' | 'scheduled' | 'sent' | 'skipped' | 'failed'

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'complained'

export type EventType = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'

export type RuleSortBy = 'published_at' | 'score' | 'title'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          slug: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          org_id: string
          user_id: string
          role: OrgMemberRole
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          org_id: string
          user_id: string
          role: OrgMemberRole
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: OrgMemberRole
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      newsletters: {
        Row: {
          id: string
          org_id: string
          name: string
          slug: string | null
          from_name: string
          from_email: string | null
          reply_to: string | null
          subject_template: string | null
          branding_json: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          slug?: string | null
          from_name: string
          from_email?: string | null
          reply_to?: string | null
          subject_template?: string | null
          branding_json?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          slug?: string | null
          from_name?: string
          from_email?: string | null
          reply_to?: string | null
          subject_template?: string | null
          branding_json?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          org_id: string
          type: SourceType
          url: string
          name: string
          description: string | null
          is_active: boolean
          fetch_frequency_minutes: number
          last_fetched_at: string | null
          last_fetch_status: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          type?: SourceType
          url: string
          name: string
          description?: string | null
          is_active?: boolean
          fetch_frequency_minutes?: number
          last_fetched_at?: string | null
          last_fetch_status?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          type?: SourceType
          url?: string
          name?: string
          description?: string | null
          is_active?: boolean
          fetch_frequency_minutes?: number
          last_fetched_at?: string | null
          last_fetch_status?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_sources: {
        Row: {
          newsletter_id: string
          source_id: string
          section_title: string | null
          sort_order: number
          is_enabled: boolean
          created_at: string
        }
        Insert: {
          newsletter_id: string
          source_id: string
          section_title?: string | null
          sort_order?: number
          is_enabled?: boolean
          created_at?: string
        }
        Update: {
          newsletter_id?: string
          source_id?: string
          section_title?: string | null
          sort_order?: number
          is_enabled?: boolean
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          org_id: string
          source_id: string
          url: string
          canonical_url: string | null
          title: string
          author: string | null
          published_at: string | null
          summary: string | null
          content_text: string | null
          content_html: string | null
          image_url: string | null
          hash: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          source_id: string
          url: string
          canonical_url?: string | null
          title: string
          author?: string | null
          published_at?: string | null
          summary?: string | null
          content_text?: string | null
          content_html?: string | null
          image_url?: string | null
          hash: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          source_id?: string
          url?: string
          canonical_url?: string | null
          title?: string
          author?: string | null
          published_at?: string | null
          summary?: string | null
          content_text?: string | null
          content_html?: string | null
          image_url?: string | null
          hash?: string
          metadata?: Json
          created_at?: string
        }
      }
      rules: {
        Row: {
          id: string
          newsletter_id: string
          name: string | null
          include_keywords: string[]
          exclude_keywords: string[]
          include_sources: string[]
          exclude_sources: string[]
          max_items: number
          lookback_days: number
          dedupe: boolean
          score_threshold: number | null
          sort_by: RuleSortBy
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          name?: string | null
          include_keywords?: string[]
          exclude_keywords?: string[]
          include_sources?: string[]
          exclude_sources?: string[]
          max_items?: number
          lookback_days?: number
          dedupe?: boolean
          score_threshold?: number | null
          sort_by?: RuleSortBy
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          name?: string | null
          include_keywords?: string[]
          exclude_keywords?: string[]
          include_sources?: string[]
          exclude_sources?: string[]
          max_items?: number
          lookback_days?: number
          dedupe?: boolean
          score_threshold?: number | null
          sort_by?: RuleSortBy
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          newsletter_id: string
          status: IssueStatus
          title: string | null
          scheduled_for: string | null
          sent_at: string | null
          intro_md: string | null
          outro_md: string | null
          generated_html: string | null
          metadata: Json
          created_by: string | null
          sent_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          status?: IssueStatus
          title?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          intro_md?: string | null
          outro_md?: string | null
          generated_html?: string | null
          metadata?: Json
          created_by?: string | null
          sent_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          status?: IssueStatus
          title?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          intro_md?: string | null
          outro_md?: string | null
          generated_html?: string | null
          metadata?: Json
          created_by?: string | null
          sent_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      issue_items: {
        Row: {
          issue_id: string
          item_id: string
          position: number
          section: string | null
          custom_title: string | null
          custom_summary: string | null
          custom_url: string | null
          removed: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          issue_id: string
          item_id: string
          position?: number
          section?: string | null
          custom_title?: string | null
          custom_summary?: string | null
          custom_url?: string | null
          removed?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          issue_id?: string
          item_id?: string
          position?: number
          section?: string | null
          custom_title?: string | null
          custom_summary?: string | null
          custom_url?: string | null
          removed?: boolean
          metadata?: Json
          created_at?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          newsletter_id: string
          email: string
          status: SubscriberStatus
          first_name: string | null
          last_name: string | null
          metadata: Json
          subscribed_at: string
          unsubscribed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          email: string
          status?: SubscriberStatus
          first_name?: string | null
          last_name?: string | null
          metadata?: Json
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          email?: string
          status?: SubscriberStatus
          first_name?: string | null
          last_name?: string | null
          metadata?: Json
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          issue_id: string | null
          subscriber_id: string | null
          type: EventType
          url: string | null
          user_agent: string | null
          ip_address: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          issue_id?: string | null
          subscriber_id?: string | null
          type: EventType
          url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string | null
          subscriber_id?: string | null
          type?: EventType
          url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      newsletter_stats: {
        Row: {
          newsletter_id: string
          newsletter_name: string
          org_id: string
          total_subscribers: number
          active_subscribers: number
          total_issues: number
          sent_issues: number
          total_opens: number
          total_clicks: number
        }
      }
    }
    Functions: {
      is_org_member: {
        Args: { target_org_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: { target_org_id: string; required_role: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { target_org_id: string }
        Returns: boolean
      }
      user_org_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
    }
    Enums: {
      org_member_role: OrgMemberRole
      source_type: SourceType
      issue_status: IssueStatus
      subscriber_status: SubscriberStatus
      event_type: EventType
      rule_sort_by: RuleSortBy
    }
  }
}
