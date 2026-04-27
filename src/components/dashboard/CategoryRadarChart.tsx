'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Target } from 'lucide-react'

type CategoryResult = {
  name: string
  accuracy: number
}

type CategoryRadarChartProps = {
  categories: CategoryResult[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { subject: string }; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1A1D23] border border-qz-border dark:border-[#2E3856] p-3 rounded-xl shadow-lg backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-qz-blue mb-1">
          {payload[0].payload.subject}
        </p>
        <div className="flex items-end gap-1">
          <span className="text-lg font-black text-qz-text dark:text-white leading-none">
            {payload[0].value}
          </span>
          <span className="text-[10px] font-bold text-qz-text-light mb-0.5">% 正答率</span>
        </div>
      </div>
    )
  }
  return null
}

export function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  const isClient = typeof window !== 'undefined'
  const chartWrapperRef = useRef<HTMLDivElement | null>(null)
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!chartWrapperRef.current) return

    const element = chartWrapperRef.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const nextWidth = Math.max(0, Math.floor(entry.contentRect.width))
      const nextHeight = Math.max(0, Math.floor(entry.contentRect.height))
      setChartSize({ width: nextWidth, height: nextHeight })
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const chartData = categories.map((cat) => ({
    subject: cat.name,
    accuracy: cat.accuracy,
    fullMark: 100
  }))

  return (
    <div className="qz-card p-6 md:p-8 relative overflow-hidden">
      {/* Subtle blue glow matching the qz-blue accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-qz-blue/5 rounded-full blur-[60px] -mt-12 -mr-12 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Target className="w-4 h-4 text-qz-blue" />
        <h2 className="text-sm font-black uppercase tracking-widest text-qz-text dark:text-white">
          カテゴリ別正答率
        </h2>
      </div>

      {/* Chart */}
      <div ref={chartWrapperRef} className="w-full h-[280px] md:h-[360px] relative z-10">
        {!isClient ? null : chartData.length > 2 && chartSize.width > 0 && chartSize.height > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
              <PolarGrid
                gridType="circle"
                stroke="var(--qz-border)"
                strokeWidth={1}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--qz-text-light)', fontSize: 11, fontWeight: 700 }}
                tickSize={12}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="正答率"
                dataKey="accuracy"
                stroke="var(--qz-blue)"
                strokeWidth={2.5}
                fill="var(--qz-blue)"
                fillOpacity={0.18}
                dot={{ r: 3, fill: 'var(--qz-blue)', strokeWidth: 0 }}
                activeDot={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : chartData.length > 2 ? (
          <div className="w-full h-full flex items-center justify-center text-qz-text-light font-bold text-sm text-center px-4">
            チャートを読み込み中...
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-qz-text-light font-bold text-sm text-center px-4">
            レーダーチャートの表示には<br />3つ以上のカテゴリが必要です
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-2 relative z-10">
        <div className="w-3 h-3 rounded-full border-2 border-qz-blue bg-qz-blue/20"></div>
        <span className="text-[11px] font-bold text-qz-text-light">
          正答率（外側ほど高い）
        </span>
      </div>
    </div>
  )
}
