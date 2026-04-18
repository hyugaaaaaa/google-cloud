import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from '../category/[categoryId]/StudyClient'
import { Header } from '@/components/common/Header'
import type { Question } from '@/types/app.types'

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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="qz-card p-12 text-center max-w-lg">
            <h2 className="text-2xl font-black mb-4 italic">No Bookmarks</h2>
            <p className="text-qz-text-light font-bold mb-8">
              ブックマークした問題がまだありません。<br />
              学習中に気になる問題があれば、星アイコンをタップして保存しましょう。
            </p>
            <a href="/" className="qz-btn-primary px-8 inline-block">学習を始める</a>
          </div>
        </div>
      </div>
    )
  }

  // ブックマークされた問題の詳細を取得
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .in('id', bookmarkIds)

  if (qError) {
    console.error('Error fetching questions for bookmarks:', qError)
    return <div className="p-8 text-center text-qz-error">問題の取得に失敗しました。</div>
  }

  // 型変換
  const processedQuestions: Question[] = (questions || []).map(q => ({
    id: q.id,
    category_id: q.category_id,
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    created_at: q.created_at
  }))

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <StudyClient 
        questions={processedQuestions} 
        userEmail={user.email || ''} 
        streak={streak}
        initialBookmarkedIds={bookmarkIds} 
      />
    </div>
  )
}
