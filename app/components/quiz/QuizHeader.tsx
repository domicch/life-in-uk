'use client'

interface QuizHeaderProps {
  mode: 'practice' | 'test' | 'individual'
  examNumber?: number
  currentQuestionIndex: number
  totalQuestions: number
  timeLeft?: number
  answeredCount?: number
  isCurrentQuestionReviewed?: boolean
  onBackToSelection?: () => void
}

export function QuizHeader({
  mode,
  examNumber,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  answeredCount,
  isCurrentQuestionReviewed,
  onBackToSelection
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTitle = () => {
    switch (mode) {
      case 'test':
        return 'Life in the UK Test'
      case 'individual':
        return `Exam ${examNumber} - Practice Mode`
      case 'practice':
        return 'Practice Mode'
      default:
        return 'Quiz'
    }
  }

  const getModeInfo = () => {
    switch (mode) {
      case 'test':
        return (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Test Mode: 45 minutes • 24 random questions • Official exam conditions</span>
            </div>
          </div>
        )
      case 'individual':
        return (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Individual Exam: No time limit • All questions from exam {examNumber} • Practice specific exam</span>
            </div>
          </div>
        )
      case 'practice':
        return (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Practice Mode: No time limit • All {totalQuestions} questions available • Instant feedback</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {totalQuestions}
            {isCurrentQuestionReviewed && (
              <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-800 text-sm rounded">
                📋 Marked for Review
              </span>
            )}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
          {timeLeft !== undefined && (
            <div className="text-lg font-medium text-gray-600">
              Time remaining: {formatTime(timeLeft)}
            </div>
          )}
          
          {answeredCount !== undefined && (
            <div className="text-lg font-medium text-gray-600">
              {answeredCount} of {totalQuestions} questions answered
            </div>
          )}
          
          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to {mode === 'individual' ? 'Exam Selection' : 'Main Menu'}
            </button>
          )}
        </div>
      </div>

      {getModeInfo()}
    </div>
  )
}
