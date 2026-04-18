import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { AlertCircle, ChevronLeft, Calendar, BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import { MistakesClient } from './MistakesClient'

type MistakeHistoryItem = {
  id: string
  created_at: string
  is_correct: boolean
  user_answer: string | null
  question_id: string
  questions: {
    content: string
    options: any
    answer: string
    explanation: string
    categories: {
      name: string
    }
  }
}

export default async function MistakesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: histories, error } = await supabase
    .from('histories')
    .select(`
      id,
      created_at,
      is_correct,
      user_answer,
      question_id,
      questions (
        content,
        options,
        answer,
        explanation,
        categories (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mistakes:', error.message || error)
  }

  const typedHistories = (histories as unknown as MistakeHistoryItem[]) || []

  const latestStatusMap = new Map<string, MistakeHistoryItem>()
  typedHistories.forEach(h => {
    if (!latestStatusMap.has(h.question_id)) {
      latestStatusMap.set(h.question_id, h)
    }
  })

  const currentMistakes = Array.from(latestStatusMap.values())
    .filter(h => !h.is_correct)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const { data: bookmarkData } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', user.id)
  
  const initialBookmarkedIds = (bookmarkData || []).map(b => b.question_id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count')
    .eq('id', user.id)
    .single()

  const streak = profile?.streak_count || 0

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
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Mistake History</h1>
          <p className="text-qz-text-light font-bold">カテゴリを選択して効率的に復習しましょう</p>
        </div>

        {currentMistakes.length === 0 ? (
          <div className="qz-card p-16 text-center mt-8">
            <div className="w-20 h-20 bg-qz-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-qz-success" />
            </div>
            <h3 className="text-2xl font-black mb-4">苦手な問題はありません！</h3>
            <p className="text-qz-text-light font-bold mb-8">
              素晴らしい成績です。この調子で学習を続けましょう。
            </p>
            <Link href="/" className="qz-btn-primary px-10">
              ホームへ戻る
            </Link>
          </div>
        ) : (
          <MistakesClient 
            mistakes={currentMistakes} 
            initialBookmarkedIds={initialBookmarkedIds} 
          />
        )}
      </main>
    </div>
  )
}
