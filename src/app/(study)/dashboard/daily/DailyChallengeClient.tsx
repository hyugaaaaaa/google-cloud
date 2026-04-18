'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Home, RotateCcw, LayoutDashboard, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { saveBulkHistoryAction, toggleBookmarkAction } from '@/app/(study)/actions'
import { Header } from '@/components/common/Header'
import { QuestionCard } from '@/components/study/QuestionCard'
import { ExplanationArea } from '@/components/study/ExplanationArea'
import { toast } from 'sonner'

export function DailyChallengeClient({ 
  questions, 
  userEmail, 
  streak,
  isCompleted: initialCompleted, 
  dateString,
  initialBookmarkedIds = []
}: { 
  questions: any[], 
  userEmail: string, 
  streak?: number,
  isCompleted: boolean,
  dateString: string,
  initialBookmarkedIds?: string[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [isFinished, setIsFinished] = useState(initialCompleted)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [isBookmarkPending, startBookmarkTransition] = useTransition();

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedOption === currentQuestion?.answer

  const handleSelectOption = (option: string) => {
    if (showExplanation) return
    setSelectedOption(option)
    setShowExplanation(true)
    
    const correct = option === currentQuestion.answer
    setAnswers([...answers, {
      questionId: currentQuestion.id,
      isCorrect: correct,
      userAnswer: option
    }])
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      // Finish
      setIsSaving(true)
      const finalAnswers = [...answers]
      await saveBulkHistoryAction(finalAnswers, 'daily')
      setIsFinished(true)
      setIsSaving(false)
    }
  }

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

  if (isFinished) {
    const correctCount = answers.length > 0 
      ? answers.filter(a => a.isCorrect).length 
      : questions.length // If already completed, we don't have local answers

    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header userEmail={userEmail} streak={streak} />
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
              <span className="text-4xl font-black italic text-qz-blue">{correctCount} / {questions.length}</span>
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

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header userEmail={userEmail} streak={streak} />
      
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
            <span className="text-sm font-black italic text-qz-blue">{currentIndex + 1} / {questions.length}</span>
            <div className="w-32 h-2 bg-qz-border dark:bg-[#2E3856] rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-qz-blue"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
              onSelectOption={handleSelectOption}
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
                onNext={handleNext}
                isLoading={isSaving}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
