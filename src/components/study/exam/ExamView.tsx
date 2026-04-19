'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, ArrowRight, ShieldQuestion, AlertCircle, Star } from 'lucide-react'
import type { Question } from '@/types/app.types'

interface ExamViewProps {
  currentQuestion: Question & { categoryName: string };
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  onNext: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  timeLeft,
  selectedOption,
  onSelectOption,
  onNext,
  isBookmarked,
  onToggleBookmark
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft <= 60

  return (
    <div className="max-w-3xl w-full">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-qz-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
            <ShieldQuestion className="w-3 h-3" /> Mock Exam
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            Question {currentIndex + 1} <span className="text-qz-text-light text-xl">/ {totalQuestions}</span>
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
          
          <button
            onClick={() => onToggleBookmark(currentQuestion.id)}
            className={`absolute top-8 right-8 p-3 rounded-full transition-all duration-300 z-10 ${
              isBookmarked
                ? 'bg-qz-yellow text-white shadow-lg' 
                : 'bg-qz-bg dark:bg-[#2E3856] text-qz-text-light hover:text-qz-yellow hover:bg-qz-yellow/10'
            }`}
          >
            <Star size={20} className={isBookmarked ? 'fill-white' : ''} />
          </button>

          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-qz-text-light">
              Category: {currentQuestion.categoryName}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-qz-text dark:text-white mb-12 leading-tight max-w-[90%]">
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
                  onClick={() => onSelectOption(opt)}
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
              onClick={onNext}
              disabled={!selectedOption}
              className="qz-btn-primary w-full py-5 text-2xl flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(66,85,255,0.25)] group"
            >
              <span>{currentIndex === totalQuestions - 1 ? '試験を完了する' : '解答して次へ'}</span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-qz-bg dark:bg-[#2E3856] rounded-xl border border-qz-border dark:border-[#2E3856] text-qz-text-light text-[11px] font-black uppercase tracking-widest">
              <AlertCircle size={14} /> 一度進むと前の問題には戻れません
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
