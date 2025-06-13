import './globals.css'
import type { Metadata } from 'next'
import VersionInfo from './components/VersionInfo'
import AnalyticsWrapper from './components/AnalyticsWrapper'
import './utils/errorSuppression'

export const metadata: Metadata = {
  title: 'Life in the UK Test',
  description: 'Practice Life in the UK citizenship test questions',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23012169"/><rect x="0" y="6" width="16" height="4" fill="white"/><rect x="6" y="0" width="4" height="16" fill="white"/><rect x="0" y="7" width="16" height="2" fill="%23C8102E"/><rect x="7" y="0" width="2" height="16" fill="%23C8102E"/></svg>',
        type: 'image/svg+xml',
      },
    ],
    shortcut: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23012169"/><rect x="0" y="6" width="16" height="4" fill="white"/><rect x="6" y="0" width="4" height="16" fill="white"/><rect x="0" y="7" width="16" height="2" fill="%23C8102E"/><rect x="7" y="0" width="2" height="16" fill="%23C8102E"/></svg>',
  },
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || ''
  
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AnalyticsWrapper gaId={GA_MEASUREMENT_ID} />
        {children}
        <VersionInfo />
      </body>
    </html>
  )
}
