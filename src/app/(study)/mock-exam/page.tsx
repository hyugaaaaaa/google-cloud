import { createClient } from '@/lib/supabase/server'
import type { Question } from '@/types/app.types'
import { MockExamClient } from './MockExamClient'
import {
  normalizeQuestionRecord,
  queryQuestionsArrayWithFallback,
  QUESTION_SELECT_LEGACY,
  QUESTION_SELECT_MODERN,
} from '@/lib/question-schema-compat'

function pseudoRandomScore(value: string, seed: string) {
  let hash = 2166136261
  const combined = `${value}:${seed}`
  for (let i = 0; i < combined.length; i += 1) {
    hash ^= combined.charCodeAt(i)
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return Math.abs(hash)
}

export default async function MockExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // MVPのため全問題を取得し、サーバー側でシャッフルして20問抽出する
  // ※問題数が増えた場合は、PostgreSQL側に random() ソートのRPC関数を作成推奨
  const { data: questions, error } = await queryQuestionsArrayWithFallback((mode) => {
    const selectColumns: string = mode === 'modern'
      ? `${QUESTION_SELECT_MODERN}, categories(name)`
      : `${QUESTION_SELECT_LEGACY}, categories(name)`

    if (mode === 'modern') {
      return supabase.from('questions').select(selectColumns).eq('is_active', true)
    }

    return supabase.from('questions').select(selectColumns)
  })

  if (error || !questions) {
    console.error("Error fetching questions for mock exam:", error)
    return <div className="min-h-screen flex items-center justify-center p-8 text-red-500">問題の読み込みに失敗しました。</div>
  }

  const questionRows = (questions || []) as unknown as Array<{
    id: string
    categories?: { name: string }[] | { name: string } | null
  }>
  const seed = `${new Date().toISOString().slice(0, 10)}:${user?.id || 'guest'}`
  const selectedQuestions = [...questionRows]
    .sort((a, b) => pseudoRandomScore(a.id, seed) - pseudoRandomScore(b.id, seed))
    .slice(0, 20)

  // TypeScript型にパース
  const processedQuestions: (Question & { categoryName: string })[] = selectedQuestions.map((question) => {
    const row = question as { categories?: { name: string }[] | { name: string } | null }
    const normalized = normalizeQuestionRecord(question)
    const categoryName = Array.isArray(row.categories)
      ? row.categories[0]?.name || '不明'
      : row.categories?.name || '不明'

    return {
      ...normalized,
      categoryName,
    }
  })

  let initialBookmarkedIds: string[] = []
  let streak = 0
  let xp = 0
  let level = 1

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, xp, level')
      .eq('id', user.id)
      .single()

    streak = profile?.streak_count || 0
    xp = profile?.xp || 0
    level = profile?.level || 1

    // ブックマーク情報の取得
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id)
    
    initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)
  }

  return <MockExamClient 
    questions={processedQuestions} 
    userEmail={user?.email || ''} 
    streak={streak}
    initialBookmarkedIds={initialBookmarkedIds} 
    xp={xp}
    level={level}
  />
}
