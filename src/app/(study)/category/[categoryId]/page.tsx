import { createClient } from '@/lib/supabase/server'
import { StudyClient } from './StudyClient'
import type { Question } from '@/types/app.types'

export default async function CategoryStudyPage({
  params
}: {
  params: Promise<{ categoryId: string }> | { categoryId: string }
}) {
  // In Next.js 15, params is treated as a Promise in Server Components. We resolve it here.
  const resolvedParams = await params
  const { categoryId } = resolvedParams

  const supabase = await createClient()

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

  return <StudyClient questions={processedQuestions} />
}
