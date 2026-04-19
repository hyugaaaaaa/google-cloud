import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/common/Header'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { CategoryFilter } from '@/components/admin/CategoryFilter'
import { Plus } from 'lucide-react'
import Link from 'next/link'

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
  let dbQuery = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (query) {
    dbQuery = dbQuery.ilike('content', `%${query}%`)
  }

  if (categoryId) {
    dbQuery = dbQuery.eq('category_id', categoryId)
  }

  const { data: questions, error } = await dbQuery

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
  const processedQuestions = (questions || []).map(q => ({
    ...q,
    // テキストの不一致（改行コードなど）を防ぐためにトリミング
    content: q.content?.trim() || "",
    answer: q.answer?.trim() || "",
    explanation: q.explanation?.trim() || "",
    options: typeof q.options === 'string' 
      ? JSON.parse(q.options) 
      : (Array.isArray(q.options) ? q.options : []),
  }))

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
            {/* Add functionality later */}
            <button className="qz-btn-primary h-14 px-6 flex items-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed">
              <Plus size={24} /> 新規作成
            </button>
          </div>
        </div>

        {error ? (
          <div className="qz-card p-12 text-center text-qz-error font-bold">
            データの取得に失敗しました
          </div>
        ) : (
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
        )}
      </main>
    </div>
  )
}
