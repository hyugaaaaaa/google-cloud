'use client'

import React from 'react'
import { Trophy, Zap, Target, CheckCircle2 } from 'lucide-react'

type AchievementProps = {
  streak: number
  totalAnswers: number
  hasPerfectScore: boolean
  hasCompletedMock: boolean
}

export function Achievements({ streak, totalAnswers, hasPerfectScore, hasCompletedMock }: AchievementProps) {
  const badges = [
    { 
      id: 'streak_7', 
      name: 'Early Bird', 
      color: 'text-qz-yellow', 
      bg: 'bg-qz-yellow/10',
      unlocked: streak >= 7,
      desc: '7日連続学習達成'
    },
    { 
      id: 'century', 
      name: 'Century Maker', 
      color: 'text-qz-blue', 
      bg: 'bg-qz-blue/10',
      unlocked: totalAnswers >= 100,
      desc: '累計100問解答'
    },
    { 
      id: 'perfect', 
      name: 'Perfect Ace', 
      color: 'text-qz-success', 
      bg: 'bg-qz-success/10',
      unlocked: hasPerfectScore,
      desc: '正解率100%達成'
    },
    { 
      id: 'mock_master', 
      name: 'Mock Master', 
      color: 'text-qz-blue', 
      bg: 'bg-qz-blue/10',
      unlocked: hasCompletedMock,
      desc: '模擬試験を完走'
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 border-b border-qz-border dark:border-[#2E3856] pb-4 mb-6">
        <Trophy className="text-qz-yellow w-6 h-6" />
        <h2 className="text-2xl font-black italic tracking-tight">Achievements</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div key={badge.id} className={`group relative qz-card p-6 flex flex-col items-center text-center transition-all duration-500 ${badge.unlocked ? 'border-qz-border opacity-100 scale-100' : 'opacity-30 grayscale blur-[1px]'}`}>
            <div className={`w-16 h-16 rounded-2xl ${badge.bg} flex items-center justify-center mb-4 shadow-inner`}>
              {badge.id === 'streak_7' && <Zap className={`w-8 h-8 ${badge.color}`} />}
              {badge.id === 'century' && <Target className={`w-8 h-8 ${badge.color}`} />}
              {badge.id === 'perfect' && <CheckCircle2 className={`w-8 h-8 ${badge.color}`} />}
              {badge.id === 'mock_master' && <Trophy className={`w-8 h-8 ${badge.color}`} />}
            </div>
            <h4 className="font-black text-xs uppercase tracking-tighter mb-1">{badge.name}</h4>
            
            {/* モバイル用表示（PCでは非表示） */}
            <p className="text-[10px] font-bold text-qz-text-light md:hidden">{badge.desc}</p>

            {/* PC用ホバーツールチップ */}
            <div className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-qz-text dark:bg-white text-white dark:text-qz-text text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-1 transition-all z-20 pointer-events-none shadow-xl">
              {badge.desc}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-qz-text dark:bg-white rotate-45"></div>
            </div>
            {badge.unlocked && (
              <div className="mt-3 md:mt-2 px-2 py-0.5 bg-qz-success text-white text-[8px] font-black rounded-full animate-bounce">
                UNLOCKED
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
