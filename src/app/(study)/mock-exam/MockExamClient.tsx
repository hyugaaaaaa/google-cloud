'use client'

import { useState, useEffect } from 'react'
import type { Question } from '@/types/app.types'
import { saveBulkHistoryAction } from '@/app/(study)/actions'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, ArrowRight, RotateCcw, LayoutDashboard, CheckCircle2, XCircle, AlertCircle, ShieldQuestion } from 'lucide-react'

type MockExamClientProps = {
  questions: (Question & { categoryName: string })[]
}

const EXAM_TIME_LIMIT_SEC = 15 * 60 // 15分

export function MockExamClient({ questions }: MockExamClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  // ユーザーの解答リスト `{ questionId, isCorrect, selectedOption }`
  const [answers, setAnswers] = useState<{ questionId: string, isCorrect: boolean, selectedOption: string }[]>([])
  
  // 状態管理
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_LIMIT_SEC)
  const [isSaving, setIsSaving] = useState(false)

  // タイマー処理
  useEffect(() => {
    if (isFinished) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish(answers) // 時間切れ時に現在の解答で終了
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFinished, answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[currentIndex]

  // フォーマット用
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    if (!selectedOption) return

    const isCorrect = selectedOption === currentQuestion.answer
    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      isCorrect,
      selectedOption
    }]

    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleFinish(newAnswers)
    }
  }

  const handleFinish = async (finalAnswers: typeof answers) => {
    setIsFinished(true)
    setIsSaving(true)
    
    // DBに保存
    const records = finalAnswers.map(a => ({
      questionId: a.questionId,
      isCorrect: a.isCorrect
    }))
    
    // 非同期で保存（表示ブロックしないように裏で実行）
    await saveBulkHistoryAction(records)
    setIsSaving(false)
  }

  // --- リザルト画面 ---
  if (isFinished) {
    const correctCount = answers.filter(a => a.isCorrect).length
    const totalQuestions = questions.length
    const score = Math.round((correctCount / totalQuestions) * 100)

    return (
      <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="qz-card p-10 mb-12 text-center relative overflow-hidden"
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
              <Link href="/" className="px-8 py-4 border-2 border-qz-border dark:border-[#2E3856] rounded-xl font-black text-qz-text dark:text-white hover:bg-qz-bg dark:hover:bg-[#2E3856] transition-all flex items-center justify-center gap-2">
                トップに戻る
              </Link>
              <Link href="/dashboard" className="qz-btn-primary px-8 py-4 flex items-center justify-center gap-3">
                成績を分析する <LayoutDashboard className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3 border-b border-qz-border dark:border-[#2E3856] pb-4">
              <AlertCircle className="text-qz-blue w-6 h-6" /> 
              解答の振り返り
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, idx) => {
                const answerRecord = answers.find(a => a.questionId === q.id)
                const isCorrect = answerRecord?.isCorrect || false
                
                return (
                  <div key={q.id} className="qz-card group overflow-hidden">
                    <div className={`px-6 py-3 font-black text-xs uppercase tracking-widest flex justify-between items-center ${
                      isCorrect ? 'bg-qz-success/10 text-qz-success' : 'bg-qz-error/10 text-qz-error'
                    }`}>
                      <span>Question {idx + 1} • {q.categoryName}</span>
                      <div className="flex items-center gap-2">
                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-xl font-bold text-qz-text dark:text-white mb-8 leading-relaxed">
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
      </div>
    )
  }

  // --- 試験画面 ---
  if (!currentQuestion) return null

  const isLowTime = timeLeft <= 60

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header />
      
      {/* Sleek Progress Bar for Exam */}
      <div className="fixed top-[64px] left-0 w-full h-1 bg-qz-border dark:bg-[#2E3856] z-[60]">
        <div 
          className="bg-qz-yellow h-full transition-all duration-300 ease-out" 
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="max-w-3xl w-full">
          {/* Header Info */}
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-qz-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
                <ShieldQuestion className="w-3 h-3" /> Mock Exam
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                Question {currentIndex + 1} <span className="text-qz-text-light text-xl">/ {questions.length}</span>
              </h2>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-2xl tracking-tight transition-all shadow-sm border ${
              isLowTime 
                ? 'bg-qz-error/10 text-qz-error border-qz-error/30 animate-pulse' 
                : 'bg-white dark:bg-[#1A1D23] text-qz-text dark:text-white border-qz-border dark:border-[#2E3856]'
            }`}>
              <Timer className={`w-6 h-6 ${isLowTime ? 'animate-bounce' : ''}`} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="qz-card p-10 md:p-14 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-qz-yellow"></div>
              
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-qz-text-light">
                  Category: {currentQuestion.categoryName}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-qz-text dark:text-white mb-12 leading-tight">
                {currentQuestion.content}
              </h2>

              <div className="space-y-4 mb-14">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-6 rounded-2xl border-2 font-bold text-lg transition-all flex items-center gap-4 ${
                        isSelected 
                          ? 'border-qz-blue bg-qz-blue/5 text-qz-blue shadow-lg shadow-qz-blue/10' 
                          : 'border-qz-border dark:border-[#2E3856] hover:border-qz-blue/30 bg-white dark:bg-[#1A1D23] text-qz-text dark:text-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                        isSelected ? 'bg-qz-blue text-white border-transparent' : 'border-2 border-qz-border dark:border-[#2E3856] text-qz-text-light'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className="qz-btn-primary w-full py-5 text-2xl flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(66,85,255,0.25)] group"
                >
                  <span>{currentIndex === questions.length - 1 ? '試験を完了する' : '解答して次へ'}</span>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-qz-bg dark:bg-[#2E3856] rounded-xl border border-qz-border dark:border-[#2E3856] text-qz-text-light text-[11px] font-black uppercase tracking-widest">
                  <AlertCircle size={14} /> 一度進むと前の問題には戻れません
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
