import { Suspense } from 'react'
import IndividualPageContent from './IndividualPageContent'

export default function IndividualPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <IndividualPageContent />
    </Suspense>
  )
}
