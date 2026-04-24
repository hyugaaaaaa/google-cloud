import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from '@/app/(study)/category/[categoryId]/StudyClient'
import { Header } from '@/components/common/Header'
import type { Question } from '@/types/app.types'
import { getEntitlements, resolvePlanTier } from '@/lib/feature-gates'

export default async function ReviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ユーザーの全履歴を取得
  const { data: histories, error: histError } = await supabase
    .from('histories')
    .select('question_id, is_correct')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (histError) {
    console.error('Error fetching incorrect histories:', histError)
    return <div className="p-8 text-center">エラーが発生しました。</div>
  }

  // 最新の結果を抽出
  const latestResults = new Map<string, boolean>()
  ;(histories || []).forEach(h => {
    latestResults.set(h.question_id, h.is_correct)
  })

  // 最新が不正解（false）のIDだけを取り出す
  const wrongQuestionIds = Array.from(latestResults.entries())
    .filter(([, isCorrect]) => !isCorrect)
    .map(([id]) => id)

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

  if (wrongQuestionIds.length === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={user.email || ''} streak={streak} xp={xp} level={level} planTier={planTier} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="qz-card p-12 text-center max-w-lg">
            <h2 className="text-2xl font-black mb-4">完璧です！</h2>
            <p className="text-qz-text-light font-bold mb-8">現在、復習が必要な間違えた問題はありません。</p>
            <a href="/dashboard" className="qz-btn-primary px-8 inline-block">ダッシュボードへ戻る</a>
          </div>
        </div>
      </div>
    )
  }

  // 問題データを取得
  const { data: questions, error: qError } = await supabase
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
    .in('id', wrongQuestionIds)
    .eq('is_active', true)

  if (qError) {
    console.error('Error fetching questions for review:', qError)
    return <div className="p-8 text-center">問題の取得に失敗しました。</div>
  }

  // 型変換
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

  // ブックマーク情報の取得
  const { data: bookmarkData } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', user.id)
  
  const initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

  // StudyClient自体がHeaderを含んでいるため、ここでは直接返す
  return (
    <StudyClient 
      questions={processedQuestions} 
      userEmail={user.email || ''} 
      streak={streak}
      initialBookmarkedIds={initialBookmarkedIds} 
      incorrectQuestionIds={wrongQuestionIds}
      sessionKey={`cloudmaster:review:all:${user.id}`}
      planTier={planTier}
      maxQuestionCap={entitlements.categoryQuestionCap}
      xp={xp}
      level={level}
    />
  )
}
