'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
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

interface QuestionData extends Question {
  answers: Answer[]
  isMultipleChoice: boolean
}

type QuestionStatus = 'unanswered' | 'correct' | 'incorrect' | 'review' | 'current'

export default function PracticePage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number[] }>({})
  const [questionStatuses, setQuestionStatuses] = useState<{ [key: number]: QuestionStatus }>({})
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(new Set())
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load questions and answers from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, answersResponse] = await Promise.all([
          fetch(getAssetUrl('questions.csv')),
          fetch(getAssetUrl('answers.csv'))
        ])

        if (!questionsResponse.ok || !answersResponse.ok) {
          throw new Error('Failed to load test data')
        }

        const questionsText = await questionsResponse.text()
        const answersText = await answersResponse.text()

        const questionsData = Papa.parse<Question>(questionsText, {
          header: true,
          skipEmptyLines: true
        }).data

        const answersData = Papa.parse<Answer>(answersText, {
          header: true,
          skipEmptyLines: true
        }).data

        // Group answers by question
        const questionMap = new Map<string, QuestionData>()
        
        questionsData.forEach(q => {
          const key = `${q.examNumber}-${q.questionNumber}`
          questionMap.set(key, { ...q, answers: [], isMultipleChoice: false })
        })

        answersData.forEach(a => {
          const key = `${a.examNumber}-${a.questionNumber}`
          const question = questionMap.get(key)
          if (question) {
            question.answers.push(a)
          }
        })

        // Determine if each question is multiple choice (has more than one correct answer)
        questionMap.forEach(question => {
          const correctAnswers = question.answers.filter(a => a.isCorrect === 'yes')
          question.isMultipleChoice = correctAnswers.length > 1
        })

        // Use ALL questions for practice mode with randomization
        const allQuestions = Array.from(questionMap.values())
        // Shuffle questions for better learning experience
        allQuestions.sort(() => Math.random() - 0.5)
        
        // Also shuffle answers within each question for better practice
        allQuestions.forEach(question => {
          question.answers.sort(() => Math.random() - 0.5)
        })

        setQuestions(allQuestions)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test data')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAnswerSelect = (answerNumber: number) => {
    if (!showResult) {
      const currentQuestion = questions[currentQuestionIndex]
      
      if (currentQuestion.isMultipleChoice) {
        // Multiple choice: toggle selection
        setSelectedAnswers(prev => {
          const currentSelections = prev[currentQuestionIndex] || []
          const isSelected = currentSelections.includes(answerNumber)
          
          if (isSelected) {
            // Remove from selection
            return {
              ...prev,
              [currentQuestionIndex]: currentSelections.filter(num => num !== answerNumber)
            }
          } else {
            // Add to selection
            return {
              ...prev,
              [currentQuestionIndex]: [...currentSelections, answerNumber]
            }
          }
        })
      } else {
        // Single choice: replace selection
        setSelectedAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: [answerNumber]
        }))
      }
    }
  }

  const checkAnswer = () => {
    const selectedAnswerNumbers = selectedAnswers[currentQuestionIndex] || []
    if (selectedAnswerNumbers.length === 0) {
      alert('Please select an answer before checking.')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const correctAnswerNumbers = currentQuestion.answers
      .filter(a => a.isCorrect === 'yes')
      .map(a => a.answerNumber)

    // Check if selected answers match correct answers exactly
    const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
      selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
      correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestionIndex]: isCorrect ? 'correct' : 'incorrect'
    }))

    // Remove from review list if it was there
    setReviewedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentQuestionIndex)
      return newSet
    })

    setShowResult(true)
  }

  const markForReview = () => {
    // Only allow marking for review if the question hasn't been checked yet
    if (!showResult && questionStatuses[currentQuestionIndex] !== 'correct' && questionStatuses[currentQuestionIndex] !== 'incorrect') {
      setReviewedQuestions(prev => new Set(prev).add(currentQuestionIndex))
      
      // Move to next question automatically after marking for review
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setShowResult(false)
      }
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowResult(false)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowResult(false)
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowResult(false)
    }
  }

  const getQuestionStatus = (index: number): string => {
    if (index === currentQuestionIndex) return 'current'
    const status = questionStatuses[index]
    if (status === 'correct') return 'correct'
    if (status === 'incorrect') return 'incorrect'
    if (reviewedQuestions.has(index)) return 'review'
    if (selectedAnswers[index] && selectedAnswers[index].length > 0) return 'answered'
    return 'unanswered'
  }

  const getCurrentQuestionResult = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswerNumbers = selectedAnswers[currentQuestionIndex] || []
    const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect === 'yes')
    const correctAnswerNumbers = correctAnswers.map(a => a.answerNumber)

    const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
      selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
      correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

    return {
      isCorrect,
      correctAnswers,
      selectedAnswerNumbers
    }
  }

  const finishPractice = () => {
    // Calculate results for all answered questions
    const results = questions.map((question, index) => {
      const selectedAnswerNumbers = selectedAnswers[index] || []
      const correctAnswers = question.answers.filter(a => a.isCorrect === 'yes')
      const correctAnswerNumbers = correctAnswers.map(a => a.answerNumber)
      
      // Only calculate result if question was answered
      const wasAnswered = selectedAnswerNumbers.length > 0 || questionStatuses[index] === 'correct' || questionStatuses[index] === 'incorrect'
      
      const isCorrect = wasAnswered && selectedAnswerNumbers.length === correctAnswerNumbers.length &&
        selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
        correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

      const userAnswerTexts = selectedAnswerNumbers.map(num => 
        question.answers.find(a => a.answerNumber === num)?.answer || ''
      ).filter(text => text)

      const correctAnswerTexts = correctAnswers.map(a => a.answer)

      return {
        questionIndex: index,
        examNumber: question.examNumber,
        questionNumber: question.questionNumber,
        question: question.question,
        reference: question.reference,
        selectedAnswers: selectedAnswerNumbers,
        correctAnswers: correctAnswerNumbers,
        isCorrect,
        wasAnswered,
        userAnswerTexts,
        correctAnswerTexts
      }
    }).filter(result => result.wasAnswered) // Only include answered questions in results

    // Store results in sessionStorage to avoid URL length issues
    const resultsId = Date.now().toString()
    sessionStorage.setItem(`practice-results-${resultsId}`, JSON.stringify(results))
    
    // Navigate to results page with just the ID
    router.push(`/results?id=${resultsId}&mode=practice`)
  }

  const getAnsweredQuestionsCount = () => {
    return questions.filter((_, index) => 
      questionStatuses[index] === 'correct' || 
      questionStatuses[index] === 'incorrect' || 
      (selectedAnswers[index] && selectedAnswers[index].length > 0)
    ).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading practice questions...</p>
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

  const currentQuestion = questions[currentQuestionIndex]
  const result = showResult ? getCurrentQuestionResult() : null
  const selectedAnswerNumbers = selectedAnswers[currentQuestionIndex] || []
  const isCurrentQuestionReviewed = reviewedQuestions.has(currentQuestionIndex)
  const canMarkForReview = !showResult && questionStatuses[currentQuestionIndex] !== 'correct' && questionStatuses[currentQuestionIndex] !== 'incorrect'
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredCount = getAnsweredQuestionsCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Practice Mode</h1>
            <div className="text-lg font-medium text-gray-600">
              {answeredCount} of {questions.length} questions answered
            </div>
          </div>

          {/* Question Navigation Grid - Show all questions with pagination */}
          <div className="mb-4">
            {/* Show questions in rows of 20 */}
            {Array.from({ length: Math.ceil(questions.length / 20) }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-20 gap-1 mb-2">
                {questions.slice(rowIndex * 20, (rowIndex + 1) * 20).map((_, index) => {
                  const actualIndex = rowIndex * 20 + index
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => goToQuestion(actualIndex)}
                      className={`w-8 h-8 text-xs rounded border-2 font-medium transition-all duration-200 ${
                        getQuestionStatus(actualIndex) === 'current'
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : getQuestionStatus(actualIndex) === 'correct'
                          ? 'border-success-500 bg-success-500 text-white'
                          : getQuestionStatus(actualIndex) === 'incorrect'
                          ? 'border-danger-500 bg-danger-500 text-white'
                          : getQuestionStatus(actualIndex) === 'review'
                          ? 'border-warning-500 bg-warning-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-500 hover:text-primary-600'
                      }`}
                    >
                      {actualIndex + 1}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success-500 rounded"></div>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning-500 rounded"></div>
              <span>Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger-500 rounded"></div>
              <span>Incorrect</span>
            </div>
          </div>

          {/* Practice Mode Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Practice Mode: No time limit • All {questions.length} questions available • Instant feedback</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="progress-indicator">
              Question {currentQuestionIndex + 1} of {questions.length}
              {isCurrentQuestionReviewed && (
                <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-800 text-sm rounded">
                  📋 Marked for Review
                </span>
              )}
            </div>
            <button className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.5-3.5a1 1 0 010-1.552l4.5-3.5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M14.383 3.076A1 1 0 0115 4v12a1 1 0 01-1.617.776l-4.5-3.5a1 1 0 010-1.552l4.5-3.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {currentQuestion?.question}
          </h2>

          {/* Multiple choice indicator */}
          {currentQuestion?.isMultipleChoice && (
            <p className="text-sm text-blue-600 font-medium mb-4">
              📋 Select TWO answers for this question
            </p>
          )}

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion?.answers.map((answer) => {
              const isSelected = selectedAnswerNumbers.includes(answer.answerNumber)
              const isCorrect = answer.isCorrect === 'yes'
              
              let optionClass = 'answer-option force-dark-text'
              
              if (showResult) {
                if (isCorrect) {
                  optionClass += ' border-success-500 bg-success-50'
                } else if (isSelected) {
                  optionClass += ' border-danger-500 bg-danger-50'
                }
              } else if (isSelected) {
                optionClass += ' selected'
              }

              return (
                <button
                  key={answer.answerNumber}
                  onClick={() => handleAnswerSelect(answer.answerNumber)}
                  className={optionClass}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 ${
                      showResult
                        ? isCorrect
                          ? 'border-success-500 bg-success-500'
                          : isSelected
                          ? 'border-danger-500 bg-danger-500'
                          : 'border-gray-300'
                        : isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {(isSelected || (showResult && isCorrect)) && (
                        <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`${showResult && isCorrect ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>{answer.answer}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result Display */}
          {showResult && result && (
            <div className={`p-4 rounded-lg mb-6 ${
              result.isCorrect ? 'bg-success-50 border border-success-200' : 'bg-danger-50 border border-danger-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.isCorrect ? (
                  <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`font-semibold ${result.isCorrect ? 'text-success-800' : 'text-danger-800'}`}>
                  {result.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              
              {!result.isCorrect && (
                <div className="text-danger-700 mb-2">
                  <p className="font-medium">The correct answer{result.correctAnswers.length > 1 ? 's are' : ' is'}:</p>
                  <ul className="list-disc list-inside ml-4">
                    {result.correctAnswers.map(answer => (
                      <li key={answer.answerNumber}><strong>{answer.answer}</strong></li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentQuestion.reference && (
                <div className="text-sm text-gray-700">
                  <strong>Explanation:</strong> {currentQuestion.reference}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button 
                onClick={markForReview}
                disabled={!canMarkForReview}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  canMarkForReview
                    ? 'bg-warning-500 text-white hover:bg-warning-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!canMarkForReview ? 'Cannot mark reviewed or checked questions' : 'Mark this question for review'}
              >
                {isCurrentQuestionReviewed ? 'Reviewed' : 'Review'}
              </button>

              {answeredCount > 0 && (
                <button
                  onClick={finishPractice}
                  className="bg-success-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-success-700"
                >
                  Finish Practice
                </button>
              )}
            </div>

            {showResult ? (
              <button
                onClick={nextQuestion}
                disabled={isLastQuestion}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastQuestion ? 'Last Question' : 'Next Question'}
              </button>
            ) : (
              <button
                onClick={checkAnswer}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700"
              >
                Check
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
