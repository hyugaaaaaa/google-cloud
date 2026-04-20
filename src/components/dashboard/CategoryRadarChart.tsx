'use client'

import React from 'react'
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C233A]/95 border border-[#4285F4]/30 p-3 rounded-xl shadow-[0_0_15px_rgba(66,133,244,0.15)] backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] mb-1">
          {payload[0].payload.subject}
        </p>
        <div className="flex items-end gap-1">
          <span className="text-lg font-black text-white leading-none">
            {payload[0].value}
          </span>
          <span className="text-[10px] font-bold text-gray-400 mb-0.5">% 正答率</span>
        </div>
      </div>
    )
  }
  return null
}

export function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  // レーダーチャート用のデータに整形
  const chartData = categories.map((cat) => ({
    subject: cat.name,
    accuracy: cat.accuracy,
    fullMark: 100
  }))

  return (
    <div className="w-full bg-gradient-to-br from-[#1A2235] to-[#151B2B] rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/10 rounded-full blur-[80px] -mt-20 -mr-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4285F4]/5 rounded-full blur-[80px] -mb-20 -ml-20 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Target className="w-5 h-5 text-[#4285F4]" />
        <h2 className="text-lg md:text-xl font-black text-[#4285F4] tracking-tight">
          カテゴリ別正答率
        </h2>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[300px] md:h-[400px] relative z-10">
        {chartData.length > 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid 
                gridType="circle" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth={1}
                polarRadius={[20, 40, 60, 80, 100]} 
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#A0ABC0', fontSize: 11, fontWeight: 700 }}
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
                stroke="#4285F4"
                strokeWidth={3}
                fill="#4285F4"
                fillOpacity={0.25}
                activeDot={{ r: 6, fill: "#4285F4", stroke: "#1A2235", strokeWidth: 2 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-qz-text-light font-bold text-sm">
            レーダーチャートを表示するには、3つ以上のカテゴリのデータが必要です。
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
        <div className="w-3 h-3 rounded-full border-2 border-[#4285F4] bg-transparent"></div>
        <span className="text-[11px] md:text-xs font-bold text-gray-400">
          正答率（外側ほど高い）
        </span>
      </div>
    </div>
  )
}
