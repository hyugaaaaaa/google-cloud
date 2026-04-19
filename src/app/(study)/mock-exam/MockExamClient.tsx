'use client'

import React, { useState, useTransition } from 'react'
import type { Question } from '@/types/app.types'
import { saveBulkHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions'
import { Header } from '@/components/common/Header'
import { ExamView } from '@/components/study/exam/ExamView'
import { ExamResultView } from '@/components/study/exam/ExamResultView'
import { useMockExam } from '@/hooks/useMockExam'
import { toast } from 'sonner'

type MockExamClientProps = {
  questions: (Question & { categoryName: string })[],
  userEmail?: string,
  streak?: number,
  initialBookmarkedIds?: string[]
}

const EXAM_TIME_LIMIT_SEC = 15 * 60 // 15分

export function MockExamClient({ questions, userEmail, streak, initialBookmarkedIds = [] }: MockExamClientProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [isBookmarkPending, startBookmarkTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false)

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
    nextQuestion
  } = useMockExam({
    questions,
    timeLimitSec: EXAM_TIME_LIMIT_SEC,
    onFinish: async (finalAnswers) => {
      setIsSaving(true)
      const records = finalAnswers.map(a => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        userAnswer: a.selectedOption
      }))
      const { error } = await saveBulkHistoryAction(records, 'mock');
      setIsSaving(false)
      if (error) {
        toast.error("履歴の保存に失敗しました")
      } else {
        toast.success("試験結果を保存しました")
      }
    }
  })

  const handleToggleBookmark = (questionId: string) => {
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
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} />
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
      <Header userEmail={userEmail} streak={streak} />
      
      {/* Sleek Progress Bar for Exam */}
      <div className="fixed top-[64px] left-0 w-full h-1 bg-qz-border dark:bg-[#2E3856] z-[60]">
        <div 
          className="bg-qz-yellow h-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center py-16 px-4">
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
