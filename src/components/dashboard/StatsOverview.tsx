'use client'

import React from 'react'
import { Zap, Star, TrendingUp } from 'lucide-react'

type StatsOverviewProps = {

  overallAccuracy: number
  streak: number
  solvedToday: number
}

export function StatsOverview({ overallAccuracy, streak, solvedToday }: StatsOverviewProps) {
  const stats = [
    { 
      label: 'Solved Today', 
      value: solvedToday, 
      icon: <Zap size={20} />, 
      color: 'text-qz-blue', 
      bg: 'bg-qz-blue/10',
      trend: '+12% from yesterday'
    },
    { 
      label: 'Total Accuracy', 
      value: `${overallAccuracy}%`, 
      icon: <Star size={20} />, 
      color: 'text-qz-success', 
      bg: 'bg-qz-success/10',
      trend: 'Top 5% of users'
    },
    { 
      label: 'Current Streak', 
      value: `${streak} Days`, 
      icon: <TrendingUp size={20} />, 
      color: 'text-qz-yellow', 
      bg: 'bg-qz-yellow/10',
      trend: 'Keep it going!'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="qz-card p-6 flex flex-col justify-between group transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
              {stat.icon}
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-qz-text-light opacity-60">
                {stat.label}
              </h4>
              <p className="text-2xl font-black italic tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${stat.color} animate-pulse`}></div>
            <span className="text-[9px] font-bold text-qz-text-light uppercase tracking-widest opacity-60">
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
