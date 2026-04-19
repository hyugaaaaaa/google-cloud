'use client'

import React from 'react'
import { Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface StartScreenProps {
  totalQuestions: number;
  onStart: (count: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ totalQuestions, onStart }) => {
  const modes = [
    { count: 10, label: "クイック", desc: "隙間時間に最適", icon: <Zap className="w-5 h-5 text-qz-blue" /> },
    { count: 20, label: "スタンダード", desc: "しっかり確認" },
    { count: 40, label: "チャレンジ", desc: "全問マスター" },
    { count: -1, label: "すべて", desc: "網羅的に学習", primary: true },
  ];

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full qz-card p-10 text-center transition-all duration-500 opacity-100 translate-y-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-qz-blue/10 text-qz-blue text-xs font-black rounded-full mb-6 uppercase tracking-widest">
          Study Mode
        </div>
        <h2 className="text-3xl font-black text-qz-text dark:text-white mb-4 leading-tight">
          学習を始めましょう
        </h2>
        <p className="text-qz-text-light font-bold mb-10">
          解きたい問題数を選択してください。問題はランダムに出題されます。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          {modes.map((mode) => (
            <button
              key={mode.count}
              onClick={() => onStart(mode.count)}
              className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group active:scale-[0.98] ${
                mode.primary 
                ? "bg-qz-blue border-qz-blue text-white shadow-xl shadow-qz-blue/20" 
                : "bg-white dark:bg-[#2E3856] border-qz-border dark:border-qz-border hover:border-qz-blue"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  {mode.icon}
                  <span className={`text-xl font-black ${mode.primary ? "text-white" : "text-qz-text dark:text-white"}`}>
                    {mode.label}
                  </span>
                </div>
                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${mode.primary ? "text-white" : "text-qz-blue"}`} />
              </div>
              <p className={`text-sm font-bold ${mode.primary ? "text-white/80" : "text-qz-text-light"}`}>
                {mode.count === -1 ? `全 ${totalQuestions} 問` : `${mode.count} 問`} • {mode.desc}
              </p>
            </button>
          ))}
        </div>

        <Link href="/" className="text-qz-text-light font-bold hover:text-qz-blue transition-colors text-sm">
          キャンセルしてホームに戻る
        </Link>
      </div>
    </main>
  );
};
