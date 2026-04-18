'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Home, RotateCcw, LayoutDashboard, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { saveBulkHistoryAction } from '@/app/(study)/actions'
import { Header } from '@/components/common/Header'

export function DailyChallengeClient({ questions, user, isCompleted: initialCompleted, dateString }: { 
  questions: any[], 
  user: any, 
  isCompleted: boolean,
  dateString: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [isFinished, setIsFinished] = useState(initialCompleted)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const currentQuestion = questions[currentIndex]

  const handleSelectOption = (option: string) => {
    if (showExplanation) return
    setSelectedOption(option)
    setShowExplanation(true)
    
    const isCorrect = option === currentQuestion.answer
    setAnswers([...answers, {
      questionId: currentQuestion.id,
      isCorrect,
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

  if (isFinished) {
    const correctCount = answers.length > 0 
      ? answers.filter(a => a.isCorrect).length 
      : questions.length // If already completed, we don't have local answers, but assume success for UI

    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header user={user} />
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
      <Header user={user} />
      
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

        {/* Question Card */}
        <div className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="qz-card p-8 md:p-10">
                <div className="inline-block px-3 py-1 bg-qz-blue/10 text-qz-blue text-[10px] font-black rounded-lg mb-4 uppercase tracking-widest border border-qz-blue/20">
                  Category {currentIndex + 1}
                </div>
                <h3 className="text-xl md:text-2xl font-black leading-tight text-qz-text dark:text-white">
                  {currentQuestion.content}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option: string, idx: number) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.answer;
                  
                  let buttonClass = "qz-card p-6 text-left font-bold transition-all duration-200 flex justify-between items-center group";
                  if (showExplanation) {
                    if (isCorrect) {
                      buttonClass = "qz-card p-6 text-left font-bold border-qz-success bg-qz-success/5 text-qz-success flex justify-between items-center";
                    } else if (isSelected) {
                      buttonClass = "qz-card p-6 text-left font-bold border-qz-error bg-qz-error/5 text-qz-error flex justify-between items-center";
                    } else {
                      buttonClass = "qz-card p-6 text-left font-bold opacity-50 flex justify-between items-center cursor-default";
                    }
                  } else {
                    buttonClass += " hover:border-qz-blue hover:translate-x-1";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={showExplanation}
                      className={buttonClass}
                    >
                      <span className="flex-grow">{option}</span>
                      {showExplanation && isCorrect && <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                      {showExplanation && isSelected && !isCorrect && <AlertCircle className="w-6 h-6 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Explanation Area */}
          <div className="h-40 mt-8">
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#1A1D23] p-6 rounded-2xl border-l-4 border-qz-blue shadow-sm">
                    <h4 className="font-black text-qz-blue text-sm mb-1 uppercase tracking-tight">解説</h4>
                    <p className="text-qz-text-light font-bold text-sm leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isSaving}
                    className="w-full qz-btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-qz-blue/20"
                  >
                    {isSaving ? '保存中...' : (currentIndex === questions.length - 1 ? 'チャレンジ完了' : '次の問題へ')}
                    {!isSaving && <ArrowRight className="w-6 h-6" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
