# Lib Directory

This directory contains utility libraries, helpers, and shared logic for the AutoNews application.

## Structure

```
lib/
├── supabase/           # Supabase client configurations
│   ├── client.ts       # Client-side Supabase client
│   ├── server.ts       # Server-side Supabase client
│   ├── admin.ts        # Admin client with service role
│   └── middleware.ts   # Auth middleware helper
└── utils.ts            # Common utility functions
```

## Supabase Clients

### Client-side (`client.ts`)

Use in Client Components (components with `'use client'`):

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('workspaces').select()
```

### Server-side (`server.ts`)

Use in Server Components, Server Actions, and Route Handlers:

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Admin Client (`admin.ts`)

Use for operations that need to bypass RLS (server-only):

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

// Server-side only - never expose to client
const supabase = createAdminClient()
const { data, error } = await supabase.from('workspaces').select()
```

⚠️ **Warning**: The admin client bypasses Row-Level Security. Only use when necessary and always validate permissions manually.

## Utilities (`utils.ts`)

Common helper functions available throughout the app:

```typescript
import { formatDate, slugify, isValidEmail } from '@/lib/utils'

// Format dates
const formatted = formatDate(new Date()) // "January 4, 2026"

// Create URL slugs
const slug = slugify('My Newsletter Title') // "my-newsletter-title"

// Validate emails
const valid = isValidEmail('user@example.com') // true
```

## Adding New Utilities

When adding new utility functions:

1. Keep functions pure (no side effects)
2. Add TypeScript types
3. Add JSDoc comments
4. Export from the appropriate file
5. Group related functions together

### Example

```typescript
/**
 * Calculate the reading time for text content
 * @param text - The text content
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(
  text: string, 
  wordsPerMinute: number = 200
): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
```

