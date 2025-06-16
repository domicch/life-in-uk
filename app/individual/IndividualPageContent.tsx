'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Papa from 'papaparse'
import Link from 'next/link'
import { getAssetUrl } from '../utils/assets'
import { QuizContainer } from '../components/quiz'

interface Question {
  examNumber: number
  questionNumber: number
  question: string
  reference: string
}

export default function IndividualPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const examNumber = searchParams.get('exam')
  const mode = searchParams.get('mode') || 'practice'
  
  const [availableExams, setAvailableExams] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load available exam numbers
  useEffect(() => {
    const loadAvailableExams = async () => {
      try {
        const response = await fetch(getAssetUrl('questions.csv'))
        if (!response.ok) throw new Error('Failed to load exam data')
        
        const csvText = await response.text()
        const questionsData = Papa.parse<Question>(csvText, {
          header: true,
          skipEmptyLines: true
        }).data

        // Get unique exam numbers
        const examNumbers = Array.from(
          new Set(
            questionsData
              .map(q => parseInt(q.examNumber?.toString() || '0'))
              .filter(num => num > 0)
          )
        ).sort((a, b) => a - b)

        setAvailableExams(examNumbers)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam data')
        setLoading(false)
      }
    }

    loadAvailableExams()
  }, [])

  // If exam number is specified, show the quiz
  if (examNumber) {
    const examNum = parseInt(examNumber)
    if (availableExams.length > 0 && availableExams.includes(examNum)) {
      const config = {
        mode: 'individual' as const,
        examNumber: examNum,
        shuffleAnswers: false, // Keep original order for individual exams
        showInstantFeedback: true,
        allowReview: true,
        showProgress: true
      }

      return (
        <QuizContainer 
          config={config} 
          onBackToSelection={() => router.push('/individual')}
        />
      )
    } else if (!loading && availableExams.length > 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">
              Exam {examNumber} not found
            </p>
            <p className="text-gray-600 mb-4">
              Available exams: {availableExams.join(', ')}
            </p>
            <Link 
              href="/individual"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Back to Exam Selection
            </Link>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading available exams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show exam selection
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Individual Tests
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Practice specific exam sets. Choose from {availableExams.length} available tests.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {availableExams.map(examNum => (
              <div key={examNum} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Exam {examNum}
                </h3>
                <p className="text-gray-600 mb-6">
                  Practice all questions from exam set {examNum}.
                </p>
                
                <div className="space-y-3">
                  <Link
                    href={`/individual?exam=${examNum}&mode=practice`}
                    className="block w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center"
                  >
                    📚 Practice Mode
                  </Link>
                  
                  <Link
                    href={`/individual?exam=${examNum}&mode=test`}
                    className="block w-full bg-success-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-success-700 transition-colors text-center"
                  >
                    ⏱️ Test Mode
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Main Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
