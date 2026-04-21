import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ホーム',
  description: 'Google Cloud CDL 資格対策のトップページ。最新の試験傾向に基づいた問題セットで学習を始めましょう。',
}
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/common/Header'
import { ArrowRight, Zap, Trophy, ShieldCheck, LayoutDashboard, ChevronRight, Target, CheckCircle2 } from 'lucide-react'
import { CategoryCard } from '@/components/study/CategoryCard'
import { updateStreakAction } from '@/app/(study)/actions'

export default async function Home() {
  const supabase = await createClient()

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  // ログイン中ならストリークを更新
  let streak = 0
  if (user) {
    const result = await updateStreakAction()
    if ('streak' in result) {
      streak = result.streak || 0
    }
  }

  // Fetch categories with question counts
  const { data: categories } = await supabase
    .from('categories')
    .select('*, questions(count)')
    .order('created_at', { ascending: true })

  // デイリーチャレンジの完了状態を確認
  let isDailyCompleted = false
  if (user) {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    
    const { data: dailyHistory } = await supabase
      .from('histories')
      .select('id')
      .eq('user_id', user.id)
      .eq('study_mode', 'daily')
      .gte('created_at', startOfDay.toISOString())
    
    isDailyCompleted = dailyHistory !== null && dailyHistory.length >= 6
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text selection:bg-qz-blue/20">
      <Header userEmail={user?.email || ''} streak={streak} />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Hero Section */}
        {!user && (
          <section className="bg-white dark:bg-[#1A1D23] qz-card p-6 md:p-16 mb-8 md:mb-16 flex flex-col items-center text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-qz-blue/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-qz-yellow/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-qz-blue/10 text-qz-blue text-xs md:text-sm font-black rounded-full mb-6 md:mb-8">
              <Zap className="w-4 h-4" /> CDL 試験合格への最短ルート
            </div>
            
            <h1 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 tracking-tight italic leading-[1.1]">
              Google Cloud <span className="text-qz-blue">CDL</span> を<br />
              よりスマートに学習しよう。
            </h1>
            
            <p className="text-base md:text-xl text-qz-text-light max-w-2xl mb-10 md:mb-12 font-bold leading-relaxed">
              最新の試験傾向に基づいた240問の高品質な問題セットで、<br className="hidden md:block" />
              あなたのクラウドスキルを短期間で確実に向上させます。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login" className="qz-btn-primary px-10 md:px-16 py-4 md:py-6 text-base md:text-xl shadow-2xl shadow-qz-blue/20">
                今すぐ無料で始める
              </Link>
            </div>
          </section>
        )}

        {/* Daily Challenge Entry Point (ログイン済みのみ表示) */}
        {user && (
          <section className="mb-6 md:mb-12">
            <div className="qz-card p-4 md:p-10 bg-gradient-to-br from-[#6366F1] to-[#A855F7] border-none flex flex-row md:flex-row items-center justify-between overflow-hidden relative group shadow-xl shadow-indigo-500/20">
              {/* Background Icon */}
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-12 -translate-y-12 md:translate-x-8 md:-translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700">
                <Zap className="w-24 h-24 md:w-64 md:h-64 text-white" />
              </div>

              <div className="relative z-10 flex items-center gap-3 md:gap-12 w-full">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-white/20 rounded-lg md:rounded-[32px] flex items-center justify-center flex-shrink-0">
                  {isDailyCompleted ? <CheckCircle2 className="text-white w-5 h-5 md:w-10 md:h-10" /> : <Zap className="text-white w-5 h-5 md:w-10 md:h-10" />}
                </div>

                <div className="flex-grow text-left space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-2 md:gap-6">
                    <h3 className="text-white text-base md:text-4xl font-black italic tracking-tight uppercase leading-none">Daily</h3>
                    {isDailyCompleted && (
                      <span className="bg-white/20 text-white text-[8px] md:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/30 self-center">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-[10px] md:text-lg font-bold leading-tight max-w-xl">
                    {isDailyCompleted 
                      ? "完了！明日また挑戦。" 
                      : "毎日選ばれる6問に挑戦。"}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    href="/dashboard/daily"
                    className="bg-white text-qz-blue font-black py-2 md:py-6 px-4 md:px-14 rounded-lg md:rounded-[24px] hover:bg-qz-yellow hover:text-qz-text transition-all duration-300 text-xs md:text-xl flex items-center justify-center gap-1 md:gap-4 shadow-xl group-hover:scale-105"
                  >
                    {isDailyCompleted ? "結果" : "開始"} <ArrowRight className="w-3.5 h-3.5 md:w-8 md:h-8" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mock Exam Entry Point */}
        <section className="mb-10 md:mb-20">
          <div className="qz-card p-4 md:p-10 !bg-qz-blue border-none flex flex-row md:flex-row items-center justify-between overflow-hidden relative group">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-12 -translate-y-12 md:translate-x-8 md:-translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700">
              <Trophy className="w-24 h-24 md:w-64 md:h-64 text-white" />
            </div>

            <div className="relative z-10 flex items-center gap-3 md:gap-12 w-full">
              <div className="w-10 h-10 md:w-20 md:h-20 bg-white/20 rounded-lg md:rounded-[32px] flex items-center justify-center flex-shrink-0">
                <Target className="text-white w-5 h-5 md:w-10 md:h-10" />
              </div>

              <div className="flex-grow text-left space-y-0.5 md:space-y-2">
                <h3 className="text-white text-base md:text-4xl font-black italic tracking-tight uppercase leading-none">Mock Exam</h3>
                <p className="text-white/80 text-[10px] md:text-lg font-bold leading-tight max-w-xl">
                  20問の模擬試験で実力測定。
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/mock-exam"
                  className="bg-white text-qz-blue font-black py-2 md:py-6 px-4 md:px-14 rounded-lg md:rounded-[24px] hover:bg-qz-yellow hover:text-qz-text transition-all duration-300 text-xs md:text-xl flex items-center justify-center gap-1 md:gap-4 shadow-xl group-hover:scale-105"
                >
                  開始 <ChevronRight className="w-3.5 h-3.5 md:w-8 md:h-8" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className="mb-20">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">Categories</h2>
              <p className="text-qz-text-light text-sm font-bold">カテゴリ別に集中学習</p>
            </div>
            <div className="hidden sm:block px-4 py-2 bg-qz-bg dark:bg-[#2E3856] rounded-xl border border-qz-border dark:border-[#2E3856]">
              <span className="text-xs font-black text-qz-text-light">Total: {categories?.length || 0}</span>
            </div>
          </header>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {categories.map((cat: { id: string; name: string; questions: { count: number }[] }) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  questionCount={cat.questions?.[0]?.count || 0}

                />
              ))}
            </div>
          ) : (
            <div className="qz-card p-12 text-center text-qz-text-light">
              利用可能なカテゴリがありません。DBにデータを追加してください。
            </div>
          )}
        </div>

        {/* Feature Section */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-black mb-2">Supabase 認証</h4>
            <p className="text-sm text-qz-text-light">安全なログインとデータ同期。</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="font-black mb-2">模擬試験機能</h4>
            <p className="text-sm text-qz-text-light">本番同様の制限時間で挑戦。</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h4 className="font-black mb-2">詳細な履歴</h4>
            <p className="text-sm text-qz-text-light">自分の苦手分野をグラフ化。</p>
          </div>
        </section>
      </main>
    </div>
  )
}
