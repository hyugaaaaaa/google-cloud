'use client'

import React from 'react';

type ProgressBarProps = {
  currentIdx: number; // 0-indexed
  total: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentIdx, total }) => {
  const currentNum = Math.min(currentIdx + 1, total);
  const percentage = total > 0 ? (currentNum / total) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 w-full h-[6px] bg-qz-border dark:bg-[#2E3856] z-[60] overflow-hidden">
      <div 
        className="bg-qz-blue h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(66,85,255,0.4)]"
        style={{ width: `${percentage}%` }}
      />
      
      {/* Percentage bubble - optional but helpful */}
      <div className="absolute top-4 right-6 bg-white dark:bg-[#1A1D23] px-3 py-1 rounded-full border border-qz-border dark:border-[#2E3856] shadow-sm">
        <span className="text-[11px] font-black text-qz-text dark:text-white uppercase tracking-tighter">
          Progress: {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};
