'use client'

import React from 'react'
import { ChevronRight, Target } from 'lucide-react'
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.map((cat) => {
        return (
          <div key={cat.id}>
            <Link 
              href={`/category/${cat.encryptedId}`}
              className="qz-card p-4 flex flex-col gap-3 group hover:border-qz-blue transition-colors duration-200 relative overflow-hidden h-full"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h3 className="text-sm font-black italic uppercase tracking-tighter group-hover:text-qz-blue transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.uniqueWrongCount > 0 && (
                    <span className="inline-block px-1.5 py-0.5 bg-qz-error/10 text-qz-error text-[8px] font-black uppercase tracking-widest rounded">
                      {cat.uniqueWrongCount} Weaknesses
                    </span>
                  )}
                </div>
                <div className="w-6 h-6 rounded-lg bg-qz-bg dark:bg-[#2E3856] flex flex-shrink-0 items-center justify-center text-qz-text-light group-hover:bg-qz-blue group-hover:text-white transition-colors">
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2 relative z-10 mt-auto">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1">
                    <Target size={10} className="text-qz-text-light" />
                    <span className="text-[9px] font-bold text-qz-text-light uppercase tracking-widest">{cat.total} 解答</span>
                  </div>
                  <span className="text-sm font-black italic text-qz-success leading-none">{cat.accuracy}%</span>
                </div>
                <div className="w-full h-1.5 bg-qz-bg dark:bg-[#2E3856] rounded-full overflow-hidden border border-qz-border dark:border-[#2E3856]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.accuracy}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-qz-success"
                  />
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
