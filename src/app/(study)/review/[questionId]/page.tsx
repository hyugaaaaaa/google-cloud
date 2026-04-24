import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from '@/app/(study)/category/[categoryId]/StudyClient'
import type { Question } from '@/types/app.types'
import { decrypt } from '@/lib/crypto'
import { getEntitlements, resolvePlanTier } from '@/lib/feature-gates'

export default async function SpecificReviewPage({
  params
}: {
  params: Promise<{ questionId: string }> | { questionId: string }
}) {
  const resolvedParams = await params
  const questionId = decrypt(resolvedParams.questionId)

  if (!questionId) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 特定の問題を1件だけ取得
  const { data: question, error } = await supabase
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
    .eq('id', questionId)
    .eq('is_active', true)
    .single()

  if (error || !question) {
    console.error('Error fetching question for specific review:', error)
    return <div className="p-8 text-center text-red-500">問題が見つかりませんでした。</div>
  }

  // 型変換
  const processedQuestion: Question = {
    id: question.id,
    category_id: question.category_id,
    content: question.content,
    options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
    answer: question.answer,
    explanation: question.explanation || "",
    explanation_why_correct: question.explanation_why_correct || null,
    explanation_why_others_wrong: question.explanation_why_others_wrong || null,
    related_concepts: Array.isArray(question.related_concepts) ? question.related_concepts : [],
    difficulty: question.difficulty || 'medium',
    is_active: question.is_active,
    created_at: question.created_at
  }

  // ブックマーク情報の取得
  const { data: bookmarkData } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', user.id)
  
  const initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

  // プロフィールを取得（streak用）
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, xp, level, plan_tier')
    .eq('id', user.id)
    .single()

  const streak = profile?.streak_count || 0
  const xp = profile?.xp || 0
  const level = profile?.level || 1
  const planTier = resolvePlanTier(profile?.plan_tier)
  const entitlements = getEntitlements({ isGuest: false, planTier })

  // StudyClient自体がHeaderを含んでいるため、ここでは直接返す
  return (
    <StudyClient 
      questions={[processedQuestion]} 
      userEmail={user.email || ''} 
      streak={streak}
      initialBookmarkedIds={initialBookmarkedIds} 
      sessionKey={`cloudmaster:review:single:${question.id}:${user.id}`}
      planTier={planTier}
      maxQuestionCap={entitlements.categoryQuestionCap}
      xp={xp}
      level={level}
    />
  )
}
