import '@/app/globals.css'
import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'AutoNews - Automated Newsletter Creation',
  description: 'Turn RSS feeds into ready-to-send newsletters automatically',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
