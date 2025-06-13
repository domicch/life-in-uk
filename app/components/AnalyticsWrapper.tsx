'use client'

import { useState, useEffect } from 'react'
import GoogleAnalytics from './GoogleAnalytics'
import CookieConsent from './CookieConsent'

interface AnalyticsWrapperProps {
  gaId: string
}

export default function AnalyticsWrapper({ gaId }: AnalyticsWrapperProps) {
  const [hasConsent, setHasConsent] = useState(false)
  const [consentLoaded, setConsentLoaded] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      setHasConsent(consent === 'accepted')
    }
    setConsentLoaded(true)
  }, [])

  const handleConsentChange = (consent: boolean) => {
    setHasConsent(consent)
  }

  // Don't render anything until we've checked localStorage
  if (!consentLoaded) {
    return null
  }

  return (
    <>
      {gaId && hasConsent && (
        <GoogleAnalytics gaId={gaId} hasConsent={hasConsent} />
      )}
      <CookieConsent onConsentChange={handleConsentChange} />
    </>
  )
}
