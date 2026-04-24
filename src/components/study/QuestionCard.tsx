'use client'

import React from 'react';
import type { Question } from '@/types/app.types';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

type QuestionCardProps = {
  question: Question;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isAnswered: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  isAnswered,
  isBookmarked = false,
  onToggleBookmark
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto transition-all duration-200 ease-out translate-y-0 opacity-100">
      <div className="bg-white dark:bg-[#1A1D23] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-qz-border dark:border-[#2E3856] overflow-hidden">
        {/* Card Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="px-3 py-1 bg-qz-blue/10 text-qz-blue text-[10px] font-black uppercase tracking-widest rounded-full">
              Question
            </div>

            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isBookmarked 
                    ? 'text-qz-yellow bg-qz-yellow/10' 
                    : 'text-qz-text-light hover:bg-qz-bg dark:hover:bg-[#2E3856]'
                }`}
                title={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
              >
                <Star className={`w-6 h-6 ${isBookmarked ? 'fill-qz-yellow' : ''}`} />
              </button>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-qz-text dark:text-white leading-tight">
            {question.content}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="px-6 pb-10 space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;

            const isWrongSelection = isAnswered && isSelected && option !== String(question.answer);

            let btnBaseClass = "relative w-full text-left px-6 py-4 rounded-xl border-2 font-bold transition-all flex items-center justify-between group active:scale-[0.99] ";
            let statusIcon = null;

            if (!isAnswered) {
              btnBaseClass += isSelected
                ? "border-qz-blue bg-qz-blue/5 text-qz-blue shadow-md"
                : "border-qz-border dark:border-[#2E3856] hover:border-qz-blue/50 hover:bg-qz-bg dark:hover:bg-[#2E3856] text-qz-text dark:text-white";
            } else {
              if (option === question.answer) {
                btnBaseClass += "border-qz-success bg-qz-success/10 text-qz-success shadow-[0_0_12px_rgba(35,178,109,0.2)]";
                statusIcon = <CheckCircle2 className="w-5 h-5 flex-shrink-0" />;
              } else if (isWrongSelection) {
                btnBaseClass += "border-qz-error bg-qz-error/10 text-qz-error";
                statusIcon = <XCircle className="w-5 h-5 flex-shrink-0" />;
              } else {
                btnBaseClass += "border-qz-border dark:border-[#2E3856] opacity-30 text-qz-text-light";
              }
            }

            return (
              <button
                key={idx}
                className={btnBaseClass}
                onClick={() => !isAnswered && onSelectOption(option)}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-colors ${
                    isSelected || (isAnswered && option === question.answer) 
                      ? 'bg-current border-transparent' 
                      : 'border-qz-border dark:border-[#2E3856] group-hover:border-qz-blue/50'
                  }`}>
                    <span className={isSelected || (isAnswered && option === question.answer) ? 'text-white' : 'text-qz-text-light'}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
                {statusIcon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
