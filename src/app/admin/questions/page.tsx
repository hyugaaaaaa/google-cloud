import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/common/Header'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { Search, Plus } from 'lucide-react'
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
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === 'hyuga0510@icloud.com'

  if (!isAdmin) {
    return <div className="p-20 text-center font-bold">管理者権限が必要です</div>
  }

  // Fetch categories for the filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch questions
  let dbQuery = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('content', `%${query}%`)
  }

  if (categoryId) {
    dbQuery = dbQuery.eq('category_id', categoryId)
  }

  const { data: questions, error } = await dbQuery

  // 型の整合性を整える（optionsが文字列で届くケースに対応）
  const processedQuestions = (questions || []).map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
  }))

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <Header userEmail={user.email} />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Admin Dashboard</h1>
            <p className="text-qz-text-light font-bold">問題の管理・修正・追加</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input 
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="問題を検索..."
                  className="qz-input w-full pl-12 h-14"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-qz-text-light" size={20} />
              </div>
              
              <select 
                name="category"
                defaultValue={categoryId}
                onChange={(e) => {
                  const form = e.currentTarget.form;
                  if (form) form.requestSubmit();
                }}
                className="qz-input h-14 px-4 bg-white dark:bg-[#2E3856] min-w-[200px]"
              >
                <option value="">全てのカテゴリ</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <button type="submit" className="hidden">検索</button>
            </form>
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
