'use client'

import React, { useMemo, useState } from 'react'
import { Trophy, LayoutDashboard, AlertCircle, CheckCircle2, XCircle, Star } from 'lucide-react'
import Link from 'next/link'
import type { Question } from '@/types/app.types'
import { buildStructuredExplanation } from '@/lib/explanations'

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
  const [reviewMode, setReviewMode] = useState<'all' | 'incorrect'>('all');

  const correctCount = answers.filter(a => a.isCorrect).length
  const totalQuestions = questions.length
  const score = Math.round((correctCount / totalQuestions) * 100)

  const incorrectQuestionIds = useMemo(
    () => new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId)),
    [answers],
  );

  const reviewedQuestions = useMemo(() => {
    if (reviewMode === 'all') return questions;
    return questions.filter((question) => incorrectQuestionIds.has(question.id));
  }, [incorrectQuestionIds, questions, reviewMode]);

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

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReviewMode('all')}
            className={`rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              reviewMode === 'all'
                ? 'border-qz-blue bg-qz-blue text-white'
                : 'border-qz-border bg-white text-qz-text-light hover:border-qz-blue dark:border-[#2E3856] dark:bg-[#1A1D23]'
            }`}
          >
            全ての問題 ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setReviewMode('incorrect')}
            className={`rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              reviewMode === 'incorrect'
                ? 'border-qz-error bg-qz-error text-white'
                : 'border-qz-border bg-white text-qz-text-light hover:border-qz-error dark:border-[#2E3856] dark:bg-[#1A1D23]'
            }`}
          >
            間違いのみ ({incorrectQuestionIds.size})
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {reviewedQuestions.map((q, idx) => {
            const answerRecord = answers.find(a => a.questionId === q.id)
            const isCorrect = answerRecord?.isCorrect || false
            const isBookmarked = bookmarkedIds.has(q.id)
            const structured = buildStructuredExplanation(q)
            
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
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-qz-blue">
                        <CheckCircle2 size={14} /> Explanation
                      </h4>
                      <div className="px-3 py-1 bg-qz-success/10 text-qz-success text-xs font-black rounded-lg border border-qz-success/20">
                        正解: {String.fromCharCode(65 + q.options.indexOf(q.answer))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-qz-success mb-1">Why Correct</p>
                        <p className="text-[15px] font-bold text-qz-text dark:text-white leading-relaxed">
                          {structured.whyCorrect}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-qz-error mb-1">Why Others Are Wrong</p>
                        <p className="text-[15px] font-bold text-qz-text dark:text-white leading-relaxed">
                          {structured.whyOthersWrong}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {structured.relatedConcepts.map((concept) => (
                          <span
                            key={`${q.id}-${concept}`}
                            className="rounded-full border border-qz-blue/20 bg-white px-3 py-1 text-[10px] font-black text-qz-blue dark:bg-[#1A1D23]"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
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
