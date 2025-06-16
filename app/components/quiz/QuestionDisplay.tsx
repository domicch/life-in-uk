'use client'

import { QuestionData, Answer } from './types'

interface QuestionDisplayProps {
  question: QuestionData
  selectedAnswers: number[]
  showResult: boolean
  result?: {
    isCorrect: boolean
    correctAnswers: Answer[]
    selectedAnswerNumbers: number[]
  } | null
  onAnswerSelect: (answerNumber: number) => void
}

export function QuestionDisplay({
  question,
  selectedAnswers,
  showResult,
  result,
  onAnswerSelect
}: QuestionDisplayProps) {
  if (!question) return null

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
        {question.question}
      </h2>

      {question.isMultipleChoice && (
        <p className="text-sm text-blue-600 font-medium mb-4">
          📝 Select all correct answers (multiple choice question)
        </p>
      )}

      {/* Answer Options */}
      <div className="space-y-3 mb-8">
        {question.answers.map(answer => {
          const answerId = parseInt(answer.answerNumber?.toString() || '0')
          const isSelected = selectedAnswers.includes(answerId)
          const isCorrect = answer.isCorrect && (answer.isCorrect.toLowerCase() === 'true' || answer.isCorrect.toLowerCase() === 'yes')
          
          let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 "
          
          if (showResult) {
            if (isSelected && isCorrect) {
              buttonClass += "bg-success-100 border-success-500 text-success-800"
            } else if (isSelected && !isCorrect) {
              buttonClass += "bg-danger-100 border-danger-500 text-danger-800"
            } else if (!isSelected && isCorrect) {
              buttonClass += "bg-success-50 border-success-300 text-success-700"
            } else {
              buttonClass += "bg-gray-50 border-gray-200 text-gray-700"
            }
          } else {
            if (isSelected) {
              buttonClass += "bg-primary-100 border-primary-500 text-primary-800"
            } else {
              buttonClass += "bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
            }
          }

          return (
            <button
              key={answerId}
              onClick={() => onAnswerSelect(answerId)}
              className={buttonClass}
              disabled={showResult}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 mr-3 rounded border-2 flex items-center justify-center ${
                  question.isMultipleChoice ? 'rounded' : 'rounded-full'
                } ${
                  isSelected 
                    ? showResult 
                      ? isCorrect 
                        ? 'bg-success-500 border-success-500' 
                        : 'bg-danger-500 border-danger-500'
                      : 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{answer.answer}</span>
                {showResult && !isSelected && isCorrect && (
                  <span className="ml-auto text-success-600 font-semibold">✓ Correct</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Result Display */}
      {showResult && result && (
        <div className={`mb-6 p-4 rounded-lg ${
          result.isCorrect ? 'bg-success-100 border border-success-300' : 'bg-danger-100 border border-danger-300'
        }`}>
          <div className="flex items-center mb-3">
            {result.isCorrect ? (
              <svg className="w-6 h-6 text-success-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-danger-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`font-semibold ${result.isCorrect ? 'text-success-800' : 'text-danger-800'}`}>
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          
          <div className="text-gray-700 mb-2">
            <p className="font-medium">The correct answer{result.correctAnswers.length > 1 ? 's are' : ' is'}:</p>
            <ul className="list-disc list-inside ml-4">
              {result.correctAnswers.map(answer => (
                <li key={answer.answerNumber} className="text-green-700">
                  <strong>{answer.answer}</strong>
                </li>
              ))}
            </ul>
            {!result.isCorrect && (
              <div className="mt-2">
                <p className="font-medium text-red-700">Your answer{result.selectedAnswerNumbers.length > 1 ? 's were' : ' was'}:</p>
                <ul className="list-disc list-inside ml-4">
                  {result.selectedAnswerNumbers.map(answerId => {
                    const userAnswer = question.answers.find(a => parseInt(a.answerNumber?.toString() || '0') === answerId)
                    return userAnswer ? (
                      <li key={answerId} className="text-red-700">
                        <strong>{userAnswer.answer}</strong>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            )}
          </div>
          
          {question.reference && (
            <div className="text-sm text-gray-700">
              <strong>Explanation:</strong> {question.reference}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
