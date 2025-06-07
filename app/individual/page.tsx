'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import Link from 'next/link'
import { getAssetUrl } from '../utils/assets'

interface Question {
  examNumber: number
  questionNumber: number
  question: string
  reference: string
}

interface Answer {
  examNumber: number
  questionNumber: number
  answerNumber: number
  answer: string
  isCorrect: string
}

interface ExamInfo {
  examNumber: number
  questionCount: number
  firstQuestion: string
}

export default function IndividualTestsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<ExamInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadExamList = async () => {
      try {
        const questionsResponse = await fetch(getAssetUrl('questions.csv'))
        
        if (!questionsResponse.ok) {
          throw new Error('Failed to load exam data')
        }

        const questionsText = await questionsResponse.text()
        const questionsData = Papa.parse<Question>(questionsText, {
          header: true,
          skipEmptyLines: true
        }).data

        // Group questions by exam number
        const examMap = new Map<number, Question[]>()
        
        console.log('Sample questions for debugging:', questionsData.slice(0, 5).map(q => ({
          examNumber: q.examNumber, 
          type: typeof q.examNumber,
          parsed: parseInt(q.examNumber?.toString() || '0')
        })));
        
        questionsData.forEach(q => {
          const examNum = parseInt(q.examNumber?.toString() || '0')
          if (examNum > 0) {
            if (!examMap.has(examNum)) {
              examMap.set(examNum, [])
            }
            examMap.get(examNum)!.push(q)
          }
        })

        // Create exam info list
        const examList: ExamInfo[] = Array.from(examMap.entries())
          .map(([examNumber, questions]) => ({
            examNumber,
            questionCount: questions.length,
            firstQuestion: questions[0]?.question || 'No questions available'
          }))
          .sort((a, b) => a.examNumber - b.examNumber)

        setExams(examList)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam data')
        setLoading(false)
      }
    }

    loadExamList()
  }, [])

  const startIndividualTest = (examNumber: number) => {
    router.push(`/individual/${examNumber}`)
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
          <Link 
            href="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Individual Test Selection
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Choose a specific exam to practice. Each exam contains questions from the original test sets.
            </p>
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Exam Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {exams.map((exam) => (
              <div key={exam.examNumber} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Exam {exam.examNumber}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {exam.questionCount} questions
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Sample question: "{exam.firstQuestion.substring(0, 80)}{exam.firstQuestion.length > 80 ? '...' : ''}"
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => startIndividualTest(exam.examNumber)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Take Exam {exam.examNumber}
                  </button>
                  
                  <button
                    onClick={() => router.push(`/individual/${exam.examNumber}?mode=practice`)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Practice Mode
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📚 About Individual Tests
            </h3>
            <div className="text-blue-800 space-y-2">
              <p><strong>Test Mode:</strong> Timed session with official scoring (75% to pass)</p>
              <p><strong>Practice Mode:</strong> No time limit, instant feedback, review your answers</p>
              <p><strong>Results:</strong> Get detailed feedback and export wrong answers for study</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {exams.length}
              </div>
              <div className="text-gray-600">Available Exams</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">
                {exams.reduce((total, exam) => total + exam.questionCount, 0)}
              </div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">
                {Math.round(exams.reduce((total, exam) => total + exam.questionCount, 0) / exams.length)}
              </div>
              <div className="text-gray-600">Avg Questions/Exam</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
