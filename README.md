# AutoNews - Automated Newsletter Creation Platform

A modern SaaS application for creating and managing automated newsletters from RSS sources. Built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

- **Authentication** - Secure email/password authentication with Supabase Auth
- **Workspaces** - Organize newsletters in separate workspaces
- **RSS Integration** - Connect unlimited RSS feeds to newsletters
- **Automated Curation** - Generate newsletter drafts from RSS content
- **Scheduling** - Schedule newsletters to send automatically
- **Analytics** - Track opens, clicks, and engagement
- **Row-Level Security** - Built-in data protection with Supabase RLS

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Code Quality**: ESLint + Prettier

## 🏗️ Project Structure

```
/Users/francescatabor/Documents/1.Technology/Github/newsletter-automation-tool/
├── app/
│   ├── (marketing)/          # Marketing pages (public)
│   │   ├── page.tsx          # Landing page
│   │   └── layout.tsx
│   ├── (app)/                # Protected application area
│   │   ├── app/
│   │   │   └── page.tsx      # Main dashboard
│   │   └── layout.tsx        # App shell with auth check
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── reset-password/
│   │   └── layout.tsx
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # Reusable UI components
│   ├── auth/
│   │   └── SignOutButton.tsx
│   └── index.ts
├── lib/                      # Utility libraries
│   ├── supabase/
│   │   ├── client.ts         # Client-side Supabase
│   │   ├── server.ts         # Server-side Supabase
│   │   ├── admin.ts          # Admin client (service role)
│   │   └── middleware.ts     # Auth middleware helper
│   └── utils.ts              # Common utilities
├── db/                       # Database schema and types
│   ├── schema.sql            # Complete SQL schema with RLS
│   ├── types.ts              # TypeScript database types
│   └── README.md
├── middleware.ts             # Route protection middleware
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- A Supabase account and project
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd newsletter-automation-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Get these values from your Supabase project:
   - Go to Project Settings → API
   - Copy the Project URL and anon public key
   - Copy the service_role secret key (server-only, never expose to client)

4. **Set up the database**:
   - Open your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy the contents of `db/schema.sql`
   - Execute the SQL to create tables and RLS policies

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following main tables:

- `workspaces` - User workspaces for organizing newsletters
- `newsletters` - Newsletter configurations
- `rss_sources` - RSS feed sources
- `newsletter_issues` - Generated drafts and sent issues
- `issue_items` - Individual articles in issues
- `analytics` - Email tracking data

All tables have Row-Level Security (RLS) enabled to ensure data privacy.

See `db/README.md` for detailed schema documentation.

## 🔐 Authentication Flow

1. User signs up with email/password
2. Supabase creates user account
3. User is redirected to `/app` (protected area)
4. Middleware checks authentication on all protected routes
5. User can sign out to return to marketing pages

### Route Protection

- `/` (root) - Redirects to `/app` if logged in, otherwise shows marketing page
- `/auth/*` - Public authentication pages
- `/app/*` - Protected application area (requires authentication)

## 🎨 Styling

The project uses Tailwind CSS v4 with:
- Custom configuration in `tailwind.config.ts`
- Global styles in `app/globals.css`
- Utility-first approach for all components

## 🧪 Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## 📝 Environment Variables

| Variable | Description | Required | Exposed to Client |
|----------|-------------|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Yes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | No |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:
1. Set all environment variables
2. Use Node.js 18+
3. Build command: `npm run build`
4. Start command: `npm start`

## 📚 Next Steps

Now that the scaffold is complete, you can:

1. **Create Workspace Management** - Add pages to create/manage workspaces
2. **Build Newsletter Creator** - UI for creating newsletters
3. **RSS Feed Integration** - Fetch and parse RSS feeds
4. **Draft Generator** - Auto-generate newsletter content
5. **Email Service Integration** - Connect to email provider (SendGrid, Mailgun, etc.)
6. **Analytics Dashboard** - Visualize newsletter performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the `db/README.md` for database setup help
- Review Supabase documentation: https://supabase.com/docs
- Review Next.js documentation: https://nextjs.org/docs

---

Built with ❤️ using Next.js and Supabase
