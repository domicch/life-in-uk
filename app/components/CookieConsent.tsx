'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QuizAnalytics } from '../utils/analytics'

interface CookieConsentProps {
  onConsentChange: (hasConsent: boolean) => void
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      onConsentChange(consent === 'accepted')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
    onConsentChange(true)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
    onConsentChange(false)
  }

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential-only')
    setShowBanner(false)
    onConsentChange(false)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🍪</span>
                <h3 className="font-semibold text-gray-900">Cookie Notice</h3>
              </div>
              <p className="text-sm text-gray-600">
                We use cookies to analyze how you use our quiz to help improve the questions and user experience. 
                Your quiz performance data helps us identify difficult questions and improve our content.
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={handleAcceptEssential}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
          
          {/* Detailed Information */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📊 Analytics Cookies</h4>
                  <p className="text-gray-600 mb-2">
                    Google Analytics helps us understand:
                  </p>
                  <ul className="text-gray-600 text-xs space-y-1">
                    <li>• Which quiz questions are most difficult</li>
                    <li>• How long users spend on questions</li>
                    <li>• Quiz completion rates</li>
                    <li>• General website usage patterns</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Data retention:</strong> 26 months<br/>
                    <strong>Data sharing:</strong> Google Analytics only
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🔒 Your Privacy</h4>
                  <ul className="text-gray-600 text-xs space-y-1">
                    <li>• <strong>No personal information</strong> is collected</li>
                    <li>• <strong>IP addresses are anonymized</strong></li>
                    <li>• <strong>No tracking across other websites</strong></li>
                    <li>• <strong>Data helps improve the quiz</strong> for everyone</li>
                  </ul>
                  <div className="mt-2">
                    <Link 
                      href="/privacy" 
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      Read our Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
