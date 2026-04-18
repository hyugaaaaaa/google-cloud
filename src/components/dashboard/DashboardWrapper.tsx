'use client'

import React, { useMemo } from 'react'
import { Header } from '@/components/common/Header'
import { Achievements } from '@/components/dashboard/Achievements'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { Zap, ChevronRight, Star, BarChart3 } from 'lucide-react'
import Link from 'next/link'

type DashboardData = {
  userEmail: string
  streak: number
  totalAnswers: number
  totalCorrect: number
  overallAccuracy: number
  uniqueIncorrectCount: number
  categoryResults: any[]
  hasCompletedMock: boolean
}

export function DashboardWrapper({ dataJSON }: { dataJSON: string }) {
  const data = useMemo<DashboardData>(() => JSON.parse(dataJSON), [dataJSON])
  const { 
    userEmail, 
    streak, 
    totalAnswers, 
    totalCorrect, 
    overallAccuracy, 
    uniqueIncorrectCount, 
    categoryResults,
    hasCompletedMock
  } = data

  if (totalAnswers === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
        <Header userEmail={userEmail} streak={streak} />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
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
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <Header userEmail={userEmail} streak={streak} />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="space-y-8">
          <Achievements 
            streak={streak}
            totalAnswers={totalAnswers}
            hasPerfectScore={categoryResults.some(c => c.accuracy === 100 && c.total >= 5)}
            hasCompletedMock={hasCompletedMock}
          />

          {/* Overall Score Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="qz-card p-8 bg-qz-blue text-white border-none shadow-xl shadow-qz-blue/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Overall Accuracy</h3>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star size={20} className="fill-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-black italic tracking-tighter">
                  {overallAccuracy}%
                </span>
              </div>
              <p className="text-sm font-bold opacity-80">
                {totalAnswers} 問中 {totalCorrect} 問正解
              </p>
            </div>

            <Link href="/dashboard/mistakes" className="qz-card p-8 group hover:border-qz-error transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-qz-text-light">Current Weaknesses</h3>
                <div className="w-10 h-10 bg-qz-error/10 text-qz-error rounded-xl flex items-center justify-center group-hover:bg-qz-error group-hover:text-white transition-colors">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-black italic tracking-tighter text-qz-error">
                  {uniqueIncorrectCount}
                </span>
                <span className="text-sm font-black text-qz-error uppercase">Questions</span>
              </div>
              <p className="text-sm font-bold text-qz-text-light group-hover:text-qz-error transition-colors">
                今すぐ復習して正解率を上げましょう
              </p>
            </Link>
          </div>

          {/* Categories Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-qz-border dark:border-[#2E3856] pb-4">
              <h2 className="text-2xl font-black italic tracking-tight uppercase">Category Stats</h2>
              <div className="px-3 py-1 bg-qz-bg dark:bg-[#2E3856] rounded-full border border-qz-border dark:border-[#2E3856]">
                <span className="text-[10px] font-black text-qz-text-light uppercase">Sorted by total</span>
              </div>
            </div>
            <CategoryList categories={categoryResults} />
          </section>
        </div>
      </main>
    </div>
  )
}
