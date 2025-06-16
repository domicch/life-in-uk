'use client'

import { QuestionStatus } from './types'

interface QuestionGridProps {
  questions: any[]
  currentQuestionIndex: number
  getQuestionStatus: (index: number) => QuestionStatus
  onQuestionClick: (index: number) => void
  mode: 'practice' | 'test' | 'individual'
}

export function QuestionGrid({ 
  questions, 
  currentQuestionIndex, 
  getQuestionStatus, 
  onQuestionClick,
  mode 
}: QuestionGridProps) {
  const getStatusClass = (status: QuestionStatus) => {
    switch (status) {
      case 'current':
        return 'border-primary-600 bg-primary-600 text-white'
      case 'correct':
        return 'border-success-500 bg-success-500 text-white'
      case 'incorrect':
        return 'border-danger-500 bg-danger-500 text-white'
      case 'review':
        return 'border-warning-500 bg-warning-500 text-white'
      default:
        return 'border-gray-300 bg-white text-gray-700 hover:border-primary-500 hover:text-primary-600'
    }
  }

  // For practice mode, show all questions in rows of 20
  if (mode === 'practice') {
    return (
      <div className="mb-4">
        {Array.from({ length: Math.ceil(questions.length / 20) }, (_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-20 gap-1 mb-2">
            {questions.slice(rowIndex * 20, (rowIndex + 1) * 20).map((_, index) => {
              const actualIndex = rowIndex * 20 + index
              return (
                <button
                  key={actualIndex}
                  onClick={() => onQuestionClick(actualIndex)}
                  className={`w-8 h-8 text-xs rounded border-2 font-medium transition-all duration-200 ${
                    getStatusClass(getQuestionStatus(actualIndex))
                  }`}
                >
                  {actualIndex + 1}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // For test and individual modes, show questions in a responsive grid
  return (
    <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 gap-2 mb-4">
      {questions.map((_, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(index)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            getStatusClass(getQuestionStatus(index))
          }`}
          title={`Question ${index + 1} - ${getQuestionStatus(index).charAt(0).toUpperCase() + getQuestionStatus(index).slice(1)}`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  )
}

interface QuestionStatusLegendProps {
  mode: 'practice' | 'test' | 'individual'
}

export function QuestionStatusLegend({ mode }: QuestionStatusLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span className="text-gray-600">Current</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <span className="text-gray-600">Correct</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded"></div>
        <span className="text-gray-600">Incorrect</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
        <span className="text-gray-600">Review</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
        <span className="text-gray-600">Unanswered</span>
      </div>
    </div>
  )
}
