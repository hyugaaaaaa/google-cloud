import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/common/Header'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { CategoryFilter } from '@/components/admin/CategoryFilter'
import { QuestionCreator } from '@/components/admin/QuestionCreator'
import { BulkImporter } from '@/components/admin/BulkImporter'
import Link from 'next/link'
import {
  normalizeQuestionRecord,
  queryQuestionsArrayWithFallback,
  QUESTION_SELECT_LEGACY,
  QUESTION_SELECT_MODERN,
} from '@/lib/question-schema-compat'

export const dynamic = 'force-dynamic'

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const categoryId = resolvedParams.category || ''
  const supabase = await createClient()

  // 認証・管理者チェック
  let user;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (e) {
    console.error('Auth error:', e)
  }

  const isAdmin = user?.email === 'hyuga0510@icloud.com'

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-qz-bg flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-2xl font-black mb-4">管理者権限が必要です</h1>
        <p className="text-qz-text-light mb-8">このページにアクセスするための権限がありません。</p>
        <Link href="/dashboard" className="qz-btn-primary px-8">ダッシュボードへ戻る</Link>
      </div>
    )
  }

  // Fetch categories for the filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch questions (最新50件に制限してハイドレーションを安定させる)
  const { data: questions, error } = await queryQuestionsArrayWithFallback((mode) => {
    let dbQuery = supabase
      .from('questions')
      .select(mode === 'modern' ? QUESTION_SELECT_MODERN : QUESTION_SELECT_LEGACY)
      .order('created_at', { ascending: false })
      .limit(80)

    if (query) {
      dbQuery = dbQuery.ilike('content', `%${query}%`)
    }

    if (categoryId) {
      dbQuery = dbQuery.eq('category_id', categoryId)
    }

    return dbQuery
  })

  const { data: questionStats } = await supabase
    .from('question_performance_stats')
    .select('question_id, attempt_count, accuracy_rate')

  const statsMap = new Map(
    (questionStats || []).map((stat) => [
      stat.question_id,
      {
        attempts: Number(stat.attempt_count || 0),
        accuracy: Number(stat.accuracy_rate || 0),
      },
    ]),
  )

  if (error) {
    return (
      <div className="min-h-screen bg-qz-bg flex flex-col items-center justify-center p-10">
        <div className="qz-card p-12 text-center max-w-lg border-qz-error">
          <h2 className="text-2xl font-black text-qz-error mb-4">Database Error</h2>
          <p className="text-qz-text-light mb-8">{error.message}</p>
          <Link href="/dashboard" className="qz-btn-primary px-8">戻る</Link>
        </div>
      </div>
    )
  }

  // 型の整合性を整える
  const processedQuestions = (questions || []).map((question) => {
    const normalized = normalizeQuestionRecord(question)

    return {
      ...normalized,
      // テキストの不一致（改行コードなど）を防ぐためにトリミング
      content: normalized.content?.trim() || '',
      answer: normalized.answer?.trim() || '',
      explanation: normalized.explanation?.trim() || '',
      explanation_why_correct: normalized.explanation_why_correct || '',
      explanation_why_others_wrong: normalized.explanation_why_others_wrong || '',
      related_concepts: Array.isArray(normalized.related_concepts) ? normalized.related_concepts : [],
      attempt_count: statsMap.get(normalized.id)?.attempts || 0,
      accuracy_rate: statsMap.get(normalized.id)?.accuracy || 0,
    }
  })

  const activeCount = processedQuestions.filter((question) => question.is_active).length
  const totalAttempts = processedQuestions.reduce((sum, question) => sum + question.attempt_count, 0)
  const weightedAccuracy = totalAttempts > 0
    ? Math.round(
        (processedQuestions.reduce(
          (sum, question) => sum + (question.accuracy_rate * question.attempt_count),
          0,
        ) / totalAttempts) * 100,
      ) / 100
    : 0
  const lowQualityCount = processedQuestions.filter(
    (question) => question.attempt_count >= 5 && question.accuracy_rate < 60,
  ).length

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <Header userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Admin Dashboard</h1>
            <p className="text-qz-text-light font-bold">問題の管理・修正・追加</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <CategoryFilter 
              categories={categories || []} 
              initialQuery={query} 
              initialCategoryId={categoryId} 
            />
            <BulkImporter categories={categories || []} />
            <QuestionCreator categories={categories || []} />
          </div>
        </div>

        {error ? (
          <div className="qz-card p-12 text-center text-qz-error font-bold">
            データの取得に失敗しました
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="qz-card p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-qz-text-light">Questions</p>
                <p className="mt-2 text-3xl font-black">{processedQuestions.length}</p>
              </div>
              <div className="qz-card p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-qz-text-light">Active</p>
                <p className="mt-2 text-3xl font-black text-qz-success">{activeCount}</p>
              </div>
              <div className="qz-card p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-qz-text-light">Weighted Accuracy</p>
                <p className="mt-2 text-3xl font-black text-qz-blue">{weightedAccuracy}%</p>
              </div>
              <div className="qz-card p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-qz-text-light">Needs Review</p>
                <p className="mt-2 text-3xl font-black text-qz-error">{lowQualityCount}</p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processedQuestions.map((q) => (
                <QuestionEditor key={q.id} question={q} />
              ))}
              {processedQuestions.length === 0 && (
                <div className="col-span-full qz-card p-20 text-center text-qz-text-light font-bold">
                  該当する問題が見つかりませんでした
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
