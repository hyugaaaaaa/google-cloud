'use client'

import React, { useState, useTransition } from 'react'
import type { Question } from '@/types/app.types'
import { saveBulkHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions'
import { Header } from '@/components/common/Header'
import { ExamView } from '@/components/study/exam/ExamView'
import { ExamResultView } from '@/components/study/exam/ExamResultView'
import { useMockExam } from '@/hooks/useMockExam'
import { toast } from 'sonner'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { AlertCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type MockExamClientProps = {
  questions: (Question & { categoryName: string })[],
  userEmail?: string,
  streak?: number,
  initialBookmarkedIds?: string[],
  planTier?: 'free' | 'pro',
  xp?: number,
  level?: number,
}

const EXAM_TIME_LIMIT_SEC = 15 * 60 // 15分

export function MockExamClient({
  questions,
  userEmail,
  streak,
  initialBookmarkedIds = [],
  planTier = 'free',
  xp = 0,
  level = 1,
}: MockExamClientProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [, startBookmarkTransition] = useTransition();

  const {
    currentIndex,
    selectedOption,
    setSelectedOption,
    answers,
    isFinished,
    timeLeft,
    currentQuestion,
    totalQuestions,
    progress,
    nextQuestion,
    hasSavedSession,
    savedSessionMeta,
    resumeExam,
    startFreshExam,
    isInitialized,
  } = useMockExam<Question & { categoryName: string }>({
    questions,
    timeLimitSec: EXAM_TIME_LIMIT_SEC,
    persistenceKey: `cloudmaster:mock-exam:${userEmail || 'guest'}`,
    onFinish: async (finalAnswers) => {
      if (!userEmail) {
        toast.info("模擬試験完了！ログインすると結果を保存できます。", {
          description: "アカウント登録して成長を記録しましょう。",
        });
        return;
      }

      const records = finalAnswers.map(a => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        userAnswer: a.selectedOption
      }))
      const result = await saveBulkHistoryAction(records, 'mock');
      if ('error' in result && result.error) {
        toast.error("履歴の保存に失敗しました")
      } else {
        const gainedXp = 'xpAwarded' in result ? result.xpAwarded || 0 : 0;
        const leveledUp = 'newLevel' in result ? result.newLevel : undefined;
        toast.success(
          `試験結果を保存しました (+${gainedXp} XP)`,
          {
            description: leveledUp
              ? `Level ${leveledUp} に到達しました`
              : undefined,
          },
        )
      }
    }
  })

  const swipeHandlers = useSwipeNavigation({
    enabled: Boolean(selectedOption),
    onSwipeLeft: nextQuestion,
  });

  const handleToggleBookmark = (questionId: string) => {
    if (!userEmail) {
      toast.error("ブックマーク機能を利用するにはログインが必要です");
      return;
    }

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} planTier={planTier} />
      </div>
    );
  }

  if (hasSavedSession && savedSessionMeta) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} planTier={planTier} />
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <div className="qz-card p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-qz-blue/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-qz-blue">
              <RotateCcw className="h-4 w-4" />
              Resume Mock Exam
            </div>
            <h2 className="mt-4 text-2xl font-black">前回の模擬試験を再開しますか？</h2>
            <p className="mt-2 text-sm font-bold text-qz-text-light">
              {savedSessionMeta.current} / {savedSessionMeta.total} 問 • 残り {Math.ceil(savedSessionMeta.remainingSec / 60)} 分
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  resumeExam();
                }}
                className="qz-btn-primary flex-1"
              >
                続きから再開
              </button>
              <button
                type="button"
                onClick={startFreshExam}
                className="flex-1 rounded-xl border-2 border-qz-border px-4 py-3 font-black text-qz-text transition-colors hover:bg-qz-bg dark:border-[#2E3856] dark:text-white dark:hover:bg-[#2E3856]"
              >
                最初からやり直す
              </button>
            </div>

            {planTier !== 'pro' && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-qz-yellow/30 bg-qz-yellow/10 px-4 py-3 text-xs font-bold text-qz-text-light">
                <AlertCircle className="h-4 w-4 text-qz-yellow" />
                <p>
                  Freeプランは模擬試験の履歴分析が簡易表示です。
                  <Link href="/#pricing" className="ml-1 text-qz-blue underline">
                    Proで詳細分析を解放
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} planTier={planTier} />
        <ExamResultView 
          questions={questions}
          answers={answers}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header userEmail={userEmail} streak={streak} xp={xp} level={level} planTier={planTier} />
      
      {/* Sleek Progress Bar for Exam */}
      <div className="fixed top-[64px] left-0 w-full h-1 bg-qz-border dark:bg-[#2E3856] z-[60]">
        <div 
          className="bg-qz-yellow h-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center py-16 px-4 touch-pan-y" {...swipeHandlers}>
        <ExamView 
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onNext={nextQuestion}
          isBookmarked={bookmarkedIds.has(currentQuestion.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      </main>
    </div>
  )
}
