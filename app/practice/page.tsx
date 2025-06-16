'use client'

import { QuizContainer } from '../components/quiz'

export default function PracticePage() {
  const config = {
    mode: 'practice' as const,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showInstantFeedback: true,
    allowReview: true,
    showProgress: true
  }

  return <QuizContainer config={config} />
}
