'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface TestResult {
  questionIndex: number
  examNumber: number
  questionNumber: number
  question: string
  reference: string
  selectedAnswers: number[]
  correctAnswers: number[]
  isCorrect: boolean
  userAnswerTexts: string[]
  correctAnswerTexts: string[]
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resultsData = searchParams.get('data')
    if (resultsData) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsData))
        setResults(parsedResults)
      } catch (error) {
        console.error('Error parsing results data:', error)
      }
    }
    setLoading(false)
  }, [searchParams])

  const correctCount = results.filter(r => r.isCorrect).length
  const incorrectCount = results.length - correctCount
  const percentage = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0
  const passed = percentage >= 75
  const incorrectResults = results.filter(r => !r.isCorrect)

  const exportIncorrectAnswers = () => {
    const csvHeaders = [
      'Question Number',
      'Question',
      'Your Answer(s)',
      'Correct Answer(s)',
      'Explanation'
    ]

    const csvRows = incorrectResults.map(result => [
      `Question ${result.questionIndex + 1}`,
      `"${result.question.replace(/"/g, '""')}"`,
      `"${result.userAnswerTexts.join('; ').replace(/"/g, '""')}"`,
      `"${result.correctAnswerTexts.join('; ').replace(/"/g, '""')}"`,
      `"${result.reference.replace(/"/g, '""')}"`
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `life-in-uk-incorrect-answers-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Test Results
            </h1>
            <div className={`text-6xl font-bold mb-4 ${passed ? 'text-success-600' : 'text-danger-600'}`}>
              {percentage}%
            </div>
            <div className={`text-2xl font-semibold ${passed ? 'text-success-800' : 'text-danger-800'}`}>
              {passed ? '🎉 PASSED!' : '❌ FAILED'}
            </div>
            {passed ? (
              <p className="text-lg text-success-700 mt-2">
                Congratulations! You passed the Life in the UK test.
              </p>
            ) : (
              <p className="text-lg text-danger-700 mt-2">
                You need 75% (18 out of 24) to pass. Keep studying and try again!
              </p>
            )}
          </div>

          {/* Score Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">
                {correctCount}
              </div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-danger-600 mb-2">
                {incorrectCount}
              </div>
              <div className="text-gray-600">Incorrect Answers</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {results.length}
              </div>
              <div className="text-gray-600">Total Questions</div>
            </div>
          </div>

          {/* Export and Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              {incorrectCount > 0 && (
                <button
                  onClick={exportIncorrectAnswers}
                  className="bg-warning-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-warning-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Incorrect Answers (CSV)
                </button>
              )}
              
              <Link
                href="/test"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Take Another Test
              </Link>
              
              <Link
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Incorrect Answers Details */}
          {incorrectCount > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Questions You Got Wrong ({incorrectCount})
              </h2>
              
              <div className="space-y-6">
                {incorrectResults.map((result, index) => (
                  <div key={index} className="border-l-4 border-danger-500 pl-4 py-2">
                    <div className="font-medium text-gray-900 mb-2">
                      Question {result.questionIndex + 1}: {result.question}
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-danger-600 font-medium">Your answer: </span>
                      <span className="text-danger-700">{result.userAnswerTexts.join(', ')}</span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-success-600 font-medium">Correct answer: </span>
                      <span className="text-success-700">{result.correctAnswerTexts.join(', ')}</span>
                    </div>
                    
                    {result.reference && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Explanation:</strong> {result.reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfect Score Message */}
          {incorrectCount === 0 && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-6 text-center">
              <div className="text-success-700 text-xl font-medium mb-2">
                🌟 Perfect Score! 🌟
              </div>
              <p className="text-success-600">
                Excellent work! You answered all questions correctly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
