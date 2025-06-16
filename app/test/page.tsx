'use client'

import { QuizContainer } from '../components/quiz'

export default function TestPage() {
  const config = {
    mode: 'test' as const,
    timeLimit: 45 * 60, // 45 minutes in seconds
    maxQuestions: 24,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showInstantFeedback: true,
    allowReview: true,
    showProgress: true
  }

  return <QuizContainer config={config} />
}
