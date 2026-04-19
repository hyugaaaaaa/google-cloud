'use client'

import React from 'react'
import { Trophy, LayoutDashboard, AlertCircle, CheckCircle2, XCircle, Star } from 'lucide-react'
import Link from 'next/link'
import type { Question } from '@/types/app.types'

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  selectedOption: string;
}

interface ExamResultViewProps {
  questions: (Question & { categoryName: string })[];
  answers: AnswerRecord[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  questions,
  answers,
  bookmarkedIds,
  onToggleBookmark
}) => {
  const correctCount = answers.filter(a => a.isCorrect).length
  const totalQuestions = questions.length
  const score = Math.round((correctCount / totalQuestions) * 100)

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div 
        className="qz-card p-10 mb-12 text-center relative overflow-hidden transition-all duration-500 opacity-100 translate-y-0"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-qz-blue"></div>
        <div className="w-24 h-24 bg-qz-blue/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Trophy className="w-12 h-12 text-qz-blue" />
        </div>
        
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Exam Completed!</h1>
        <p className="text-qz-text-light font-bold mb-10">お疲れ様でした。試験の結果は以下の通りです。</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
            <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">スコア</span>
            <span className="text-4xl font-black italic">{score}%</span>
          </div>
          <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
            <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正解</span>
            <span className="text-4xl font-black text-qz-success italic">{correctCount} <span className="text-sm font-bold text-qz-text-light">/ {totalQuestions}</span></span>
          </div>
          <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
            <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">ステータス</span>
            <span className={`text-xl font-black uppercase tracking-tighter ${score >= 70 ? 'text-qz-success' : 'text-qz-error'}`}>
              {score >= 70 ? '合格圏内' : '修行が必要'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/" className="px-8 py-4 border-2 border-qz-border dark:border-[#2E3856] rounded-xl font-black text-qz-text dark:text-white hover:bg-qz-bg dark:hover:bg-[#2E3856] transition-all flex items-center justify-center gap-2 active:scale-95">
            トップに戻る
          </Link>
          <Link href="/dashboard" className="qz-btn-primary px-8 py-4 flex items-center justify-center gap-3 active:scale-95 transition-all">
            成績を分析する <LayoutDashboard className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-black flex items-center gap-3 border-b border-qz-border dark:border-[#2E3856] pb-4">
          <AlertCircle className="text-qz-blue w-6 h-6" /> 
          解答の振り返り
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          {questions.map((q, idx) => {
            const answerRecord = answers.find(a => a.questionId === q.id)
            const isCorrect = answerRecord?.isCorrect || false
            const isBookmarked = bookmarkedIds.has(q.id)
            
            return (
              <div key={q.id} className="qz-card group overflow-hidden relative">
                <button
                  onClick={() => onToggleBookmark(q.id)}
                  className={`absolute top-12 right-6 p-2 rounded-full transition-all duration-300 z-10 active:scale-90 ${
                    isBookmarked 
                      ? 'bg-qz-yellow text-white shadow-lg' 
                      : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light hover:text-qz-yellow hover:bg-qz-yellow/10'
                  }`}
                >
                  <Star size={20} className={isBookmarked ? 'fill-white' : ''} />
                </button>

                <div className={`px-6 py-3 font-black text-xs uppercase tracking-widest flex justify-between items-center ${
                  isCorrect ? 'bg-qz-success/10 text-qz-success' : 'bg-qz-error/10 text-qz-error'
                }`}>
                  <span>Question {idx + 1} • {q.categoryName}</span>
                  <div className="flex items-center gap-2 mr-10">
                    {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-xl font-bold text-qz-text dark:text-white mb-8 leading-relaxed max-w-[90%]">
                    {q.content}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answerRecord?.selectedOption === opt
                      const isActualAnswer = q.answer === opt
                      
                      let optClass = "flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-[15px] "
                      
                      if (isActualAnswer) {
                        optClass += "border-qz-success bg-qz-success/5 text-qz-success"
                      } else if (isSelected && !isActualAnswer) {
                        optClass += "border-qz-error bg-qz-error/5 text-qz-error"
                      } else {
                        optClass += "border-qz-border dark:border-[#2E3856] opacity-40"
                      }
                      
                      return (
                        <div key={oIdx} className={optClass}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            isActualAnswer ? 'bg-qz-success text-white' : isSelected ? 'bg-qz-error text-white' : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1">{opt}</span>
                          {isActualAnswer && <span className="text-[10px] font-black uppercase">Correct</span>}
                          {isSelected && !isActualAnswer && <span className="text-[10px] font-black uppercase">Your Choice</span>}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="bg-qz-blue/5 dark:bg-[#2E3856] rounded-2xl p-6 border border-qz-blue/10">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-qz-blue mb-2">
                      <CheckCircle2 size={14} /> Explanation
                    </h4>
                    <p className="text-[15px] font-bold text-qz-text dark:text-white leading-relaxed italic">
                      {q.explanation || '解説がまだ登録されていません。'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
};
