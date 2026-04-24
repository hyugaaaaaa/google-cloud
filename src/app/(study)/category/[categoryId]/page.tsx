import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from './StudyClient'
import type { Question } from '@/types/app.types'
import { decrypt } from '@/lib/crypto'
import { getEntitlements, resolvePlanTier } from '@/lib/feature-gates'

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

  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      category_id,
      content,
      options,
      answer,
      explanation,
      explanation_why_correct,
      explanation_why_others_wrong,
      related_concepts,
      difficulty,
      is_active,
      created_at
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Error fetching questions:", error)
    return <div className="p-8 text-red-500 text-center">問題の読み込みに失敗しました。</div>
  }

  const processedQuestions: Question[] = (questions || []).map(q => ({
    id: q.id,
    category_id: q.category_id,
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    explanation_why_correct: q.explanation_why_correct || null,
    explanation_why_others_wrong: q.explanation_why_others_wrong || null,
    related_concepts: Array.isArray(q.related_concepts) ? q.related_concepts : [],
    difficulty: q.difficulty || 'medium',
    is_active: q.is_active,
    created_at: q.created_at
  }))

  let initialBookmarkedIds: string[] = []
  let streak = 0
  let xp = 0
  let level = 1
  let planTier = resolvePlanTier(null)
  let incorrectQuestionIds: string[] = []

  if (user) {
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id)
    
    initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, xp, level, plan_tier')
      .eq('id', user.id)
      .single()
    
    streak = profile?.streak_count || 0
    xp = profile?.xp || 0
    level = profile?.level || 1
    planTier = resolvePlanTier(profile?.plan_tier)

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

  const entitlements = getEntitlements({
    isGuest: !user,
    planTier,
  })

  return <StudyClient 
    questions={processedQuestions} 
    userEmail={user?.email || ''} 
    streak={streak}
    initialBookmarkedIds={initialBookmarkedIds} 
    incorrectQuestionIds={incorrectQuestionIds}
    sessionKey={`cloudmaster:study:${categoryId}:${user?.id || 'guest'}`}
    planTier={planTier}
    maxQuestionCap={entitlements.categoryQuestionCap}
    xp={xp}
    level={level}
  />
}
