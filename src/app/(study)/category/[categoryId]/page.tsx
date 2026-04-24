import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from './StudyClient'
import type { Question } from '@/types/app.types'
import { decrypt } from '@/lib/crypto'
import {
  normalizeQuestionRecord,
  queryQuestionsArrayWithFallback,
  QUESTION_SELECT_LEGACY,
  QUESTION_SELECT_MODERN,
} from '@/lib/question-schema-compat'

export default async function CategoryStudyPage({
  params
}: {
  params: Promise<{ categoryId: string }> | { categoryId: string }
}) {
  const resolvedParams = await params
  const categoryId = decrypt(resolvedParams.categoryId)

  if (!categoryId) {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: questions, error } = await queryQuestionsArrayWithFallback((mode) => {
    if (mode === 'modern') {
      return supabase
        .from('questions')
        .select(QUESTION_SELECT_MODERN)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
    }

    return supabase
      .from('questions')
      .select(QUESTION_SELECT_LEGACY)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true })
  })

  if (error) {
    console.error("Error fetching questions:", error)
    return <div className="p-8 text-red-500 text-center">問題の読み込みに失敗しました。</div>
  }

  const processedQuestions: Question[] = (questions || []).map(normalizeQuestionRecord)

  let initialBookmarkedIds: string[] = []
  let streak = 0
  let xp = 0
  let level = 1
  let incorrectQuestionIds: string[] = []

  if (user) {
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id)
    
    initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, xp, level')
      .eq('id', user.id)
      .single()
    
    streak = profile?.streak_count || 0
    xp = profile?.xp || 0
    level = profile?.level || 1

    const questionIds = processedQuestions.map((question) => question.id)
    if (questionIds.length > 0) {
      const { data: userHistories } = await supabase
        .from('histories')
        .select('question_id, is_correct, created_at')
        .eq('user_id', user.id)
        .in('question_id', questionIds)
        .order('created_at', { ascending: false })

      const latestByQuestion = new Map<string, boolean>()
      for (const history of userHistories || []) {
        if (!latestByQuestion.has(history.question_id)) {
          latestByQuestion.set(history.question_id, history.is_correct)
        }
      }

      incorrectQuestionIds = Array.from(latestByQuestion.entries())
        .filter(([, isCorrect]) => !isCorrect)
        .map(([id]) => id)
    }
  }

  return <StudyClient 
    questions={processedQuestions} 
    userEmail={user?.email || ''} 
    streak={streak}
    initialBookmarkedIds={initialBookmarkedIds} 
    incorrectQuestionIds={incorrectQuestionIds}
    sessionKey={`cloudmaster:study:${categoryId}:${user?.id || 'guest'}`}
    xp={xp}
    level={level}
  />
}
