'use client'

interface QuizNavigationProps {
  currentQuestionIndex: number
  totalQuestions: number
  showResult: boolean
  canMarkForReview: boolean
  isCurrentQuestionReviewed: boolean
  isLastQuestion: boolean
  isComplete?: boolean
  onPrevious: () => void
  onNext: () => void
  onCheck: () => void
  onMarkForReview: () => void
  onFinish: () => void
  mode: 'practice' | 'test' | 'individual'
}

export function QuizNavigation({
  currentQuestionIndex,
  totalQuestions,
  showResult,
  canMarkForReview,
  isCurrentQuestionReviewed,
  isLastQuestion,
  isComplete = false,
  onPrevious,
  onNext,
  onCheck,
  onMarkForReview,
  onFinish,
  mode
}: QuizNavigationProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
      <button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className="bg-gray-300 text-gray-700 px-4 sm:px-8 py-3 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed order-1"
      >
        Previous
      </button>

      <button 
        onClick={onMarkForReview}
        disabled={!canMarkForReview}
        className={`px-4 sm:px-8 py-3 rounded-lg font-medium transition-colors order-2 ${
          canMarkForReview
            ? 'bg-warning-500 text-white hover:bg-warning-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={!canMarkForReview ? 'Cannot mark reviewed or checked questions' : 'Mark this question for review'}
      >
        {isCurrentQuestionReviewed ? 'Reviewed' : 'Review'}
      </button>

      {showResult ? (
        isLastQuestion ? (
          <button
            onClick={onFinish}
            className="bg-success-600 text-white px-4 sm:px-8 py-3 rounded-lg font-medium hover:bg-success-700 order-3"
          >
            Finish {mode === 'test' ? 'Test' : mode === 'individual' ? 'Exam' : 'Practice'}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="bg-primary-600 text-white px-4 sm:px-8 py-3 rounded-lg font-medium hover:bg-primary-700 order-3"
          >
            Next
          </button>
        )
      ) : (
        isLastQuestion && isComplete ? (
          <button
            onClick={onFinish}
            className="bg-success-600 text-white px-4 sm:px-8 py-3 rounded-lg font-medium hover:bg-success-700 order-3"
          >
            Finish {mode === 'test' ? 'Test' : mode === 'individual' ? 'Exam' : 'Practice'}
          </button>
        ) : (
          <button
            onClick={onCheck}
            className="bg-primary-600 text-white px-4 sm:px-8 py-3 rounded-lg font-medium hover:bg-primary-700 order-3"
          >
            Check
          </button>
        )
      )}
    </div>
  )
}
