'use client'

import React from 'react'
import { RotateCcw, ChevronRight, BarChart3 } from 'lucide-react'
import Link from 'next/link'

type CategoryResult = {
  id: string
  name: string
  total: number
  correct: number
  accuracy: number
  lastActivity: string | null
  uniqueWrongCount: number
}

type CategoryListProps = {
  categories: CategoryResult[]
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <div key={cat.id} className="qz-card p-6 flex items-center justify-between group hover:border-qz-blue transition-all duration-300">
          <div className="flex-1">
            <h3 className="text-lg font-black italic uppercase tracking-tight mb-1 group-hover:text-qz-blue transition-colors">
              {cat.name}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-qz-success"></div>
                <span className="text-[10px] font-black text-qz-text-light uppercase">Accuracy</span>
                <span className="text-xs font-black text-qz-success">{cat.accuracy}%</span>
              </div>
              <div className="h-3 w-px bg-qz-border dark:bg-[#2E3856]"></div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-qz-text-light uppercase">
                  {cat.total} 解答
                </span>
                {cat.lastActivity && (
                  <span 
                    className="text-[10px] font-bold text-qz-text-light flex items-center gap-1"
                    suppressHydrationWarning
                  >
                    <RotateCcw size={10} />
                    {new Date(cat.lastActivity).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {cat.uniqueWrongCount > 0 && (
              <div className="px-3 py-1 bg-qz-error/10 text-qz-error rounded-full border border-qz-error/20">
                <span className="text-[10px] font-black uppercase">Review: {cat.uniqueWrongCount}</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center text-qz-text-light group-hover:bg-qz-blue group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
