import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { BookmarksClient } from './BookmarksClient'
import { ChevronLeft, Bookmark } from 'lucide-react'

export default async function BookmarksPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ユーザーのブックマークを取得
  const { data: bookmarks, error: bookmarkError } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', user.id)

  if (bookmarkError) {
    console.error('Error fetching bookmarks:', bookmarkError)
    return <div className="p-8 text-center text-qz-error">エラーが発生しました。</div>
  }

  const bookmarkIds = (bookmarks || []).map(b => b.question_id)

  // プロフィールを取得（streak用）
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count')
    .eq('id', user.id)
    .single()

  const streak = profile?.streak_count || 0

  if (bookmarkIds.length === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={user.email || ''} streak={streak} />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-qz-text-light hover:text-qz-blue font-bold transition-colors mb-6 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              ダッシュボードに戻る
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Bookmarks</h1>
            <p className="text-qz-text-light font-bold">保存した問題を確認・復習しましょう</p>
          </div>
          <div className="qz-card p-16 text-center mt-8">
            <div className="w-20 h-20 bg-qz-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-qz-yellow" />
            </div>
            <h3 className="text-2xl font-black mb-4">No Bookmarks</h3>
            <p className="text-qz-text-light font-bold mb-8">
              ブックマークした問題がまだありません。<br />
              学習中に気になる問題があれば、星アイコンをタップして保存しましょう。
            </p>
            <Link href="/" className="qz-btn-primary px-8 inline-block">
              学習を始める
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // ブックマークされた問題の詳細を取得（カテゴリ名を含める）
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select(`
      *,
      categories (
        name
      )
    `)
    .in('id', bookmarkIds)

  if (qError) {
    console.error('Error fetching questions for bookmarks:', qError)
    return <div className="p-8 text-center text-qz-error">問題の取得に失敗しました。</div>
  }

  // 型変換とデータの整形
  const processedBookmarks = (questions || []).map((q: any) => ({
    id: q.id,
    category_id: q.category_id,
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    created_at: q.created_at,
    categoryName: q.categories?.name || '不明'
  }))

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text flex flex-col">
      <Header userEmail={user.email || ''} streak={streak} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-qz-text-light hover:text-qz-blue font-bold transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ダッシュボードに戻る
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Bookmarks</h1>
          <p className="text-qz-text-light font-bold">保存した問題を確認・復習しましょう</p>
        </div>

        <BookmarksClient bookmarks={processedBookmarks} />
      </main>
    </div>
  )
}
