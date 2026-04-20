'use client'

import React from 'react'
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ResultViewProps {
  correctCount: number;
  totalCount: number;
  onReset: () => void;
  isSingleQuestion?: boolean;
  isGuest?: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({ 
  correctCount, 
  totalCount, 
  onReset, 
  isSingleQuestion = false,
  isGuest = false
}) => {
  const accuracy = Math.round((correctCount / totalCount) * 100);

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full qz-card p-10 text-center relative overflow-hidden transition-all duration-500 opacity-100 scale-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-qz-yellow"></div>
        
        <div className="w-24 h-24 bg-qz-yellow/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(255,205,31,0.3)]">
          <Trophy className="w-12 h-12 text-qz-yellow" />
        </div>
        
        <h2 className="text-4xl font-black text-qz-text dark:text-white mb-4 italic uppercase tracking-tighter">Excellent Work!</h2>
        <p className="text-qz-text-light font-bold mb-10">
          選択した {totalCount} 問の学習を完了しました。
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
            <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正解数</span>
            <span className="text-3xl font-black text-qz-success">{correctCount} <span className="text-sm font-bold text-qz-text-light">/ {totalCount}</span></span>
          </div>
          <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
            <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正答率</span>
            <span className="text-3xl font-black text-qz-blue">{accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onReset} className="flex-1 px-6 py-4 border-2 border-qz-border dark:border-[#2E3856] rounded-xl font-black text-qz-text dark:text-white hover:bg-qz-bg dark:hover:bg-[#2E3856] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <RotateCcw className="w-5 h-5" /> もう一度学習
          </button>
          <Link
            href={isGuest ? '/' : '/dashboard'}
            className="flex-1 qz-btn-primary flex items-center justify-center gap-2 shadow-lg shadow-qz-blue/20 active:scale-[0.98] transition-all"
          >
            {isGuest ? 'ホームに戻る' : isSingleQuestion ? 'ダッシュボードへ戻る' : '成績を見る'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
};
