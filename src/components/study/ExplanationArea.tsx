'use client'

import React from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

type ExplanationAreaProps = {
  isCorrect: boolean;
  explanation: string;
  onNext: () => void;
  correctLabel?: string;
  isLoading?: boolean;
}

export const ExplanationArea: React.FC<ExplanationAreaProps> = ({
  isCorrect,
  explanation,
  onNext,
  correctLabel,
  isLoading = false
}) => {
  return (
    <div 
      className={`w-full max-w-2xl mx-auto rounded-[24px] overflow-hidden mt-6 border-2 transition-all duration-500 ease-out opacity-100 translate-y-0 ${
        isCorrect 
          ? 'bg-qz-success/5 border-qz-success/20 shadow-[0_8px_32px_rgba(35,178,109,0.05)]' 
          : 'bg-qz-error/5 border-qz-error/20 shadow-[0_8px_32px_rgba(255,114,94,0.05)]'
      }`}
    >
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-qz-success" />
          ) : (
            <XCircle className="w-8 h-8 text-qz-error" />
          )}
          <h3 className={`text-2xl font-black ${isCorrect ? 'text-qz-success' : 'text-qz-error'}`}>
            {isCorrect ? '素晴らしい！正解です' : '惜しい...次は頑張りましょう'}
          </h3>
          {correctLabel && (
            <div className={`ml-auto px-4 py-1.5 rounded-xl font-black text-xl border-2 ${
              isCorrect ? 'bg-qz-success text-white border-qz-success' : 'bg-white dark:bg-[#1A1D23] text-qz-error border-qz-error'
            }`}>
              正解: {correctLabel}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-[#2E3856] rounded-[16px] p-6 mb-8 border border-qz-border dark:border-[#2E3856]">
          <h4 className="text-xs font-black uppercase tracking-widest text-qz-text-light mb-3">
            解説
          </h4>
          <p className="text-[15px] font-bold text-qz-text dark:text-white leading-relaxed">
            {explanation || 'この問題には解説がありません。'}
          </p>
        </div>

        <button 
          onClick={onNext}
          disabled={isLoading}
          className="qz-btn-primary w-full flex items-center justify-center gap-3 group shadow-lg shadow-qz-blue/20 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          <span className="text-xl">{isLoading ? '保存中...' : '次の問題へ'}</span>
          {!isLoading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
