import React from 'react'
import { Skeleton } from '@/components/common/Skeleton'

export default function MockExamLoading() {
  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="max-w-3xl w-full">
          {/* Header Info Skeleton */}
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-14 w-32 rounded-2xl" />
          </div>

          {/* Exam Card Skeleton */}
          <div className="qz-card p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-qz-yellow/20"></div>
            
            <div className="mb-12">
              <Skeleton className="h-4 w-32 mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-12 w-1/2" />
            </div>

            <div className="space-y-4 mb-14">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>

            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}
