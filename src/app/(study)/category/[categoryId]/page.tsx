import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudyClient } from './StudyClient'
import type { Question } from '@/types/app.types'
import { decrypt } from '@/lib/crypto'

export default async function CategoryStudyPage({
  params
}: {
  params: Promise<{ categoryId: string }> | { categoryId: string }
}) {
  // In Next.js 15, params is treated as a Promise in Server Components. We resolve it here.
  const resolvedParams = await params
  const categoryId = decrypt(resolvedParams.categoryId)

  if (!categoryId) {
    // 復号に失敗した場合はホームへ戻す（セキュリティおよびURL期限切れ対策）
    redirect('/')
  }

  const supabase = await createClient()

  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Error fetching questions:", error)
    return <div className="p-8 text-red-500 text-center">問題の読み込みに失敗しました。</div>
  }

  // Next.js 15 requires serialization, so we cast it safely if needed.
  // We parse the options field if it happens to come back as a string from JSONB. 
  // Typically, Supabase client parses JSONB to JSON automatically.
  const processedQuestions: Question[] = (questions || []).map(q => ({
    id: q.id,
    category_id: q.category_id,
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    created_at: q.created_at
  }))

  return <StudyClient questions={processedQuestions} user={user} />
}
