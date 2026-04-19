import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { Achievements } from '@/components/dashboard/Achievements'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { encrypt } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, nickname')
    .eq('id', user.id)
    .single()

  // 2. 履歴取得
  const { data: histories, error } = await supabase
    .from('histories')
    .select(`
      id,
      is_correct,
      question_id,
      created_at,
      study_mode,
      questions (
        category_id,
        categories (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) console.error('Error fetching histories:', error)

  const typedHistories = (histories || []).map((h: any) => ({
    id: String(h.id),
    is_correct: !!h.is_correct,
    study_mode: String(h.study_mode || ''),
    question_id: String(h.question_id || ''),
    created_at: String(h.created_at || ''),
    catId: String(h.questions?.category_id || ''),
    catName: String(h.questions?.categories?.name || '不明')
  }))

  const totalAnswers = typedHistories.length
  const totalCorrect = typedHistories.filter(h => h.is_correct).length
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0
  
  // 今日の解答数
  const today = new Date().toISOString().split('T')[0]
  const solvedToday = typedHistories.filter(h => h.created_at.startsWith(today)).length

  // 週間アクティビティ集計
  const weeklyData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dStr = d.toISOString().split('T')[0]
    const count = typedHistories.filter(h => h.created_at.startsWith(dStr)).length
    weeklyData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
      isToday: i === 0
    })
  }

  // カテゴリ別集計
  const categoryStats: Record<string, any> = {}
  typedHistories.forEach(h => {
    const catId = h.catId
    if (!categoryStats[catId]) {
      categoryStats[catId] = { 
        id: catId,
        name: h.catName,
        total: 0,
        correct: 0,
        lastActivity: h.created_at,
        latestResults: new Map<string, boolean>()
      }
    }
    const stat = categoryStats[catId]
    stat.total++
    if (h.is_correct) stat.correct++
    if (new Date(h.created_at) > new Date(stat.lastActivity)) {
      stat.lastActivity = h.created_at
    }
    stat.latestResults.set(h.question_id, h.is_correct)
  })

  const categoryResults = Object.values(categoryStats).map(stat => ({
    id: stat.id,
    encryptedId: encrypt(stat.id),
    name: stat.name,
    total: stat.total,
    correct: stat.correct,
    accuracy: Math.round((stat.correct / stat.total) * 100),
    lastActivity: stat.lastActivity,
    uniqueWrongCount: Array.from(stat.latestResults.values()).filter((v: any) => !v).length
  })).sort((a, b) => b.total - a.total)

  // 直近のセッション（最後の10件を逆順で）
  const recentSessions = [...typedHistories].reverse().slice(0, 8).map(h => ({
    id: h.id,
    questionId: h.question_id,
    encryptedQuestionId: encrypt(h.question_id),
    catName: h.catName,
    isCorrect: h.is_correct,
    createdAt: h.created_at,
    mode: h.study_mode
  }))

  const streak = profile?.streak_count || 0
  const hasCompletedMock = typedHistories.some(h => h.study_mode === 'mock')

  if (totalAnswers === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
        <Header userEmail={user.email || ''} streak={streak} />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="qz-card p-16 text-center">
            <div className="w-20 h-20 bg-qz-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-qz-blue" />
            </div>
            <h3 className="text-2xl font-black mb-4">データがまだありません</h3>
            <p className="text-qz-text-light font-bold mb-8">学習を開始して成長を記録しましょう。</p>
            <Link href="/" className="qz-btn-primary px-10">最初の学習を開始</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg pb-20">
      <Header userEmail={user.email || ''} streak={streak} />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="space-y-12">
          {/* Top Section: Overview */}
          <section className="space-y-6">
            <StatsOverview 
              totalSolved={totalAnswers}
              overallAccuracy={overallAccuracy}
              streak={streak}
              solvedToday={solvedToday}
            />
          </section>

          {/* Middle Section: Chart and Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActivityChart data={weeklyData} />
            </div>
            <div className="lg:col-span-1">
              <Achievements 
                streak={streak}
                totalAnswers={totalAnswers}
                hasPerfectScore={categoryResults.some(c => c.accuracy === 100 && c.total >= 5)}
                hasCompletedMock={hasCompletedMock}
              />
            </div>
          </div>

          {/* Lower Section: Recent and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <RecentSessions sessions={recentSessions} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-qz-border dark:border-[#2E3856] pb-4">
                <h2 className="text-2xl font-black italic tracking-tight uppercase">Category Performance</h2>
                <div className="px-3 py-1 bg-qz-bg dark:bg-[#2E3856] rounded-full border border-qz-border dark:border-[#2E3856]">
                  <span className="text-[10px] font-black text-qz-text-light uppercase">Sorted by total</span>
                </div>
              </div>
              <CategoryList categories={categoryResults} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
