"use client";

import React, { useState, useTransition } from 'react';
import { QuestionCard } from '@/components/study/QuestionCard';
import { ExplanationArea } from '@/components/study/ExplanationArea';
import { ProgressBar } from '@/components/study/ProgressBar';
import { Header } from '@/components/common/Header';
import type { Question } from '@/types/app.types';
import { saveHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, RotateCcw, LayoutDashboard, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function StudyClient({ 
  questions, 
  userEmail, 
  streak,
  initialBookmarkedIds = [] 
}: { 
  questions: Question[], 
  userEmail?: string,
  streak?: number,
  initialBookmarkedIds?: string[]
}) {
  const [isStarted, setIsStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [isPending, startTransition] = useTransition();
  const [isBookmarkPending, startBookmarkTransition] = useTransition();

  // --- クイズ開始処理 ---
  const handleStart = (count: number) => {
    // 問題をシャッフル
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    // 指定された数だけ抽出
    const selected = count === -1 ? shuffled : shuffled.slice(0, count);
    
    setQuizQuestions(selected);
    setIsStarted(true);
  };

  const currentQuestion = quizQuestions[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === currentQuestion?.answer;

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    
    // Check correct
    const correct = option === currentQuestion.answer;
    if (correct) setCorrectCount(prev => prev + 1);
    
    // Save history in the background
    startTransition(async () => {
      try {
        await saveHistoryAction(currentQuestion.id, correct, option);
        toast.success(correct ? "正解！履歴を保存しました" : "残念！履歴を保存しました");
      } catch (error) {
        console.error("Failed to save history:", error);
        toast.error("保存に失敗しました");
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  // --- 再挑戦 ---
  const handleReset = () => {
    setIsStarted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);
    setCorrectCount(0);
    setQuizQuestions([]);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} />
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="qz-card p-12 max-w-xl">
            <h1 className="text-2xl font-black text-qz-text dark:text-white mb-4 italic">No Questions Found</h1>
            <p className="text-qz-text-light dark:text-qz-text-light font-bold">このカテゴリにはまだ問題がありません。データが追加されるのをお待ちください。</p>
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
        <Header userEmail={userEmail} streak={streak} />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full qz-card p-10 text-center"
          >
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
              {[
                { count: 10, label: "クイック", desc: "隙間時間に最適", icon: <Zap className="w-5 h-5 text-qz-blue" /> },
                { count: 20, label: "スタンダード", desc: "しっかり確認" },
                { count: 40, label: "チャレンジ", desc: "全問マスター" },
                { count: -1, label: "すべて", desc: "網羅的に学習", primary: true },
              ].map((mode) => (
                <button
                  key={mode.count}
                  onClick={() => handleStart(mode.count)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
                    mode.primary 
                    ? "bg-qz-blue border-qz-blue text-white hover:scale-[1.02] shadow-xl shadow-qz-blue/20" 
                    : "bg-white dark:bg-[#2E3856] border-qz-border dark:border-qz-border hover:border-qz-blue hover:scale-[1.02]"
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
                    {mode.count === -1 ? `全 ${questions.length} 問` : `${mode.count} 問`} • {mode.desc}
                  </p>
                </button>
              ))}
            </div>

            <Link href="/" className="text-qz-text-light font-bold hover:text-qz-blue transition-colors text-sm">
              キャンセルしてホームに戻る
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  // --- リザルト表示 ---
  if (isFinished) {
    const accuracy = Math.round((correctCount / quizQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full qz-card p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-qz-yellow"></div>
            
            <div className="w-24 h-24 bg-qz-yellow/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(255,205,31,0.3)]">
              <Trophy className="w-12 h-12 text-qz-yellow" />
            </div>
            
            <h2 className="text-4xl font-black text-qz-text dark:text-white mb-4 italic uppercase tracking-tighter">Excellent Work!</h2>
            <p className="text-qz-text-light font-bold mb-10">
              選択した {quizQuestions.length} 問の学習を完了しました。
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正解数</span>
                <span className="text-3xl font-black text-qz-success">{correctCount} <span className="text-sm font-bold text-qz-text-light">/ {quizQuestions.length}</span></span>
              </div>
              <div className="bg-qz-bg dark:bg-[#2E3856] p-6 rounded-2xl border border-qz-border dark:border-[#2E3856]">
                <span className="block text-[10px] font-black uppercase text-qz-text-light mb-1">正答率</span>
                <span className="text-3xl font-black text-qz-blue">{accuracy}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleReset} className="flex-1 px-6 py-4 border-2 border-qz-border dark:border-[#2E3856] rounded-xl font-black text-qz-text dark:text-white hover:bg-qz-bg dark:hover:bg-[#2E3856] transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> もう一度学習
              </button>
              <Link href="/dashboard" className="flex-1 qz-btn-primary flex items-center justify-center gap-2 shadow-lg shadow-qz-blue/20">
                成績を見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleToggleBookmark = () => {
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
      } else {
        toast.success(result.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
      }
    });
  };

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header userEmail={userEmail} streak={streak} />
      <ProgressBar currentIdx={currentIndex} total={quizQuestions.length} />
      
      <main className="flex-1 flex flex-col items-center justify-start p-4 py-12 md:py-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <QuestionCard 
            key={currentQuestion.id}
            question={currentQuestion}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            isAnswered={isAnswered}
            isBookmarked={bookmarkedIds.has(currentQuestion.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        </AnimatePresence>

        <AnimatePresence>
          {isAnswered && (
            <ExplanationArea 
              isCorrect={isCorrect}
              explanation={currentQuestion.explanation}
              onNext={handleNext}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

