import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { Trophy, Target, BarChart3, AlertCircle, ChevronRight } from 'lucide-react'

type HistoryItem = {
  is_correct: boolean
  questions: {
    category_id: string
    categories: {
      name: string
    }
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: histories, error } = await supabase
    .from('histories')
    .select(`
      is_correct,
      questions (
        category_id,
        categories (
          name
        )
      )
    `)
    .eq('user_id', user.id)

  if (error) console.error('Error fetching histories:', error)

  const typedHistories = (histories as unknown as HistoryItem[]) || []

  // 全体集計
  const totalAnswers = typedHistories.length
  const totalCorrect = typedHistories.filter(h => h.is_correct).length
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

  // カテゴリ別集計
  const categoryStats: Record<string, { name: string, total: number, correct: number }> = {}

  typedHistories.forEach(h => {
    if (!h.questions || !h.questions.categories) return
    const catId = h.questions.category_id
    const catName = h.questions.categories.name

    if (!categoryStats[catId]) {
      categoryStats[catId] = { name: catName, total: 0, correct: 0 }
    }
    categoryStats[catId].total += 1
    if (h.is_correct) categoryStats[catId].correct += 1
  })

  const categoryResults = Object.values(categoryStats).map(stat => ({
    ...stat,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
  })).sort((a, b) => b.total - a.total) // 解答数が多い順

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text selection:bg-qz-blue/20 flex flex-col">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">My Statistics</h1>
          <p className="text-qz-text-light font-bold">あなたの学習進捗と成績の概要</p>
        </header>

        {totalAnswers === 0 ? (
          <div className="qz-card p-16 text-center">
            <div className="w-20 h-20 bg-qz-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-qz-blue" />
            </div>
            <h3 className="text-2xl font-black mb-4">データがまだありません</h3>
            <p className="text-qz-text-light font-bold mb-8">
              学習セットを完了すると、ここにあなたの成長記録が表示されます。
            </p>
            <Link href="/" className="qz-btn-primary px-10">
              最初の学習を開始する
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Score Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 qz-card p-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-qz-blue"></div>
                
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-qz-border dark:text-[#2E3856]" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <circle 
                      className="text-qz-blue transition-all duration-1000 ease-out" 
                      strokeWidth="10" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (251.2 * overallAccuracy) / 100}
                      strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black italic">{overallAccuracy}%</span>
                  </div>
                </div>

                <div className="flex-grow space-y-6 text-center md:text-left">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-qz-text-light mb-1">現在の総合スコア</h3>
                    <p className="text-3xl font-black tracking-tight leading-none">よく頑張っています！</p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-qz-bg dark:bg-[#2E3856] px-5 py-3 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                      <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">解答数</span>
                      <span className="text-xl font-black">{totalAnswers} <span className="text-xs text-qz-text-light font-bold tracking-normal">ITEMS</span></span>
                    </div>
                    <div className="bg-qz-bg dark:bg-[#2E3856] px-5 py-3 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                      <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正解数</span>
                      <span className="text-xl font-black text-qz-success">{totalCorrect}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="qz-card p-8 bg-qz-blue flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
                  <Trophy size={120} className="text-white" />
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                    <Target className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-white text-xl font-black mb-2">模擬試験に挑戦</h3>
                  <p className="text-white/80 text-sm font-bold leading-relaxed mb-6">
                    本番同様の環境で自分の実力を試してみましょう。
                  </p>
                </div>
                <Link href="/mock-exam" className="relative z-10 bg-white text-qz-blue font-black py-3 px-6 rounded-xl hover:bg-qz-yellow hover:text-qz-text transition-all text-center flex items-center justify-center gap-2">
                  試験スタート <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Category Analysis */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-qz-border dark:border-[#2E3856] pb-4">
                <BarChart3 className="text-qz-blue w-6 h-6" />
                <h2 className="text-2xl font-black italic tracking-tight">Level Breakdown</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryResults.map((cat, idx) => {
                  const isWeak = cat.accuracy < 60
                  return (
                    <div key={idx} className="qz-card p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <h4 className="font-black text-lg group-hover:text-qz-blue transition-colors leading-tight">{cat.name}</h4>
                          <span className="text-[10px] font-black uppercase text-qz-text-light tracking-widest">{cat.total} 回の解答データ</span>
                        </div>
                        {isWeak && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-qz-error/10 text-qz-error text-[10px] font-black rounded-lg border border-qz-error/20">
                            <AlertCircle className="w-3 h-3" /> 要注意
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase text-qz-text-light">Current Mastery</span>
                          <span className={`text-lg font-black italic ${isWeak ? 'text-qz-error' : 'text-qz-success'}`}>{cat.accuracy}%</span>
                        </div>
                        <div className="w-full h-3 bg-qz-bg dark:bg-[#2E3856] rounded-full overflow-hidden border border-qz-border dark:border-[#2E3856]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isWeak ? 'bg-qz-error' : 'bg-qz-success'}`}
                            style={{ width: `${cat.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
