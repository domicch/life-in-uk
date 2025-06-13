'use client'

// Google Analytics utility for quiz tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

interface QuestionAnalytics {
  examNumber: number
  questionNumber: number
  question: string
  selectedAnswers: number[]
  correctAnswers: number[]
  isCorrect: boolean
  isMultipleChoice: boolean
  timeSpent?: number
  mode: 'practice' | 'test'
}

interface SessionAnalytics {
  mode: 'practice' | 'test'
  totalQuestions: number
  questionsAnswered: number
  correctAnswers: number
  sessionDuration: number
  completionRate: number
}

export class QuizAnalytics {
  private static isGAReady(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function'
  }

  private static hasConsent(): boolean {
    if (typeof window === 'undefined') return false
    const consent = localStorage.getItem('cookie-consent')
    return consent === 'accepted'
  }

  // Track when a question is answered
  static trackQuestionAnswer(data: QuestionAnalytics) {
    if (!this.isGAReady() || !this.hasConsent()) {
      return
    }

    // Track the specific question that was answered wrong
    if (!data.isCorrect) {
      window.gtag('event', 'question_incorrect', {
        event_category: 'quiz_performance',
        event_label: `exam_${data.examNumber}_question_${data.questionNumber}`,
        exam_number: data.examNumber,
        question_number: data.questionNumber,
        question_text: data.question.substring(0, 100), // Truncate for GA limits
        is_multiple_choice: data.isMultipleChoice,
        mode: data.mode,
        selected_answers: data.selectedAnswers.join(','),
        correct_answers: data.correctAnswers.join(','),
        custom_parameter_1: `${data.mode}_incorrect`
      })
    } else {
      // Also track correct answers for comparison
      window.gtag('event', 'question_correct', {
        event_category: 'quiz_performance',
        event_label: `exam_${data.examNumber}_question_${data.questionNumber}`,
        exam_number: data.examNumber,
        question_number: data.questionNumber,
        is_multiple_choice: data.isMultipleChoice,
        mode: data.mode,
        time_spent: data.timeSpent || 0
      })
    }

    // Track question difficulty (if it's frequently wrong)
    window.gtag('event', 'question_attempted', {
      event_category: 'quiz_analytics',
      event_label: `exam_${data.examNumber}_question_${data.questionNumber}`,
      exam_number: data.examNumber,
      question_number: data.questionNumber,
      result: data.isCorrect ? 'correct' : 'incorrect',
      mode: data.mode
    })
  }

  // Track when a question is marked for review
  static trackQuestionReview(examNumber: number, questionNumber: number, mode: 'practice' | 'test') {
    if (!this.isGAReady() || !this.hasConsent()) return

    window.gtag('event', 'question_review', {
      event_category: 'quiz_behavior',
      event_label: `exam_${examNumber}_question_${questionNumber}`,
      exam_number: examNumber,
      question_number: questionNumber,
      mode: mode
    })
  }

  // Track session completion
  static trackSessionComplete(data: SessionAnalytics) {
    if (!this.isGAReady() || !this.hasConsent()) return

    window.gtag('event', 'quiz_session_complete', {
      event_category: 'quiz_completion',
      event_label: data.mode,
      mode: data.mode,
      total_questions: data.totalQuestions,
      questions_answered: data.questionsAnswered,
      correct_answers: data.correctAnswers,
      completion_rate: data.completionRate,
      accuracy_rate: data.questionsAnswered > 0 ? (data.correctAnswers / data.questionsAnswered * 100) : 0,
      session_duration_seconds: data.sessionDuration
    })
  }

  // Track most problematic questions (called periodically)
  static trackProblematicQuestion(examNumber: number, questionNumber: number, incorrectCount: number) {
    if (!this.isGAReady() || !this.hasConsent()) return

    window.gtag('event', 'question_difficulty_high', {
      event_category: 'quiz_difficulty',
      event_label: `exam_${examNumber}_question_${questionNumber}`,
      exam_number: examNumber,
      question_number: questionNumber,
      incorrect_count: incorrectCount
    })
  }

  // Track quiz mode start
  static trackQuizStart(mode: 'practice' | 'test', totalQuestions: number) {
    if (!this.isGAReady() || !this.hasConsent()) return

    window.gtag('event', 'quiz_start', {
      event_category: 'quiz_engagement',
      event_label: mode,
      mode: mode,
      total_questions: totalQuestions
    })
  }

  // Track when users abandon quiz
  static trackQuizAbandon(mode: 'practice' | 'test', questionsAnswered: number, totalQuestions: number) {
    if (!this.isGAReady() || !this.hasConsent()) return

    window.gtag('event', 'quiz_abandon', {
      event_category: 'quiz_engagement',
      event_label: mode,
      mode: mode,
      questions_answered: questionsAnswered,
      total_questions: totalQuestions,
      abandon_rate: (questionsAnswered / totalQuestions) * 100
    })
  }
}

// Hook for React components to easily track question timing
export function useQuestionTimer() {
  const startTime = Date.now()
  
  const getTimeSpent = () => {
    return Math.round((Date.now() - startTime) / 1000)
  }
  
  return { getTimeSpent }
}
