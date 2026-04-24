'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Home, LayoutDashboard, Zap } from 'lucide-react'
import Link from 'next/link'
import { saveBulkHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions'
import { Header } from '@/components/common/Header'
import { QuestionCard } from '@/components/study/QuestionCard'
import { ExplanationArea } from '@/components/study/ExplanationArea'
import { useDailyChallenge } from '@/hooks/useDailyChallenge'
import { toast } from 'sonner'
import type { Question } from '@/types/app.types'

export function DailyChallengeClient({ 
  questions, 
  userEmail, 
  streak,
  isCompleted: initialCompleted, 
  dateString,
  initialBookmarkedIds = [],
  xp = 0,
  level = 1,
}: { 
  questions: Question[], 
  userEmail?: string, 
  streak?: number,
  isCompleted: boolean,
  dateString: string,
  initialBookmarkedIds?: string[],
  xp?: number,
  level?: number,
}) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [, startBookmarkTransition] = useTransition();

  const {
    currentIndex,
    selectedOption,
    showExplanation,
    isFinished,
    isSaving,
    answers,
    currentQuestion,
    totalQuestions,
    isCorrect,
    selectOption,
    nextQuestion
  } = useDailyChallenge({
    questions,
    initialCompleted,
    onFinish: async (finalAnswers) => {
      if (!userEmail) {
        toast.info("デイリーチャレンジ完了！ログインするとストリークを維持できます。", {
          description: "アカウント登録して毎日学習を続けましょう。",
        });
        return;
      }

      try {
        const result = await saveBulkHistoryAction(finalAnswers, 'daily');
        if ('error' in result && result.error) {
          toast.error("履歴の保存に失敗しました");
          return;
        }
        const gainedXp = 'xpAwarded' in result ? result.xpAwarded || 0 : 0;
        const leveledUp = 'newLevel' in result ? result.newLevel : undefined;
        toast.success(
          `チャレンジを記録しました (+${gainedXp} XP)`,
          {
            description: leveledUp
              ? `Level ${leveledUp} に到達しました`
              : undefined,
          },
        );
      } catch (error) {
        console.error("Failed to save daily history:", error);
        toast.error("履歴の保存に失敗しました");
      }
    }
  });

  const handleToggleBookmark = () => {
    if (!userEmail) {
      toast.error("ブックマーク機能を利用するにはログインが必要です");
      return;
    }

    if (!currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const isCurrentlyBookmarked = bookmarkedIds.has(questionId);

    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    startBookmarkTransition(async () => {
      const result = await toggleBookmarkAction(questionId);
      if (result.error) {
        toast.error("ブックマークの更新に失敗しました");
        // Rollback
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (isCurrentlyBookmarked) {
            next.add(questionId);
          } else {
            next.delete(questionId);
          }
          return next;
        });
      }
    });
  };

  if (isFinished) {
    const correctCount = answers.length > 0 
      ? answers.filter(a => a.isCorrect).length 
      : questions.length 

    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full qz-card p-10 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-qz-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-qz-yellow" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Daily Complete!</h2>
              <p className="text-qz-text-light font-bold">本日のチャレンジが完了しました</p>
              <p className="text-qz-blue font-black text-sm">{dateString}</p>
            </div>

            <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
              <span className="block text-[10px] font-black uppercase text-qz-text-light mb-2">本日のスコア</span>
              <span className="text-4xl font-black italic text-qz-blue">{correctCount} / {totalQuestions}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard" className="qz-btn-secondary py-4 flex items-center justify-center gap-2">
                <LayoutDashboard size={18} /> ダッシュボード
              </Link>
              <Link href="/" className="qz-btn-primary py-4 flex items-center justify-center gap-2">
                <Home size={18} /> ホームへ
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl flex-grow flex flex-col">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-qz-blue rounded-xl flex items-center justify-center shadow-lg shadow-qz-blue/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-none">デイリーチャレンジ</h2>
              <span className="text-[10px] font-bold text-qz-text-light uppercase tracking-widest">{dateString}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black italic text-qz-blue">{currentIndex + 1} / {totalQuestions}</span>
            <div className="w-32 h-2 bg-qz-border dark:bg-[#2E3856] rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-qz-blue"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-grow flex flex-col items-center">
          <AnimatePresence mode="wait">
            <QuestionCard 
              key={currentQuestion.id}
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelectOption={selectOption}
              isAnswered={showExplanation}
              isBookmarked={bookmarkedIds.has(currentQuestion.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          </AnimatePresence>

          <AnimatePresence>
            {showExplanation && (
              <ExplanationArea 
                isCorrect={isCorrect}
                explanation={currentQuestion.explanation}
                onNext={nextQuestion}
                isLoading={isSaving}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
