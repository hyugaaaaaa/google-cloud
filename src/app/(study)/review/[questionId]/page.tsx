import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from '@/app/(study)/category/[categoryId]/StudyClient'
import type { Question } from '@/types/app.types'
import { decrypt } from '@/lib/crypto'
import { getEntitlements, resolvePlanTier } from '@/lib/feature-gates'
import {
  normalizeQuestionRecord,
  queryQuestionSingleWithFallback,
  QUESTION_SELECT_LEGACY,
  QUESTION_SELECT_MODERN,
} from '@/lib/question-schema-compat'

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
  const { data: question, error } = await queryQuestionSingleWithFallback((mode) => {
    if (mode === 'modern') {
      return supabase
        .from('questions')
        .select(QUESTION_SELECT_MODERN)
        .eq('id', questionId)
        .eq('is_active', true)
        .single()
    }

    return supabase
      .from('questions')
      .select(QUESTION_SELECT_LEGACY)
      .eq('id', questionId)
      .single()
  })

  if (error || !question) {
    console.error('Error fetching question for specific review:', error)
    return <div className="p-8 text-center text-red-500">問題が見つかりませんでした。</div>
  }

  // 型変換
  const processedQuestion: Question = normalizeQuestionRecord(question)

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
      sessionKey={`cloudmaster:review:single:${processedQuestion.id}:${user.id}`}
      planTier={planTier}
      maxQuestionCap={entitlements.categoryQuestionCap}
      xp={xp}
      level={level}
    />
  )
}
