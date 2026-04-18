import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Question } from '@/types/app.types'
import { MockExamClient } from './MockExamClient'

export default async function MockExamPage() {
  const supabase = await createClient()

  // セッション確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // MVPのため全問題を取得し、サーバー側でシャッフルして20問抽出する
  // ※問題数が増えた場合は、PostgreSQL側に random() ソートのRPC関数を作成推奨
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*, categories(name)')

  if (error || !questions) {
    console.error("Error fetching questions for mock exam:", error)
    return <div className="min-h-screen flex items-center justify-center p-8 text-red-500">問題の読み込みに失敗しました。</div>
  }

  // 配列をシャッフル (Fisher-Yates)
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 最大20問を抽出
  const selectedQuestions = shuffled.slice(0, 20)

  // TypeScript型にパース
  const processedQuestions: (Question & { categoryName: string })[] = selectedQuestions.map(q => ({
    id: q.id,
    category_id: q.category_id,
    categoryName: q.categories?.name || '不明', // Joinしてきたカテゴリ名
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    created_at: q.created_at
  }))

  if (processedQuestions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center p-8">出題可能な問題がありません。</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MockExamClient questions={processedQuestions} />
    </div>
  )
}
