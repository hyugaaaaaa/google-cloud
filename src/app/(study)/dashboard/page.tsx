import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { Achievements } from '@/components/dashboard/Achievements'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { CategoryRadarChart } from '@/components/dashboard/CategoryRadarChart'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { WeaknessInsights } from '@/components/dashboard/WeaknessInsights'
import { PushNotificationToggle } from '@/components/common/PushNotificationToggle'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { encrypt } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

type TypedHistory = {
  id: string
  is_correct: boolean
  study_mode: string
  question_id: string
  created_at: string
  catId: string
  catName: string
}

type RawHistory = {
  id: string
  is_correct: boolean
  study_mode: string | null
  question_id: string
  created_at: string
  questions:
    | Array<{
        category_id: string | null
        categories: Array<{ name: string }> | { name: string } | null
      }>
    | {
        category_id: string | null
        categories: Array<{ name: string }> | { name: string } | null
      }
    | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, nickname, xp, level, onboarding_completed, push_opt_in')
    .eq('id', user.id)
    .single()

  const { count: bookmarkCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

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

  if (error) {
    console.error('Error fetching histories:', error)
  }

  const typedHistories: TypedHistory[] = ((histories || []) as RawHistory[]).map((history) => {
    const questionRelation = Array.isArray(history.questions)
      ? history.questions[0]
      : history.questions

    const categoryRelation = questionRelation?.categories
    const categoryName = Array.isArray(categoryRelation)
      ? categoryRelation[0]?.name
      : categoryRelation?.name

    return {
      id: String(history.id),
      is_correct: Boolean(history.is_correct),
      study_mode: String(history.study_mode || ''),
      question_id: String(history.question_id || ''),
      created_at: String(history.created_at || ''),
      catId: String(questionRelation?.category_id || ''),
      catName: String(categoryName || '不明'),
    }
  })

  const totalAnswers = typedHistories.length
  const totalCorrect = typedHistories.filter((history) => history.is_correct).length
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const solvedToday = typedHistories.filter((history) => history.created_at.startsWith(today)).length

  const weeklyData = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    const count = typedHistories.filter((history) => history.created_at.startsWith(dateString)).length
    weeklyData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
      isToday: i === 0,
    })
  }

  const categoryStats: Record<
    string,
    {
      id: string
      name: string
      total: number
      correct: number
      lastActivity: string
      latestResults: Map<string, boolean>
    }
  > = {}

  typedHistories.forEach((history) => {
    const categoryId = history.catId
    if (!categoryStats[categoryId]) {
      categoryStats[categoryId] = {
        id: categoryId,
        name: history.catName,
        total: 0,
        correct: 0,
        lastActivity: history.created_at,
        latestResults: new Map<string, boolean>(),
      }
    }

    const stat = categoryStats[categoryId]
    stat.total += 1
    if (history.is_correct) {
      stat.correct += 1
    }

    if (new Date(history.created_at) > new Date(stat.lastActivity)) {
      stat.lastActivity = history.created_at
    }

    stat.latestResults.set(history.question_id, history.is_correct)
  })

  const categoryResults = Object.values(categoryStats)
    .map((stat) => ({
      id: stat.id,
      encryptedId: encrypt(stat.id),
      name: stat.name,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / Math.max(stat.total, 1)) * 100),
      lastActivity: stat.lastActivity,
      uniqueWrongCount: Array.from(stat.latestResults.values()).filter((value) => !value).length,
    }))
    .sort((a, b) => b.total - a.total)

  const uniqueIncorrectCount = categoryResults.reduce((sum, category) => sum + category.uniqueWrongCount, 0)

  const recentSessions = [...typedHistories]
    .reverse()
    .slice(0, 8)
    .map((history) => ({
      id: history.id,
      questionId: history.question_id,
      encryptedQuestionId: encrypt(history.question_id),
      catName: history.catName,
      isCorrect: history.is_correct,
      createdAt: history.created_at,
      mode: history.study_mode,
    }))

  const weaknessInsights = categoryResults
    .filter((category) => category.total >= 3)
    .map((category) => {
      const severityScore = category.uniqueWrongCount * 8 + (100 - category.accuracy)

      let priority: 'high' | 'medium' | 'low' = 'low'
      if (severityScore >= 70) priority = 'high'
      else if (severityScore >= 35) priority = 'medium'

      let recommendation = '短い復習セットで定着を維持し、週末に模擬試験で確認しましょう。'
      if (priority === 'high') {
        recommendation = 'まず「間違いのみ」モードで5〜10問を復習し、直後に同カテゴリで20問を解くのが最短です。'
      } else if (priority === 'medium') {
        recommendation = '標準20問で正答率70%以上を目指し、翌日にデイリーチャレンジで再確認しましょう。'
      }

      return {
        id: category.id,
        name: category.name,
        accuracy: category.accuracy,
        wrongCount: category.uniqueWrongCount,
        recommendation,
        studyPath: `/category/${category.encryptedId}`,
        priority,
        severityScore,
      }
    })
    .sort((a, b) => b.severityScore - a.severityScore)

  const streak = profile?.streak_count || 0
  const xp = profile?.xp || 0
  const level = profile?.level || 1
  const hasCompletedMock = typedHistories.some((history) => history.study_mode === 'mock')

  if (totalAnswers === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
        <Header
          userEmail={user.email || ''}
          streak={streak}
          xp={xp}
          level={level}
        />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="qz-card p-16 text-center">
            <div className="w-20 h-20 bg-qz-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-qz-blue" />
            </div>
            <h3 className="text-2xl font-black mb-4">データがまだありません</h3>
            <p className="text-qz-text-light font-bold mb-8">学習を開始して成長を記録しましょう。</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/" className="qz-btn-primary px-10">最初の学習を開始</Link>
              {profile?.onboarding_completed === false && (
                <Link
                  href="/onboarding"
                  className="rounded-xl border-2 border-qz-border px-8 py-3 text-sm font-black text-qz-text transition-colors hover:bg-qz-bg dark:border-[#2E3856] dark:text-white dark:hover:bg-[#2E3856]"
                >
                  学習プランを設定
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg pb-20">
      <Header
        userEmail={user.email || ''}
        streak={streak}
        xp={xp}
        level={level}
      />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="space-y-8">
          {profile?.onboarding_completed === false && (
            <section className="rounded-2xl border border-qz-blue/20 bg-qz-blue/5 p-4 md:p-5">
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-qz-blue">Onboarding</p>
                  <p className="mt-1 text-sm font-bold text-qz-text-light">学習目標を設定すると、レコメンド精度と通知品質が上がります。</p>
                </div>
                <Link href="/onboarding" className="qz-btn-primary !py-2 !px-4 text-sm">設定を完了</Link>
              </div>
            </section>
          )}

          <StatsOverview overallAccuracy={overallAccuracy} streak={streak} solvedToday={solvedToday} />

          <PushNotificationToggle initialOptIn={Boolean(profile?.push_opt_in)} />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/bookmarks" className="qz-card p-6 flex items-center justify-between group hover:border-qz-yellow transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-qz-yellow/10 rounded-xl flex items-center justify-center text-qz-yellow group-hover:bg-qz-yellow group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black italic tracking-tight">Bookmarks</h3>
                  <p className="text-xs font-bold text-qz-text-light group-hover:text-qz-yellow transition-colors">保存した問題を復習</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black italic text-qz-yellow">{bookmarkCount || 0}</span>
                <div className="text-qz-text-light group-hover:text-qz-yellow transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/mistakes" className="qz-card p-6 flex items-center justify-between group hover:border-qz-error transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-qz-error/10 rounded-xl flex items-center justify-center text-qz-error group-hover:bg-qz-error group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black italic tracking-tight">Mistakes Review</h3>
                  <p className="text-xs font-bold text-qz-text-light group-hover:text-qz-error transition-colors">間違えた問題を集中的に復習</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black italic text-qz-error">{uniqueIncorrectCount || 0}</span>
                <div className="text-qz-text-light group-hover:text-qz-error transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          </section>

          <WeaknessInsights insights={weaknessInsights} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActivityChart data={weeklyData} />
            </div>
            <div className="lg:col-span-1">
              <Achievements
                streak={streak}
                totalAnswers={totalAnswers}
                hasPerfectScore={categoryResults.some((result) => result.accuracy === 100 && result.total >= 5)}
                hasCompletedMock={hasCompletedMock}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <RecentSessions sessions={recentSessions} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <CategoryRadarChart categories={categoryResults} />

              <div className="pt-4 border-t border-qz-border dark:border-[#2E3856]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black italic tracking-tight uppercase text-qz-text-light">Select to Study</h2>
                  <div className="px-2 py-0.5 bg-qz-bg dark:bg-[#2E3856] rounded-full border border-qz-border dark:border-[#2E3856]">
                    <span className="text-[9px] font-black text-qz-text-light uppercase">Sorted by total</span>
                  </div>
                </div>
                <CategoryList categories={categoryResults} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
