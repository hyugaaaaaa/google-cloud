import React from 'react'
import { Skeleton } from '@/components/common/Skeleton'

export default function StudyLoading() {
  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      {/* Progress Bar Skeleton */}
      <div className="w-full h-1.5 bg-qz-border dark:bg-[#2E3856]">
        <div className="h-full bg-qz-blue w-1/3 animate-pulse opacity-50"></div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-start p-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          {/* Question Card Skeleton */}
          <div className="qz-card p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-qz-blue/20"></div>
            
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-4 w-full">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Options Skeleton */}
            <div className="space-y-4 mb-14">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>

            {/* Footer Button Skeleton */}
            <div className="flex flex-col items-center gap-6">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-6 w-48 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
