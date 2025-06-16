'use client'

import { useRouter } from 'next/navigation'
import { QuizConfig } from './types'
import { useQuizData } from './useQuizData'
import { QuizHeader } from './QuizHeader'
import { QuestionGrid, QuestionStatusLegend } from './QuestionGrid'
import { QuestionDisplay } from './QuestionDisplay'
import { QuizNavigation } from './QuizNavigation'

interface QuizContainerProps {
  config: QuizConfig
  onBackToSelection?: () => void
}

export function QuizContainer({ config, onBackToSelection }: QuizContainerProps) {
  const router = useRouter()
  const { state, actions, getters } = useQuizData(config)

  const handleFinish = () => {
    const finishResult = actions.finishQuiz()
    
    // Store results in sessionStorage
    const resultsId = Date.now().toString()
    const storageKey = `${config.mode}-results-${resultsId}`
    sessionStorage.setItem(storageKey, JSON.stringify(finishResult.results))
    
    // Navigate to results page
    const params = new URLSearchParams({
      id: resultsId,
      mode: config.mode
    })
    
    if (config.examNumber) {
      params.set('exam', config.examNumber.toString())
    }
    
    router.push(`/results?${params.toString()}`)
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">
            Loading {config.mode === 'individual' ? `exam ${config.examNumber}` : `${config.mode} questions`}...
          </p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error: {state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 mr-4"
          >
            Retry
          </button>
          {onBackToSelection && (
            <button 
              onClick={onBackToSelection}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Back to Selection
            </button>
          )}
        </div>
      </div>
    )
  }

  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            No questions found{config.examNumber ? ` for exam ${config.examNumber}` : ''}
          </p>
          {onBackToSelection && (
            <button 
              onClick={onBackToSelection}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Back to Selection
            </button>
          )}
        </div>
      </div>
    )
  }

  const currentQuestion = getters.getCurrentQuestion()
  const result = getters.getCurrentResult()
  const selectedAnswers = state.selectedAnswers[state.currentQuestionIndex] || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <QuizHeader
            mode={config.mode}
            examNumber={config.examNumber}
            currentQuestionIndex={state.currentQuestionIndex}
            totalQuestions={state.questions.length}
            timeLeft={state.timeLeft}
            answeredCount={config.mode === 'practice' ? getters.getAnsweredCount() : undefined}
            isCurrentQuestionReviewed={getters.isCurrentQuestionReviewed()}
            onBackToSelection={onBackToSelection}
          />

          {/* Question Status Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Question Status</span>
              <span>
                {getters.getAnsweredCount()} of {state.questions.length} answered
              </span>
            </div>
            
            <QuestionGrid
              questions={state.questions}
              currentQuestionIndex={state.currentQuestionIndex}
              getQuestionStatus={getters.getQuestionStatus}
              onQuestionClick={actions.goToQuestion}
              mode={config.mode}
            />
            
            <QuestionStatusLegend mode={config.mode} />
            
            {/* Test completion status */}
            {config.mode === 'test' && getters.isComplete() && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">All questions answered! You can now finish the test.</span>
                </div>
              </div>
            )}

            {/* Practice finish option */}
            {config.mode === 'practice' && getters.getAnsweredCount() > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleFinish}
                  className="bg-success-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-success-700"
                >
                  Finish Practice ({getters.getAnsweredCount()} questions answered)
                </button>
              </div>
            )}
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswers={selectedAnswers}
              showResult={state.showResult}
              result={result}
              onAnswerSelect={actions.selectAnswer}
            />

            {/* Navigation */}
            <QuizNavigation
              currentQuestionIndex={state.currentQuestionIndex}
              totalQuestions={state.questions.length}
              showResult={state.showResult}
              canMarkForReview={getters.canMarkForReview()}
              isCurrentQuestionReviewed={getters.isCurrentQuestionReviewed()}
              isLastQuestion={state.currentQuestionIndex === state.questions.length - 1}
              isComplete={getters.isComplete()}
              onPrevious={actions.previousQuestion}
              onNext={actions.nextQuestion}
              onCheck={actions.checkAnswer}
              onMarkForReview={actions.markForReview}
              onFinish={handleFinish}
              mode={config.mode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
