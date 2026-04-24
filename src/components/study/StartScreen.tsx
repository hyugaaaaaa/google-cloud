'use client'

import React from 'react'
import { Zap, ArrowRight, RotateCcw, XCircle } from 'lucide-react'
import Link from 'next/link'

interface StartScreenProps {
  totalQuestions: number;
  onStart: (config: { count: number; source: 'all' | 'incorrect' }) => void;
  incorrectQuestionCount?: number;
  hasSavedSession?: boolean;
  savedSessionMeta?: { current: number; total: number } | null;
  onResumeSession?: () => void;
  onDiscardSession?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  totalQuestions,
  onStart,
  incorrectQuestionCount = 0,
  hasSavedSession = false,
  savedSessionMeta = null,
  onResumeSession,
  onDiscardSession,
}) => {
  const modes = [
    { count: 10, label: "クイック", desc: "隙間時間に最適", icon: <Zap className="w-5 h-5 text-qz-blue" /> },
    { count: 20, label: "スタンダード", desc: "しっかり確認" },
    { count: 40, label: "チャレンジ", desc: "全問マスター" },
    { count: totalQuestions, label: "すべて", desc: "網羅的に学習", primary: true },
  ].filter((mode) => mode.count <= totalQuestions);

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full qz-card p-10 text-center transition-all duration-500 opacity-100 translate-y-0">
        {hasSavedSession && savedSessionMeta && (
          <div className="mb-8 rounded-2xl border border-qz-blue/20 bg-qz-blue/5 p-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-qz-blue">
                  <RotateCcw className="h-4 w-4" />
                  セッションを再開
                </div>
                <p className="mt-2 text-sm font-bold text-qz-text-light">
                  {savedSessionMeta.current} / {savedSessionMeta.total} 問まで進んでいます。
                </p>
              </div>
              <button
                type="button"
                onClick={onDiscardSession}
                className="rounded-lg p-2 text-qz-text-light hover:bg-qz-error/10 hover:text-qz-error transition-colors"
                aria-label="保存済みセッションを破棄"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onResumeSession}
              className="mt-4 qz-btn-primary w-full flex items-center justify-center gap-2"
            >
              続きから再開 <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

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
              onClick={() => onStart({ count: mode.count, source: 'all' })}
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
                {mode.count >= totalQuestions ? `全 ${totalQuestions} 問` : `${mode.count} 問`} • {mode.desc}
              </p>
            </button>
          ))}
        </div>

        {incorrectQuestionCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onStart({
                count: incorrectQuestionCount,
                source: 'incorrect',
              })
            }
            className="mb-6 w-full rounded-2xl border-2 border-qz-error/20 bg-qz-error/5 p-5 text-left transition-colors hover:border-qz-error/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-qz-error">Review Incorrect Only</p>
                <p className="mt-1 text-sm font-bold text-qz-text-light">
                  現在の苦手 {incorrectQuestionCount} 問だけを集中復習
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-qz-error" />
            </div>
          </button>
        )}

        <Link href="/" className="text-qz-text-light font-bold hover:text-qz-blue transition-colors text-sm">
          キャンセルしてホームに戻る
        </Link>
      </div>
    </main>
  );
};
