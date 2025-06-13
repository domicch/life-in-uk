'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface GoogleAnalyticsProps {
  gaId: string
  hasConsent: boolean
}

export default function GoogleAnalytics({ gaId, hasConsent }: GoogleAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setShouldLoad(hasConsent)
  }, [hasConsent])

  // Don't load GA if user hasn't consented
  if (!shouldLoad) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  )
}
