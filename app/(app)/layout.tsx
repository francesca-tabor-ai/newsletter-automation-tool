import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/auth/SignOutButton'
import Link from 'next/link'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* App Navigation */}
      <header className="bg-surface border-b border-slate-100">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-h3 font-bold text-slate-600 hover:text-coral-500 transition-colors">
                AutoNews
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/app" className="text-body text-slate-400 hover:text-slate-600 transition-colors">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-small text-slate-400">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
