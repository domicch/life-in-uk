'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Papa from 'papaparse'
import Link from 'next/link'
import { getAssetUrl } from '../../utils/assets'

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

export default function IndividualTestClient({ params }: { params: { examNumber: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examNumber = parseInt(params.examNumber)
  const isPracticeMode = searchParams.get('mode') === 'practice'
  
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number[] }>({})
  const [questionStatuses, setQuestionStatuses] = useState<{ [key: number]: QuestionStatus }>({})
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(new Set())
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes for test mode
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load questions for specific exam
  useEffect(() => {
    const loadExamData = async () => {
      try {
        const [questionsResponse, answersResponse] = await Promise.all([
          fetch(getAssetUrl('questions.csv')),
          fetch(getAssetUrl('answers.csv'))
        ])

        if (!questionsResponse.ok || !answersResponse.ok) {
          throw new Error('Failed to load exam data')
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

        // Filter questions for this specific exam
        const examQuestions = questionsData.filter(q => {
          const qExamNumber = parseInt(q.examNumber?.toString() || '0')
          return qExamNumber === examNumber
        })
        
        console.log(`Looking for exam ${examNumber}`);
        console.log(`Found ${examQuestions.length} questions for exam ${examNumber}`);
        console.log(`Sample questions data:`, questionsData.slice(0, 3).map(q => ({ examNumber: q.examNumber, type: typeof q.examNumber })));
        
        if (examQuestions.length === 0) {
          const availableExams = Array.from(new Set(questionsData.map(q => parseInt(q.examNumber?.toString() || '0'))))
            .filter(num => num > 0)
            .sort()
          throw new Error(`No questions found for Exam ${examNumber}. Available exams: ${availableExams.join(', ')}`)
        }

        // Group answers by question
        const questionMap = new Map<string, QuestionData>()
        
        examQuestions.forEach(q => {
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

        // Determine if each question is multiple choice
        questionMap.forEach(question => {
          const correctAnswers = question.answers.filter(a => a.isCorrect === 'yes')
          question.isMultipleChoice = correctAnswers.length > 1
        })

        // Convert to array and sort by question number
        const sortedQuestions = Array.from(questionMap.values())
          .sort((a, b) => a.questionNumber - b.questionNumber)

        // Shuffle answers within each question
        sortedQuestions.forEach(question => {
          question.answers.sort(() => Math.random() - 0.5)
        })

        setQuestions(sortedQuestions)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam data')
        setLoading(false)
      }
    }

    loadExamData()
  }, [examNumber])

  // Timer countdown (only in test mode)
  useEffect(() => {
    if (!isPracticeMode && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isPracticeMode])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answerNumber: number) => {
    if (!showResult) {
      const currentQuestion = questions[currentQuestionIndex]
      
      if (currentQuestion.isMultipleChoice) {
        setSelectedAnswers(prev => {
          const currentSelections = prev[currentQuestionIndex] || []
          const isSelected = currentSelections.includes(answerNumber)
          
          if (isSelected) {
            return {
              ...prev,
              [currentQuestionIndex]: currentSelections.filter(num => num !== answerNumber)
            }
          } else {
            return {
              ...prev,
              [currentQuestionIndex]: [...currentSelections, answerNumber]
            }
          }
        })
      } else {
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

    const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
      selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
      correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestionIndex]: isCorrect ? 'correct' : 'incorrect'
    }))

    setReviewedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentQuestionIndex)
      return newSet
    })

    setShowResult(true)
  }

  const markForReview = () => {
    if (!showResult && questionStatuses[currentQuestionIndex] !== 'correct' && questionStatuses[currentQuestionIndex] !== 'incorrect') {
      setReviewedQuestions(prev => new Set(prev).add(currentQuestionIndex))
      
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

  const finishExam = () => {
    const results = questions.map((question, index) => {
      const selectedAnswerNumbers = selectedAnswers[index] || []
      const correctAnswers = question.answers.filter(a => a.isCorrect === 'yes')
      const correctAnswerNumbers = correctAnswers.map(a => a.answerNumber)
      
      // For practice mode, only include answered questions
      const wasAnswered = selectedAnswerNumbers.length > 0 || questionStatuses[index] === 'correct' || questionStatuses[index] === 'incorrect'
      
      if (isPracticeMode && !wasAnswered) {
        return null
      }
      
      const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
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
        userAnswerTexts,
        correctAnswerTexts
      }
    }).filter(result => result !== null)

    const resultsId = Date.now().toString()
    const storageKey = `individual-results-${resultsId}`
    sessionStorage.setItem(storageKey, JSON.stringify(results))
    
    const mode = isPracticeMode ? 'practice' : 'test'
    router.push(`/results?id=${resultsId}&mode=individual&examNumber=${examNumber}&originalMode=${mode}`)
  }

  const isTestComplete = () => {
    return questions.every((_, index) => 
      questionStatuses[index] === 'correct' || 
      questionStatuses[index] === 'incorrect' || 
      (selectedAnswers[index] && selectedAnswers[index].length > 0)
    )
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
          <p className="text-xl text-gray-600">Loading Exam {examNumber}...</p>
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
            href="/individual"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Back to Exam Selection
          </Link>
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
  const testComplete = isPracticeMode ? getAnsweredQuestionsCount() > 0 : isTestComplete()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Exam {examNumber} {isPracticeMode ? '- Practice Mode' : '- Test Mode'}
              </h1>
              <Link 
                href="/individual"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                ← Back to Exam Selection
              </Link>
            </div>
            <div className="text-right">
              {!isPracticeMode ? (
                <div className="timer">
                  Time limit: {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="text-lg font-medium text-gray-600">
                  {getAnsweredQuestionsCount()} of {questions.length} answered
                </div>
              )}
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

          {/* Completion Status */}
          {testComplete && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  {isPracticeMode 
                    ? 'You can finish practice anytime to see results.'
                    : 'All questions answered! You can now finish the exam.'
                  }
                </span>
              </div>
            </div>
          )}
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

              {testComplete && (
                <button
                  onClick={finishExam}
                  className="bg-success-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-success-700"
                >
                  Finish Exam
                </button>
              )}
            </div>

            {showResult ? (
              isLastQuestion ? (
                <button
                  onClick={finishExam}
                  className="bg-success-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-success-700"
                >
                  Finish Exam
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700"
                >
                  Next Question
                </button>
              )
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
