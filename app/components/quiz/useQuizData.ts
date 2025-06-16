import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import { getAssetUrl } from '../../utils/assets'
import { QuizAnalytics } from '../../utils/analytics'
import { QuestionData, QuizConfig, QuizState, QuestionStatus } from './types'

export function useQuizData(config: QuizConfig) {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswers: {},
    questionStatuses: {},
    reviewedQuestions: new Set(),
    showResult: false,
    timeLeft: config.timeLimit,
    loading: true,
    error: null
  })

  const sessionStartTime = useRef<number>(Date.now())
  const questionStartTime = useRef<number>(Date.now())
  const hasTrackedStart = useRef<boolean>(false)

  // Load questions and answers from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, answersResponse] = await Promise.all([
          fetch(getAssetUrl('questions.csv')),
          fetch(getAssetUrl('answers.csv'))
        ])

        if (!questionsResponse.ok || !answersResponse.ok) {
          throw new Error('Failed to load quiz data')
        }

        const questionsText = await questionsResponse.text()
        const answersText = await answersResponse.text()

        const questionsData = Papa.parse<any>(questionsText, {
          header: true,
          skipEmptyLines: true
        }).data

        const answersData = Papa.parse<any>(answersText, {
          header: true,
          skipEmptyLines: true
        }).data

        // Group answers by question
        const questionMap = new Map<string, QuestionData>()
        
        // Filter questions based on config
        questionsData.forEach((q: any) => {
          if (q.question && q.question.trim().length > 0) {
            // Filter by exam number if specified
            if (config.examNumber && parseInt(q.examNumber) !== config.examNumber) {
              return
            }
            
            const key = `${q.examNumber}-${q.questionNumber}`
            questionMap.set(key, { 
              ...q, 
              examNumber: parseInt(q.examNumber),
              questionNumber: parseInt(q.questionNumber),
              answers: [], 
              isMultipleChoice: false 
            })
          }
        })

        answersData.forEach((a: any) => {
          const key = `${a.examNumber}-${a.questionNumber}`
          const question = questionMap.get(key)
          if (question && a.answer && a.answer.trim().length > 0) {
            question.answers.push({
              ...a,
              examNumber: parseInt(a.examNumber),
              questionNumber: parseInt(a.questionNumber),
              answerNumber: parseInt(a.answerNumber)
            })
          }
        })

        // Determine if each question is multiple choice and filter valid questions
        const validQuestions = Array.from(questionMap.values())
          .filter(question => {
            const hasValidAnswers = question.answers.length > 0
            const correctAnswers = question.answers.filter(a => 
              a.isCorrect && (a.isCorrect.toLowerCase() === 'true' || a.isCorrect.toLowerCase() === 'yes')
            )
            const hasCorrectAnswer = correctAnswers.length > 0
            
            // Set multiple choice flag
            question.isMultipleChoice = correctAnswers.length > 1
            
            return hasValidAnswers && hasCorrectAnswer
          })

        if (validQuestions.length === 0) {
          throw new Error('No valid questions found after filtering')
        }

        // Apply question limit and shuffling
        let finalQuestions = validQuestions
        
        if (config.shuffleQuestions) {
          finalQuestions = [...finalQuestions].sort(() => Math.random() - 0.5)
        }
        
        if (config.maxQuestions && finalQuestions.length > config.maxQuestions) {
          finalQuestions = finalQuestions.slice(0, config.maxQuestions)
        }
        
        // Shuffle answers if configured
        if (config.shuffleAnswers) {
          finalQuestions.forEach(question => {
            question.answers.sort(() => Math.random() - 0.5)
          })
        }

        // Track quiz start
        if (!hasTrackedStart.current && finalQuestions.length > 0) {
          QuizAnalytics.trackQuizStart(config.mode, finalQuestions.length)
          hasTrackedStart.current = true
        }

        setState(prev => ({
          ...prev,
          questions: finalQuestions,
          loading: false,
          currentQuestionIndex: Math.min(prev.currentQuestionIndex, finalQuestions.length - 1)
        }))

      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load quiz data',
          loading: false
        }))
      }
    }

    loadData()
  }, [config.examNumber, config.maxQuestions, config.shuffleQuestions, config.shuffleAnswers, config.mode])

  // Track question timing when question changes
  useEffect(() => {
    questionStartTime.current = Date.now()
  }, [state.currentQuestionIndex])

  // Timer countdown for test mode
  useEffect(() => {
    if (config.timeLimit && state.timeLeft && state.timeLeft > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft ? prev.timeLeft - 1 : 0
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.timeLeft, config.timeLimit])

  const actions = {
    selectAnswer: (answerNumber: number) => {
      if (state.showResult) return

      const currentQuestion = state.questions[state.currentQuestionIndex]
      if (!currentQuestion) return

      setState(prev => {
        const currentSelections = prev.selectedAnswers[prev.currentQuestionIndex] || []
        
        let newSelections: number[]
        if (currentQuestion.isMultipleChoice) {
          // Multiple choice: toggle selection
          const isSelected = currentSelections.includes(answerNumber)
          if (isSelected) {
            newSelections = currentSelections.filter(num => num !== answerNumber)
          } else {
            newSelections = [...currentSelections, answerNumber]
          }
        } else {
          // Single choice: replace selection
          newSelections = [answerNumber]
        }

        return {
          ...prev,
          selectedAnswers: {
            ...prev.selectedAnswers,
            [prev.currentQuestionIndex]: newSelections
          }
        }
      })
    },

    checkAnswer: () => {
      const selectedAnswerNumbers = state.selectedAnswers[state.currentQuestionIndex] || []
      if (selectedAnswerNumbers.length === 0) {
        alert('Please select an answer before checking.')
        return
      }

      const currentQuestion = state.questions[state.currentQuestionIndex]
      if (!currentQuestion) return

      const correctAnswerNumbers = currentQuestion.answers
        .filter(a => a.isCorrect && (a.isCorrect.toLowerCase() === 'true' || a.isCorrect.toLowerCase() === 'yes'))
        .map(a => a.answerNumber)

      const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
        selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
        correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

      // Track analytics
      const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000)
      QuizAnalytics.trackQuestionAnswer({
        examNumber: currentQuestion.examNumber,
        questionNumber: currentQuestion.questionNumber,
        question: currentQuestion.question,
        selectedAnswers: selectedAnswerNumbers,
        correctAnswers: correctAnswerNumbers,
        isCorrect,
        isMultipleChoice: currentQuestion.isMultipleChoice,
        timeSpent,
        mode: config.mode
      })

      setState(prev => {
        const newReviewedQuestions = new Set(prev.reviewedQuestions)
        newReviewedQuestions.delete(prev.currentQuestionIndex)
        
        return {
          ...prev,
          questionStatuses: {
            ...prev.questionStatuses,
            [prev.currentQuestionIndex]: isCorrect ? 'correct' : 'incorrect'
          },
          reviewedQuestions: newReviewedQuestions,
          showResult: true
        }
      })
    },

    markForReview: () => {
      const canMark = !state.showResult && 
        state.questionStatuses[state.currentQuestionIndex] !== 'correct' && 
        state.questionStatuses[state.currentQuestionIndex] !== 'incorrect'
      
      if (!canMark) return

      const currentQuestion = state.questions[state.currentQuestionIndex]
      if (currentQuestion) {
        QuizAnalytics.trackQuestionReview(
          currentQuestion.examNumber, 
          currentQuestion.questionNumber, 
          config.mode
        )
      }

      setState(prev => {
        const newReviewedQuestions = new Set(prev.reviewedQuestions)
        newReviewedQuestions.add(prev.currentQuestionIndex)
        
        return {
          ...prev,
          reviewedQuestions: newReviewedQuestions
        }
      })

      // Auto-advance for practice/test modes
      if (config.mode !== 'individual' && state.currentQuestionIndex < state.questions.length - 1) {
        actions.nextQuestion()
      }
    },

    nextQuestion: () => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        setState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          showResult: false
        }))
      }
    },

    previousQuestion: () => {
      if (state.currentQuestionIndex > 0) {
        setState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1,
          showResult: false
        }))
      }
    },

    goToQuestion: (index: number) => {
      if (index >= 0 && index < state.questions.length) {
        setState(prev => ({
          ...prev,
          currentQuestionIndex: index,
          showResult: false
        }))
      }
    },

    finishQuiz: () => {
      // Calculate results
      const results = state.questions.map((question, index) => {
        const selectedAnswerNumbers = state.selectedAnswers[index] || []
        const correctAnswers = question.answers.filter(a => 
          a.isCorrect && (a.isCorrect.toLowerCase() === 'true' || a.isCorrect.toLowerCase() === 'yes')
        )
        const correctAnswerNumbers = correctAnswers.map(a => a.answerNumber)
        
        const wasAnswered = selectedAnswerNumbers.length > 0 || 
          state.questionStatuses[index] === 'correct' || 
          state.questionStatuses[index] === 'incorrect'
        
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
      })

      // Track completion
      const answeredCount = results.filter(r => config.mode === 'practice' ? r.wasAnswered : r.selectedAnswers.length > 0).length
      const correctCount = results.filter(r => r.isCorrect).length
      const sessionDuration = Math.round((Date.now() - sessionStartTime.current) / 1000)
      
      QuizAnalytics.trackSessionComplete({
        mode: config.mode,
        totalQuestions: state.questions.length,
        questionsAnswered: answeredCount,
        correctAnswers: correctCount,
        sessionDuration,
        completionRate: (answeredCount / state.questions.length) * 100
      })

      return {
        results: config.mode === 'practice' ? results.filter(r => r.wasAnswered) : results,
        summary: {
          totalQuestions: state.questions.length,
          answeredCount,
          correctCount,
          percentage: Math.round((correctCount / answeredCount) * 100) || 0,
          sessionDuration
        }
      }
    }
  }

  const getters = {
    getCurrentQuestion: () => state.questions[state.currentQuestionIndex],
    
    getQuestionStatus: (index: number): QuestionStatus => {
      if (index === state.currentQuestionIndex) return 'current'
      const status = state.questionStatuses[index]
      if (status === 'correct') return 'correct'
      if (status === 'incorrect') return 'incorrect'
      if (state.reviewedQuestions.has(index)) return 'review'
      if (state.selectedAnswers[index] && state.selectedAnswers[index].length > 0) return 'unanswered'
      return 'unanswered'
    },

    getCurrentResult: () => {
      if (!state.showResult) return null
      
      const currentQuestion = state.questions[state.currentQuestionIndex]
      if (!currentQuestion) return null
      
      const selectedAnswerNumbers = state.selectedAnswers[state.currentQuestionIndex] || []
      const correctAnswers = currentQuestion.answers.filter(a => 
        a.isCorrect && (a.isCorrect.toLowerCase() === 'true' || a.isCorrect.toLowerCase() === 'yes')
      )
      const correctAnswerNumbers = correctAnswers.map(a => a.answerNumber)

      const isCorrect = selectedAnswerNumbers.length === correctAnswerNumbers.length &&
        selectedAnswerNumbers.every(num => correctAnswerNumbers.includes(num)) &&
        correctAnswerNumbers.every(num => selectedAnswerNumbers.includes(num))

      return {
        isCorrect,
        correctAnswers,
        selectedAnswerNumbers
      }
    },

    getAnsweredCount: () => {
      return state.questions.filter((_, index) => 
        state.questionStatuses[index] === 'correct' || 
        state.questionStatuses[index] === 'incorrect' || 
        (state.selectedAnswers[index] && state.selectedAnswers[index].length > 0)
      ).length
    },

    isComplete: () => {
      return state.questions.every((_, index) => 
        state.questionStatuses[index] === 'correct' || 
        state.questionStatuses[index] === 'incorrect' || 
        (state.selectedAnswers[index] && state.selectedAnswers[index].length > 0)
      )
    },

    canMarkForReview: () => {
      return !state.showResult && 
        state.questionStatuses[state.currentQuestionIndex] !== 'correct' && 
        state.questionStatuses[state.currentQuestionIndex] !== 'incorrect'
    },

    isCurrentQuestionReviewed: () => {
      return state.reviewedQuestions.has(state.currentQuestionIndex)
    }
  }

  return {
    state,
    actions,
    getters,
    config
  }
}
