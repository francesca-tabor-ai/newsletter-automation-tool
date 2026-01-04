# Database Schema

This directory contains the database schema and types for AutoNews.

## Files

- `schema.sql` - Complete SQL schema for the database including tables, RLS policies, and triggers
- `types.ts` - TypeScript types for the database (can be auto-generated from Supabase)

## Setting up the Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL to create all tables and policies

## Database Structure

### Tables

- **workspaces** - User workspaces for organizing newsletters
- **newsletters** - Newsletter configurations
- **rss_sources** - RSS feed sources for each newsletter
- **newsletter_issues** - Generated newsletter drafts and sent issues
- **issue_items** - Individual articles/items in each issue
- **analytics** - Email tracking data (opens, clicks, etc.)

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access data in their own workspaces
- Proper cascading permissions through workspace → newsletter → sources/issues
- Analytics can be tracked without authentication (for email tracking pixels)

## Generating TypeScript Types

To automatically generate TypeScript types from your Supabase schema:

\`\`\`bash
npx supabase gen types typescript --project-id <your-project-id> > db/types.ts
\`\`\`

Replace `<your-project-id>` with your actual Supabase project ID.

