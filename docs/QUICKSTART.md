# AutoNews Quick Reference

## 📁 Folder Structure

```
app/
├── (marketing)/          # Route group - Public marketing pages
│   ├── page.tsx          # Landing page at /
│   └── layout.tsx
├── (app)/                # Route group - Protected app area
│   ├── app/page.tsx      # Main dashboard at /app
│   └── layout.tsx        # Protected layout with auth check
├── auth/                 # Auth pages at /auth/*
│   ├── login/
│   ├── signup/
│   └── reset-password/
├── layout.tsx            # Root layout
└── globals.css

components/               # Reusable components
├── auth/
│   └── SignOutButton.tsx
└── index.ts

lib/                      # Utilities and helpers
├── supabase/
│   ├── client.ts         # Client-side
│   ├── server.ts         # Server-side
│   ├── admin.ts          # Admin (bypass RLS)
│   └── middleware.ts
└── utils.ts

db/                       # Database schema
├── schema.sql            # Full SQL schema + RLS
├── types.ts              # TypeScript types
└── README.md
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection (redirects) |
| `tailwind.config.ts` | Tailwind v4 config |
| `tsconfig.json` | TypeScript config |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc` | Code formatting |
| `db/schema.sql` | Complete database schema |

## 🛣️ Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page → redirects to /app if logged in |
| `/auth/login` | Public | Login page |
| `/auth/signup` | Public | Signup page |
| `/auth/reset-password` | Public | Password reset |
| `/app` | Protected | Main dashboard (must be logged in) |

## 🔐 Authentication

### Client Component
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Admin (Server-only)
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient() // Bypasses RLS
```

## 🗄️ Database Tables

1. **workspaces** - User workspaces
2. **newsletters** - Newsletter configs
3. **rss_sources** - RSS feeds
4. **newsletter_issues** - Generated issues
5. **issue_items** - Articles in issues
6. **analytics** - Email tracking

## 🎨 Styling

Tailwind v4 - Use utility classes directly:
```tsx
<div className="bg-blue-600 text-white rounded-lg p-4">
  Content
</div>
```

## 🚀 Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## 📝 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Server-only!
```

## ✅ Setup Checklist

- [ ] Run `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase credentials to `.env.local`
- [ ] Run SQL from `db/schema.sql` in Supabase SQL Editor
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000

## 🎯 Next Steps (Feature Development)

1. **Workspaces** - Create workspace CRUD pages
2. **Newsletters** - Newsletter creation UI
3. **RSS** - RSS feed parser + fetcher
4. **Generator** - Auto-generate newsletter drafts
5. **Editor** - Rich text editor for issues
6. **Scheduler** - Cron jobs for sending
7. **Email** - SendGrid/Mailgun integration
8. **Analytics** - Dashboard with charts

