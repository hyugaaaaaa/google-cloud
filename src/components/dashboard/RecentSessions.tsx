'use client'

import React from 'react'
import { Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type SessionItem = {
  id: string
  questionId: string
  encryptedQuestionId: string
  catName: string
  isCorrect: boolean
  createdAt: string
  mode: string
}

type RecentSessionsProps = {
  sessions: SessionItem[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) return <div className="hidden" />

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-qz-border dark:border-[#2E3856] pb-4">
        <div className="flex items-center gap-3">
          <Clock className="text-qz-blue w-5 h-5" />
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Recent Activity</h2>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id}>
            <Link 
              href={`/review/${session.encryptedQuestionId}`}
              className="qz-card p-4 flex items-center justify-between group hover:border-qz-blue transition-colors duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  session.isCorrect ? 'bg-qz-success/10 text-qz-success' : 'bg-qz-error/10 text-qz-error'
                }`}>
                  {session.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black italic uppercase tracking-tight group-hover:text-qz-blue transition-colors truncate">
                      {session.catName}
                    </h4>
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-qz-bg dark:bg-[#2E3856] text-[8px] font-black uppercase rounded text-qz-text-light">
                      {session.mode}
                    </span>
                  </div>
                  <p suppressHydrationWarning className="text-[10px] font-bold text-qz-text-light opacity-60">
                    {new Date(session.createdAt).toLocaleString('ja-JP', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* 常に場所を確保し、不透明度だけを変えることでレイアウトシフトを防ぐ */}
                <div className="flex items-center gap-1 text-[10px] font-black text-qz-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <RotateCcw size={12} /> Retake
                </div>
                <div className="w-8 h-8 rounded-full bg-qz-bg dark:bg-[#2E3856] flex items-center justify-center text-qz-text-light group-hover:bg-qz-blue group-hover:text-white transition-colors">
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Link 
          href="/review"
          className="text-[10px] font-black uppercase tracking-widest text-qz-text-light hover:text-qz-blue transition-colors"
        >
          View All History / Review Mistakes
        </Link>
      </div>
    </section>
  )
}
