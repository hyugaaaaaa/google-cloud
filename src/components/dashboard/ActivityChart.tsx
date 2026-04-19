'use client'

import React from 'react'

type DailyActivity = {
  day: string
  count: number
  isToday: boolean
}

type ActivityChartProps = {
  data: DailyActivity[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  // データが空の場合のガード
  if (!data || data.length === 0) return <div className="hidden" />;

  const maxCount = Math.max(...data.map(d => d.count), 5)

  return (
    <div className="qz-card p-8 h-full flex flex-col">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-qz-text dark:text-white">Weekly Activity</h3>
          <p className="text-[10px] font-bold text-qz-text-light opacity-60">過去7日間の学習状況</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-qz-blue shadow-[0_0_8px_rgba(66,85,255,0.4)]"></div>
            <span className="text-[10px] font-black text-qz-text dark:text-white uppercase tracking-wider">解答数</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 min-h-[180px] relative mt-4">
        {data.map((day, idx) => {
          const heightPercent = Math.min((day.count / maxCount) * 100, 100);
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
              {/* Question Count at the TOP */}
              <span className={`text-[10px] font-black transition-all duration-300 ${
                day.isToday ? 'text-qz-blue' : 'text-qz-text-light opacity-80 group-hover:opacity-100'
              }`}>
                {day.count}
              </span>

              {/* Bar - Balanced rounded top (rounded-t-xl) */}
              <div 
                className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ease-out relative ${
                  day.isToday 
                  ? 'bg-qz-blue shadow-[0_0_15px_rgba(66,85,255,0.3)]' 
                  : 'bg-qz-blue/20 dark:bg-qz-blue/30 group-hover:bg-qz-blue/50'
                }`}
                style={{ height: `${heightPercent}%` }}
              >
                {/* Subtle highlight for today */}
                {day.isToday && (
                  <div className="absolute inset-0 bg-white/10 rounded-t-xl opacity-30"></div>
                )}
              </div>
              
              {/* Day Label */}
              <span className={`text-[10px] font-black uppercase tracking-tighter shrink-0 mt-1 ${
                day.isToday ? 'text-qz-blue' : 'text-qz-text-light opacity-60'
              }`}>
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )
}
