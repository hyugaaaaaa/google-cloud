"use client";

import React, { useMemo, useState, useTransition } from 'react';
import { QuestionCard } from '@/components/study/QuestionCard';
import { ExplanationArea } from '@/components/study/ExplanationArea';
import { ProgressBar } from '@/components/study/ProgressBar';
import { StartScreen } from '@/components/study/StartScreen';
import { ResultView } from '@/components/study/ResultView';
import { Header } from '@/components/common/Header';
import type { Question } from '@/types/app.types';
import { saveHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions';
import { useQuiz } from '@/hooks/useQuiz';
import Link from 'next/link';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { buildStructuredExplanation } from '@/lib/explanations';

export function StudyClient({ 
  questions, 
  userEmail, 
  streak,
  initialBookmarkedIds = [],
  incorrectQuestionIds = [],
  sessionKey,
  xp = 0,
  level = 1,
}: { 
  questions: Question[], 
  userEmail?: string,
  streak?: number,
  initialBookmarkedIds?: string[],
  incorrectQuestionIds?: string[],
  sessionKey?: string,
  xp?: number,
  level?: number,
}) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [, startTransition] = useTransition();
  const [, startBookmarkTransition] = useTransition();

  const incorrectQuestions = useMemo(
    () => questions.filter((question) => incorrectQuestionIds.includes(question.id)),
    [incorrectQuestionIds, questions],
  );

  const {
    isStarted,
    quizQuestions,
    currentIndex,
    selectedOption,
    isFinished,
    correctCount,
    currentQuestion,
    isAnswered,
    startQuiz,
    selectOption,
    nextQuestion,
    resetQuiz,
    hasSavedSession,
    savedSessionMeta,
    resumeQuiz,
    discardSavedSession,
  } = useQuiz({
    questions,
    persistenceKey: sessionKey,
    onAnswer: (questionId, isCorrect, option, currentIndex, totalQuestions) => {
      if (!userEmail) {
        if (currentIndex === 0 || currentIndex === totalQuestions - 1) {
          toast.info("ログインすると学習履歴を保存できます！", {
            description: "アカウント登録して進捗を記録しましょう。",
            id: "guest-toast"
          });
        }
        return;
      }

      startTransition(async () => {
        try {
          const result = await saveHistoryAction(questionId, isCorrect, option);
          if ('xpAwarded' in result && result.xpAwarded) {
            toast.success(
              `${isCorrect ? '正解' : '記録完了'} • +${result.xpAwarded} XP`,
              {
                description: result.newLevel
                  ? `Level ${result.newLevel} に到達しました`
                  : undefined,
              },
            );
            return;
          }
          toast.success(isCorrect ? "正解！履歴を保存しました" : "残念！履歴を保存しました");
        } catch (error) {
          console.error("Failed to save history:", error);
          toast.error("保存に失敗しました");
        }
      });
    }
  });

  const swipeHandlers = useSwipeNavigation({
    enabled: isAnswered,
    onSwipeLeft: nextQuestion,
  });

  const handleStart = ({ count, source }: { count: number; source: 'all' | 'incorrect' }) => {
    const sourceQuestions = source === 'incorrect' ? incorrectQuestions : questions;
    startQuiz(count, sourceQuestions);
  };

  // 1問だけの場合は即座に開始する（RECENT ACTIVITYからの遷移など）
  useEffect(() => {
    if (questions.length === 1 && !isStarted && !isFinished) {
      startQuiz(-1); // 全問（といっても1問）で開始
    }
  }, [questions.length, isStarted, isFinished, startQuiz]);

  const handleToggleBookmark = () => {
    if (!userEmail) {
      toast.error("ブックマーク機能を利用するにはログインが必要です");
      return;
    }

    if (!currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const isCurrentlyBookmarked = bookmarkedIds.has(questionId);

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
        toast.error(`ブックマークの更新に失敗しました: ${result.error}`);
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (isCurrentlyBookmarked) {
            next.add(questionId);
          } else {
            next.delete(questionId);
          }
          return next;
        });
      } else {
        toast.success(result.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
      }
    });
  };

  // --- 空状態 ---
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="qz-card p-12 max-w-xl">
            <h1 className="text-2xl font-black text-qz-text dark:text-white mb-4 italic">No Questions Found</h1>
            <p className="text-qz-text-light dark:text-qz-text-light font-bold">このカテゴリにはまだ問題がありません。</p>
            <Link href="/" className="qz-btn-primary mt-8 inline-block">ホームに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 開始前画面 ---
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
        <StartScreen
          totalQuestions={questions.length}
          onStart={handleStart}
          incorrectQuestionCount={incorrectQuestions.length}
          hasSavedSession={hasSavedSession}
          savedSessionMeta={savedSessionMeta}
          onResumeSession={resumeQuiz}
          onDiscardSession={discardSavedSession}
        />
      </div>
    );
  }

  // --- リザルト表示 ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
        <ResultView 
          correctCount={correctCount} 
          totalCount={quizQuestions.length} 
          onReset={resetQuiz} 
          isSingleQuestion={questions.length === 1}
          isGuest={!userEmail}
        />
      </div>
    );
  }

  if (!currentQuestion) return <div className="hidden" />;

  const isCorrect = selectedOption === currentQuestion.answer;

  const correctIndex = currentQuestion.options.indexOf(currentQuestion.answer);
  const correctLabel = correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : '';
  const structuredExplanation = buildStructuredExplanation(currentQuestion);

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header userEmail={userEmail} streak={streak} xp={xp} level={level} />
      <ProgressBar currentIdx={currentIndex} total={quizQuestions.length} />
      
      <main
        className="flex-1 flex flex-col items-center justify-start p-4 py-12 md:py-20 overflow-y-auto touch-pan-y"
        {...swipeHandlers}
      >
        {/* Removed AnimatePresence for stability */}
        <div className="w-full max-w-3xl">
          <QuestionCard 
            key={currentQuestion.id}
            question={currentQuestion}
            selectedOption={selectedOption}
            onSelectOption={selectOption}
            isAnswered={isAnswered}
            isBookmarked={bookmarkedIds.has(currentQuestion.id)}
            onToggleBookmark={handleToggleBookmark}
          />

          {isAnswered && (
            <div className="mt-8 transition-all duration-500 ease-in-out">
              <ExplanationArea 
                isCorrect={isCorrect}
                explanation={currentQuestion.explanation}
                whyCorrect={structuredExplanation.whyCorrect}
                whyOthersWrong={structuredExplanation.whyOthersWrong}
                relatedConcepts={structuredExplanation.relatedConcepts}
                onNext={nextQuestion}
                correctLabel={correctLabel}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
