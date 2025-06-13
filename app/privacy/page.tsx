import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What We Collect</h2>
              <p className="text-gray-700 mb-4">
                Our Life in the UK test website uses Google Analytics to understand how you use our quiz platform. 
                We collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Quiz performance data:</strong> Which questions you answer correctly or incorrectly, time spent on questions</li>
                <li><strong>Usage analytics:</strong> Page views, session duration, device type, browser information</li>
                <li><strong>Technical data:</strong> IP address (anonymized), general location (country/region)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>We do NOT collect:</strong> Your name, email, phone number, or any personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Why We Collect This Data</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Identify which quiz questions are most difficult for users</li>
                <li>Improve question explanations and content quality</li>
                <li>Understand user behavior to enhance the quiz experience</li>
                <li>Monitor website performance and fix technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Protect Your Privacy</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>IP Anonymization:</strong> Google Analytics anonymizes your IP address</li>
                <li><strong>No Cross-Site Tracking:</strong> We don&apos;t track you across other websites</li>
                <li><strong>No Personal Profiles:</strong> We don&apos;t build personal profiles or target ads</li>
                <li><strong>Secure Storage:</strong> Data is stored securely by Google Analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700">
                Google Analytics retains your data for 26 months, after which it&apos;s automatically deleted. 
                You can request data deletion at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Withdraw consent:</strong> Disable analytics cookies at any time</li>
                <li><strong>Access your data:</strong> Request what data we&apos;ve collected (though it&apos;s minimal and anonymized)</li>
                <li><strong>Delete your data:</strong> Request deletion of your analytics data</li>
                <li><strong>Opt out:</strong> Use the &quot;Essential Only&quot; or &quot;Decline All&quot; cookie options</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies We Use</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Analytics Cookies (Optional)</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>_ga:</strong> Distinguishes users (expires after 2 years)</li>
                  <li><strong>_ga_*:</strong> Persists session state (expires after 2 years)</li>
                  <li><strong>_gid:</strong> Distinguishes users (expires after 24 hours)</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  These cookies are only set if you accept analytics cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We use Google Analytics to collect and analyze usage data. Google&apos;s privacy policy applies to this data:
              </p>
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Google Privacy Policy
              </a>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. Any changes will be posted on this page 
                with an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or your data, please contact us through 
                our website or by email.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
