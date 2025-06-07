'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'

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

type QuestionStatus = 'unanswered' | 'correct' | 'incorrect' | 'current'

export default function TestPage() {
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number[] }>({})
  const [questionStatuses, setQuestionStatuses] = useState<{ [key: number]: QuestionStatus }>({})
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load questions and answers from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, answersResponse] = await Promise.all([
          fetch('/questions.csv'),
          fetch('/answers.csv')
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

        // Convert to array and shuffle for random test
        const allQuestions = Array.from(questionMap.values())
        const shuffled = allQuestions.sort(() => Math.random() - 0.5)
        const testQuestions = shuffled.slice(0, 24)

        setQuestions(testQuestions)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test data')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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

    setShowResult(true)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading test questions...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Life in the UK Test</h1>
            <div className="timer">
              Time limit: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="question-grid mb-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`question-button ${getQuestionStatus(index)}`}
              >
                {index + 1}
              </button>
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
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="progress-indicator">
              Question {currentQuestionIndex + 1} of {questions.length}
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
              
              let optionClass = 'answer-option'
              
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
                    <div className={`w-5 h-5 ${currentQuestion.isMultipleChoice ? 'rounded' : 'rounded'} border-2 ${
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
                    <span className={showResult && isCorrect ? 'font-semibold' : ''}>{answer.answer}</span>
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

            <button className="bg-warning-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-warning-600">
              Review
            </button>

            {showResult ? (
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
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
