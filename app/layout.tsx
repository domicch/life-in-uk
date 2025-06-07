import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life in the UK Test',
  description: 'Practice Life in the UK citizenship test questions',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
