import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { encrypt } from '@/lib/crypto'

interface CategoryCardProps {
  id: string
  name: string
  questionCount: number
  isAuthenticated: boolean
}

export function CategoryCard({ id, name, questionCount, isAuthenticated }: CategoryCardProps) {
  const href = `/category/${encrypt(id)}`

  return (
    <Link href={href} className="group block h-full">
      <div className="qz-card p-3 md:p-8 h-full flex flex-col justify-between group-hover:border-qz-blue/50 transition-all duration-300 hover:shadow-xl hover:shadow-qz-blue/5">
        <div className="space-y-2 md:space-y-6">
          <div className="flex items-center justify-between">
            <span className="hidden md:inline-block px-3 py-1 bg-qz-bg dark:bg-[#2E3856] text-qz-text-light text-[10px] font-black rounded uppercase tracking-widest border border-qz-border dark:border-[#2E3856]">
              Google Cloud CDL
            </span>
            <div className="px-2 py-0.5 md:py-2 bg-qz-blue/10 text-qz-blue text-[9px] md:text-xs font-black rounded-lg">
              {questionCount} 問
            </div>
          </div>
          <h3 className="text-sm md:text-2xl font-black leading-tight group-hover:text-qz-blue transition-colors">
            {name}
          </h3>
        </div>
        
        <div className="mt-4 md:mt-10 flex items-center justify-between">
          <span className="text-qz-blue text-[10px] md:text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 md:gap-2">
            学習を開始 <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </span>
          <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center group-hover:bg-qz-blue group-hover:text-white transition-all">
            <ArrowRight className="w-3 h-3 md:w-5 md:h-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
