import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/common/Header'
import { BookMarked, ArrowRight, Zap, Trophy, ShieldCheck, LayoutDashboard, ChevronRight, Target } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch categories with question counts
  const { data: categories } = await supabase
    .from('categories')
    .select('*, questions(count)')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg text-qz-text dark:text-qz-text selection:bg-qz-blue/20">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        {!user && (
          <section className="bg-white dark:bg-[#1A1D23] qz-card p-10 mb-12 flex flex-col items-center text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-qz-blue/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-qz-yellow/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-qz-blue/10 text-qz-blue text-sm font-black rounded-full mb-6">
              <Zap className="w-4 h-4" /> CDL 試験合格への最短ルート
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-qz-text dark:text-white mb-6 leading-tight">
              Google Cloud 試験を、<br /><span className="text-qz-blue">よりスマートに学習しよう。</span>
            </h1>
            <p className="text-lg text-qz-text-light dark:text-qz-text-light mb-10 max-w-2xl leading-relaxed">
              忙しい社会人のために設計された、Quizlet風の一問一答形式アプリ。
              隙間時間で効率よく Google Cloud Digital Leader 資格をマスター。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="qz-btn-primary text-lg flex items-center justify-center gap-2 px-10">
                無料で学習を始める <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}
        
        {/* Mock Exam Entry Point */}
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
                  本番同様の制限時間と問題数で、あなたの現在の実力を測定しましょう。
                  20問のランダムな問題で合格圏内かチェック！
                </p>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto pt-4 md:pt-0">
                <Link 
                  href={user ? "/mock-exam" : "/login"} 
                  className="bg-white text-qz-blue font-black py-4 px-10 rounded-2xl hover:bg-qz-yellow hover:text-qz-text transition-all duration-300 text-lg flex items-center justify-center gap-3 shadow-xl group-hover:scale-105"
                >
                  模擬試験スタート <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-qz-border dark:border-[#2E3856] pb-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <BookMarked className="text-qz-blue w-6 h-6" /> 
              {user ? '学習カテゴリを選択' : '学習セットを探す'}
            </h2>
            {user && (
              <span className="text-sm font-bold text-qz-text-light flex items-center gap-1">
                全 {categories?.length || 0} セット
              </span>
            )}
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {categories.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  href={user ? `/category/${cat.id}` : "/login"}
                  className="group relative h-[200px]"
                >
                  {/* Stack effect background cards */}
                  <div className="absolute inset-0 bg-white dark:bg-[#1A1D23] rounded-[24px] shadow-sm transform translate-y-2 scale-[0.96] opacity-40 border border-qz-border dark:border-[#2E3856]"></div>
                  <div className="absolute inset-0 bg-white dark:bg-[#1A1D23] rounded-[24px] shadow-md transform translate-y-1 scale-[0.98] opacity-70 border border-qz-border dark:border-[#2E3856]"></div>
                  
                  {/* Main content card */}
                  <div className="relative h-full bg-white dark:bg-[#1A1D23] qz-card p-6 flex flex-col justify-between border-qz-border dark:border-[#2E3856] hover:border-qz-blue dark:hover:border-qz-blue transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-qz-bg dark:bg-[#2E3856] text-[10px] font-black uppercase tracking-widest text-qz-text-light rounded-full border border-qz-border dark:border-[#2E3856]">
                          Google Cloud CDL
                        </span>
                        <div className="px-2 py-1 bg-qz-blue/10 text-qz-blue text-[11px] font-black rounded-lg">
                          {cat.questions?.[0]?.count || 0} 問
                        </div>
                      </div>
                      <h3 className="text-xl font-black leading-tight group-hover:text-qz-blue transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-qz-blue/10 border border-qz-blue/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-qz-blue" />
                        </div>
                        <span className="text-xs font-bold text-qz-text-light">スピード学習</span>
                      </div>
                      <span className="text-sm font-black text-qz-blue group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        スタート <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
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
