import Link from 'next/link'
import Image from 'next/image'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-slate-100">
        <nav className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-h3 font-bold text-slate-600">AutoNews</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-body text-slate-400 hover:text-slate-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="h-[44px] px-4 rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-medium shadow-button transition-colors inline-flex items-center"
            >
              Start free trial
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 text-slate-600 mb-4">
              Turn RSS feeds into a ready-to-send newsletter—automatically
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">
              Perfect for <strong>creators, companies, and communities</strong> who want to{' '}
              <strong>send newsletters in minutes</strong>, not hours. Connect your sources, 
              choose a template, and let AutoNews draft your next issue.
            </p>
            
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mb-8 text-small text-slate-400">
              <span className="flex items-center gap-2">
                ✓ No credit card required
              </span>
              <span className="flex items-center gap-2">
                ✓ Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                ✓ Free 14-day trial
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 justify-center mb-4">
              <Link
                href="/auth/signup"
                className="h-[48px] px-6 rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold shadow-button transition-colors inline-flex items-center text-lg"
              >
                Start free trial
              </Link>
              <Link
                href="#demo"
                className="h-[48px] px-6 rounded-lg bg-surface hover:bg-slate-50 text-slate-600 font-semibold border border-slate-100 shadow-button transition-colors inline-flex items-center text-lg"
              >
                View sample newsletter
              </Link>
            </div>
            <p className="text-small text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-coral-500 hover:text-coral-600 transition-colors">
                Log in
              </Link>
            </p>
          </div>

          {/* Product Screenshot/Demo */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-surface border border-slate-100 rounded-2xl shadow-card overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="text-xs text-slate-400 ml-2">Dashboard • AutoNews</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📧</div>
                  <h3 className="text-h3 text-slate-600 mb-2">Newsletter Preview</h3>
                  <p className="text-body text-slate-400">
                    Screenshot of the actual product would go here
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                    <div className="bg-white border border-slate-100 rounded-lg p-4 text-left">
                      <div className="w-8 h-8 bg-coral-50 rounded-lg mb-2 flex items-center justify-center text-lg">
                        📡
                      </div>
                      <div className="text-small font-medium text-slate-600">RSS Feeds</div>
                      <div className="text-xs text-slate-400">Connect sources</div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-lg p-4 text-left">
                      <div className="w-8 h-8 bg-coral-50 rounded-lg mb-2 flex items-center justify-center text-lg">
                        ✨
                      </div>
                      <div className="text-small font-medium text-slate-600">Auto-Draft</div>
                      <div className="text-xs text-slate-400">Smart curation</div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-lg p-4 text-left">
                      <div className="w-8 h-8 bg-coral-50 rounded-lg mb-2 flex items-center justify-center text-lg">
                        📊
                      </div>
                      <div className="text-small font-medium text-slate-600">Analytics</div>
                      <div className="text-xs text-slate-400">Track clicks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-surface border-y border-slate-100 py-12">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-small text-slate-400 mb-6">
                Integrates with your favorite tools
              </p>
              <div className="flex items-center justify-center gap-8 opacity-60">
                <div className="text-body text-slate-400 font-medium">SendGrid</div>
                <div className="text-body text-slate-400 font-medium">RSS/Atom</div>
                <div className="text-body text-slate-400 font-medium">Supabase</div>
                <div className="text-body text-slate-400 font-medium">Vercel</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-h2 text-center text-slate-600 mb-3">
            Everything you need to automate your newsletter
          </h2>
          <p className="text-body text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Stop spending hours curating content. AutoNews handles the heavy lifting so you can focus on your audience.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">RSS that just works</h3>
              <p className="text-body text-slate-500 mb-3">
                Pull from <strong>unlimited RSS feeds</strong> automatically—no copy/paste. 
                Connect blogs, news sites, and any RSS source.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Unlimited feed connections</li>
                <li>✓ Auto-fetch every hour</li>
                <li>✓ Deduplication built-in</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">Smarter story selection</h3>
              <p className="text-body text-slate-500 mb-3">
                <strong>Auto-rank stories by relevance</strong> and filter by keywords. 
                Your newsletter highlights the best posts, not everything.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Keyword filtering</li>
                <li>✓ Edit before sending</li>
                <li>✓ Drag-and-drop reordering</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">Analytics that help you improve</h3>
              <p className="text-body text-slate-500 mb-3">
                <strong>Track clicks per story</strong> and see which content performs. 
                Optimize each send based on real data.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Open & click tracking</li>
                <li>✓ Per-story analytics</li>
                <li>✓ Engagement trends</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">Schedule weekly sends</h3>
              <p className="text-body text-slate-500 mb-3">
                Set it and forget it. <strong>Auto-draft every week</strong> and send 
                automatically, or review before hitting send.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Recurring schedules</li>
                <li>✓ Auto-send or review first</li>
                <li>✓ Skip empty weeks</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">Beautiful templates</h3>
              <p className="text-body text-slate-500 mb-3">
                Professional email templates with your branding. Customize colors, 
                fonts, and layout—<strong>no coding required</strong>.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Mobile-responsive</li>
                <li>✓ Custom branding</li>
                <li>✓ Multiple layouts</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-h4 text-slate-600 mb-2">Subscriber management</h3>
              <p className="text-body text-slate-500 mb-3">
                Import subscribers easily. Track who's active, handle unsubscribes 
                automatically, and <strong>stay compliant</strong>.
              </p>
              <ul className="text-small text-slate-400 space-y-1">
                <li>✓ Bulk import (CSV)</li>
                <li>✓ Auto-unsubscribe</li>
                <li>✓ GDPR compliant</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-h2 text-center text-slate-600 mb-3">
              How it works
            </h2>
            <p className="text-body text-slate-500 text-center mb-12">
              Three simple steps to your first automated newsletter
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 bg-coral-500 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    1
                  </div>
                  <h3 className="text-h4 text-slate-600 mb-2">Connect your feeds</h3>
                  <p className="text-body text-slate-500">
                    Add unlimited RSS sources—blogs, news sites, podcasts. We'll start pulling content immediately.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="text-2xl text-slate-300">→</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 bg-coral-500 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    2
                  </div>
                  <h3 className="text-h4 text-slate-600 mb-2">Customize your template</h3>
                  <p className="text-body text-slate-500">
                    Pick a layout, add your branding, set keywords to filter content. Schedule how often to send.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="text-2xl text-slate-300">→</div>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 bg-coral-500 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                    3
                  </div>
                  <h3 className="text-h4 text-slate-600 mb-2">Review and send</h3>
                  <p className="text-body text-slate-500">
                    AutoNews drafts your newsletter. Review it, make tweaks, then send—or set it to auto-send weekly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Objections Section */}
        <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-h2 text-center text-slate-600 mb-12">
            Common questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Q1 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <h3 className="text-h4 text-slate-600 mb-2">
                Will it send junk or irrelevant content?
              </h3>
              <p className="text-body text-slate-500">
                No. You review and approve every newsletter before it goes out. Plus, you can set 
                keyword filters and topic rules to ensure only relevant content makes it through. 
                You're always in control.
              </p>
            </div>

            {/* Q2 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <h3 className="text-h4 text-slate-600 mb-2">
                Can I control the formatting and branding?
              </h3>
              <p className="text-body text-slate-500">
                Absolutely. Choose from professional templates, customize colors and fonts to match 
                your brand, and edit layouts. No coding required—just click and customize.
              </p>
            </div>

            {/* Q3 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <h3 className="text-h4 text-slate-600 mb-2">
                Can I exclude certain topics or keywords?
              </h3>
              <p className="text-body text-slate-500">
                Yes. Set up keyword filters to include or exclude specific topics, sources, or 
                phrases. Your newsletter will only feature content that matches your criteria.
              </p>
            </div>

            {/* Q4 */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6 shadow-card">
              <h3 className="text-h4 text-slate-600 mb-2">
                What if I want to add my own content?
              </h3>
              <p className="text-body text-slate-500">
                Easy. Edit any draft to add custom headlines, summaries, or even entirely new 
                sections. Mix automated content with your own commentary seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-coral-50 to-slate-50 py-20">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-h2 text-slate-600 mb-3">
              Ready to send your next issue faster?
            </h2>
            <p className="text-body text-slate-500 mb-8">
              Join creators, companies, and communities who've cut their newsletter time in half.
            </p>
            <Link
              href="/auth/signup"
              className="h-[48px] px-8 rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold shadow-button transition-colors inline-flex items-center text-lg"
            >
              Start free trial
            </Link>
            <p className="text-small text-slate-400 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-surface py-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-h4 font-bold text-slate-600 mb-4 inline-block">AutoNews</span>
            <p className="text-body text-slate-400">
              Automated newsletters from RSS feeds
            </p>
            <p className="text-small text-slate-400 mt-4">
              © 2026 AutoNews. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
