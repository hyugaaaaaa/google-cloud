import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { Trophy, Target, BarChart3, AlertCircle, ChevronRight, RotateCcw, CheckCircle2, Zap } from 'lucide-react'

type HistoryItem = {
  is_correct: boolean
  question_id: string
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
      question_id,
      created_at,
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

  const typedHistories = (histories as unknown as HistoryItem[]) || []

  // 全体集計
  const totalAnswers = typedHistories.length
  const totalCorrect = typedHistories.filter(h => h.is_correct).length
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0
  
  // 最新の回答状況を把握するためのマップを作成
  const latestResults = new Map<string, boolean>()
  typedHistories.forEach(h => {
    // 履歴は作成日時順（または取得順）なので、常に最新の状態で上書きする
    // (実際には histories.select に order('created_at', { ascending: true }) を足すのが確実)
    latestResults.set(h.question_id, h.is_correct)
  })

  // 最新の結果が不正解（false）のものの数をカウント
  const uniqueIncorrectCount = Array.from(latestResults.values()).filter(isCorrect => !isCorrect).length

  // カテゴリ別集計
  const categoryStats: Record<string, { 
    name: string, 
    total: number, 
    correct: number, 
    lastActivity: string,
    latestResults: Map<string, boolean> 
  }> = {}

  typedHistories.forEach(h => {
    if (!h.questions || !h.questions.categories) return
    const catId = h.questions.category_id
    const catName = h.questions.categories.name
    const createdAt = (h as any).created_at // Assuming it exists in query

    if (!categoryStats[catId]) {
      categoryStats[catId] = { 
        name: catName, 
        total: 0, 
        correct: 0, 
        lastActivity: createdAt,
        latestResults: new Map()
      }
    }
    
    categoryStats[catId].total += 1
    if (h.is_correct) categoryStats[catId].correct += 1
    if (createdAt > categoryStats[catId].lastActivity) {
      categoryStats[catId].lastActivity = createdAt
    }
    // 最新の状態を追跡
    categoryStats[catId].latestResults.set(h.question_id, h.is_correct)
  })

  const categoryResults = Object.entries(categoryStats).map(([id, stat]) => {
    const uniqueWrongCount = Array.from(stat.latestResults.values()).filter(isCorrect => !isCorrect).length
    return {
      id,
      ...stat,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      uniqueWrongCount
    }
  }).sort((a, b) => b.total - a.total)

  // デイリーチャレンジの完了状況を確認
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const { data: dailyHistory } = await supabase
    .from('histories')
    .select('id')
    .eq('user_id', user.id)
    .eq('study_mode', 'daily')
    .gte('created_at', startOfDay.toISOString())
  
  const isDailyCompleted = dailyHistory && dailyHistory.length >= 6

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text selection:bg-qz-blue/20 flex flex-col">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Dashboard</h1>
            <p className="text-qz-text-light font-bold">あなたの学習状況を一括管理</p>
          </div>
          
          {/* Daily Challenge Mini Card */}
          <Link href="/dashboard/daily" className={`group relative overflow-hidden qz-card p-4 pr-12 flex items-center gap-4 border-2 transition-all duration-300 ${isDailyCompleted ? 'border-qz-success bg-qz-success/5' : 'border-qz-blue bg-qz-blue/5 hover:scale-[1.02]'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDailyCompleted ? 'bg-qz-success text-white' : 'bg-qz-blue text-white shadow-lg shadow-qz-blue/20'}`}>
              {isDailyCompleted ? <CheckCircle2 size={24} /> : <Zap size={24} />}
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Daily Challenge</h3>
              <p className={`text-[10px] font-bold ${isDailyCompleted ? 'text-qz-success' : 'text-qz-blue'}`}>
                {isDailyCompleted ? '本日は完了しました！' : '今日の6問に挑戦しましょう'}
              </p>
            </div>
            <ChevronRight className={`absolute right-4 w-5 h-5 transition-transform group-hover:translate-x-1 ${isDailyCompleted ? 'text-qz-success' : 'text-qz-blue'}`} />
          </Link>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="qz-card p-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-qz-blue"></div>
                
                <div className="relative w-32 h-32 flex-shrink-0">
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
                    <span className="text-3xl font-black italic">{overallAccuracy}%</span>
                  </div>
                </div>

                <div className="flex-grow space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-qz-text-light mb-1">現在の総合スコア</h3>
                    <p className="text-2xl font-black tracking-tight leading-none text-qz-text dark:text-white">よく頑張っています！</p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-qz-bg dark:bg-[#2E3856] px-4 py-2 rounded-xl border border-qz-border dark:border-[#2E3856]">
                      <span className="block text-[8px] font-black uppercase text-qz-text-light mb-0.5">解答数</span>
                      <span className="text-lg font-black">{totalAnswers}</span>
                    </div>
                    <div className="bg-qz-bg dark:bg-[#2E3856] px-4 py-2 rounded-xl border border-qz-border dark:border-[#2E3856]">
                      <span className="block text-[8px] font-black uppercase text-qz-text-light mb-0.5">正解数</span>
                      <span className="text-lg font-black text-qz-success">{totalCorrect}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Mistakes Section */}
              <div className="qz-card p-8 bg-qz-error/5 border-qz-error/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
                  <AlertCircle size={120} className="text-qz-error" />
                </div>
                
                <div className="relative z-10 w-20 h-20 bg-qz-error/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="text-qz-error w-10 h-10" />
                </div>

                <div className="relative z-10 flex-grow text-center md:text-left space-y-4">
                  <div>
                    <h3 className="text-qz-error text-xl font-black italic uppercase tracking-tight">Review Mistakes</h3>
                    <p className="text-qz-text-light text-sm font-bold">
                      間違えた問題が <span className="text-qz-error text-lg">{uniqueIncorrectCount}問</span> あります。
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <Link 
                      href="/review" 
                      className="inline-flex bg-qz-error text-white font-black py-3 px-8 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg shadow-qz-error/20 group-hover:scale-105"
                    >
                      苦手克服を開始
                    </Link>
                    <Link 
                      href="/dashboard/mistakes" 
                      className="inline-flex bg-white dark:bg-[#2E3856] text-qz-text dark:text-white border-2 border-qz-border dark:border-[#2E3856] font-black py-3 px-8 rounded-xl hover:bg-qz-bg dark:hover:bg-[#1A1D23] transition-all duration-300 group-hover:scale-105"
                    >
                      履歴を確認
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Exam Section (Unified with Home Screen) */}
            <section className="mb-12">
              <div className="qz-card p-8 !bg-qz-blue border-none flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
                {/* Background Icon */}
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700">
                  <Trophy size={200} className="text-white" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                    <Target className="text-white w-8 h-8" />
                  </div>
                  
                  <div className="flex-grow text-center md:text-left space-y-2">
                    <h3 className="text-white text-2xl md:text-3xl font-black italic tracking-tight uppercase">Ready for the real thing?</h3>
                    <p className="text-white/80 font-bold leading-relaxed max-w-xl">
                      本番同様の環境で、あなたの現在の実力を測定しましょう。
                      20問のランダムな問題で合格圏内かチェック！
                    </p>
                  </div>

                  <div className="flex-shrink-0 w-full md:w-auto pt-4 md:pt-0">
                    <Link 
                      href="/mock-exam" 
                      className="bg-white text-qz-blue font-black py-4 px-10 rounded-2xl hover:bg-qz-yellow hover:text-qz-text transition-all duration-300 text-lg flex items-center justify-center gap-3 shadow-xl group-hover:scale-105"
                    >
                      模擬試験スタート <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

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
                    <div key={idx} className="qz-card p-8 flex flex-col justify-between group hover:border-qz-blue transition-all duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <h4 className="font-black text-xl leading-tight group-hover:text-qz-blue transition-colors">{cat.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-qz-text-light tracking-widest bg-qz-bg dark:bg-[#2E3856] px-2 py-0.5 rounded border border-qz-border dark:border-[#2E3856]">
                              {cat.total} 解答
                            </span>
                            {cat.lastActivity && (
                              <span className="text-[10px] font-bold text-qz-text-light flex items-center gap-1">
                                <RotateCcw size={10} />
                                {new Date(cat.lastActivity).toLocaleDateString('ja-JP')}
                              </span>
                            )}
                          </div>
                        </div>
                        {isWeak && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-qz-error/10 text-qz-error text-[10px] font-black rounded-xl border border-qz-error/20 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> 要注意
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-qz-bg dark:bg-[#2E3856] p-4 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                          <span className="block text-[9px] font-black uppercase text-qz-text-light mb-1">正解率</span>
                          <span className={`text-xl font-black italic ${isWeak ? 'text-qz-error' : 'text-qz-success'}`}>{cat.accuracy}%</span>
                        </div>
                        <div className="bg-qz-bg dark:bg-[#2E3856] p-4 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                          <span className="block text-[9px] font-black uppercase text-qz-text-light mb-1">現在の苦手</span>
                          <span className={`text-xl font-black italic ${cat.uniqueWrongCount > 0 ? 'text-qz-error' : 'text-qz-success'}`}>
                            {cat.uniqueWrongCount}<span className="text-xs font-bold text-qz-text-light ml-1">問</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase text-qz-text-light tracking-wider">Current Mastery</span>
                          <span className="text-xs font-bold text-qz-text-light">{cat.correct} / {cat.total} Correct</span>
                        </div>
                        <div className="w-full h-3.5 bg-qz-bg dark:bg-[#2E3856] rounded-full overflow-hidden border border-qz-border dark:border-[#2E3856] p-0.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isWeak ? 'bg-qz-error' : 'bg-qz-success'}`}
                            style={{ width: `${cat.accuracy}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-qz-border dark:border-[#2E3856] flex justify-end">
                        <Link 
                          href={`/category/${cat.id}`}
                          className="text-xs font-black text-qz-blue hover:text-qz-blue/80 flex items-center gap-1 group/btn"
                        >
                          このカテゴリを学習する <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
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
