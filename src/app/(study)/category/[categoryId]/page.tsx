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
  const resolvedParams = await params
  const categoryId = decrypt(resolvedParams.categoryId)

  if (!categoryId) {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Error fetching questions:", error)
    return <div className="p-8 text-red-500 text-center">問題の読み込みに失敗しました。</div>
  }

  const processedQuestions: Question[] = (questions || []).map(q => ({
    id: q.id,
    category_id: q.category_id,
    content: q.content,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    answer: q.answer,
    explanation: q.explanation || "",
    created_at: q.created_at
  }))

  let initialBookmarkedIds: string[] = []
  let streak = 0

  if (user) {
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id)
    
    initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', user.id)
      .single()
    
    streak = profile?.streak_count || 0
  }

  return <StudyClient 
    questions={processedQuestions} 
    userEmail={user?.email || ''} 
    streak={streak}
    initialBookmarkedIds={initialBookmarkedIds} 
  />
}
