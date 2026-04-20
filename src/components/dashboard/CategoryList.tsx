'use client'

import React from 'react'
import { RotateCcw, ChevronRight, CheckCircle2, Target } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type CategoryResult = {
  id: string
  encryptedId: string
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((cat) => {
        return (
          <div key={cat.id}>
            <Link 
              href={`/category/${cat.encryptedId}`}
              className="qz-card p-6 flex flex-col gap-6 group hover:border-qz-blue transition-colors duration-200 relative overflow-hidden h-full"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-qz-blue/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-qz-blue/10 transition-colors"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-qz-blue/10 text-qz-blue text-[8px] font-black uppercase tracking-widest rounded">Category</span>
                    {cat.uniqueWrongCount > 0 && (
                      <span className="px-2 py-0.5 bg-qz-error/10 text-qz-error text-[8px] font-black uppercase tracking-widest rounded">
                        {cat.uniqueWrongCount} Weaknesses
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-qz-blue transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center text-qz-text-light group-hover:bg-qz-blue group-hover:text-white transition-colors">
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-qz-success" />
                    <span className="text-[10px] font-black text-qz-text-light uppercase tracking-widest">Accuracy</span>
                  </div>
                  <span className="text-lg font-black italic text-qz-success leading-none">{cat.accuracy}%</span>
                </div>
                <div className="w-full h-2 bg-qz-bg dark:bg-[#2E3856] rounded-full overflow-hidden border border-qz-border dark:border-[#2E3856]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.accuracy}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-qz-success"
                  />
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-qz-border dark:border-[#2E3856] relative z-10 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-qz-text-light">
                    <Target size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{cat.total} 解答</span>
                  </div>
                  {cat.lastActivity && (
                    <div className="flex items-center gap-1.5 text-qz-text-light">
                      <RotateCcw size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight" suppressHydrationWarning>
                        {new Date(cat.lastActivity).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
                
                <span className="text-[10px] font-black text-qz-blue uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4">
                  Study Now
                </span>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
