'use client'

import Link from 'next/link'
import { Brain, ArrowRight } from 'lucide-react'

type WeaknessInsight = {
  id: string
  name: string
  accuracy: number
  wrongCount: number
  recommendation: string
  studyPath: string
  priority: 'high' | 'medium' | 'low'
}

type WeaknessInsightsProps = {
  insights: WeaknessInsight[]
}

const priorityStyles: Record<WeaknessInsight['priority'], string> = {
  high: 'border-qz-error/30 bg-qz-error/5 text-qz-error',
  medium: 'border-qz-yellow/40 bg-qz-yellow/10 text-qz-text',
  low: 'border-qz-success/30 bg-qz-success/10 text-qz-success',
}

export function WeaknessInsights({ insights }: WeaknessInsightsProps) {
  return (
    <section className="qz-card p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-qz-blue">
            <Brain className="h-4 w-4" />
            Weakness Analysis
          </div>
          <h3 className="mt-2 text-xl font-black">次に解くべき優先カテゴリ</h3>
        </div>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm font-bold text-qz-text-light">十分な履歴がまだないため、分析結果は次回の学習後に表示されます。</p>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="rounded-2xl border border-qz-border bg-white p-4 dark:border-[#2E3856] dark:bg-[#1A1D23]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-black">{insight.name}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${priorityStyles[insight.priority]}`}>
                  {insight.priority}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-qz-text-light">正答率 {insight.accuracy}% • 苦手 {insight.wrongCount} 問</p>
              <p className="mt-3 text-sm font-bold text-qz-text dark:text-white">{insight.recommendation}</p>
              <Link href={insight.studyPath} className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-qz-blue">
                このカテゴリを学習 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
