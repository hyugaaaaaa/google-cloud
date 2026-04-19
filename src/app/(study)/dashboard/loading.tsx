import React from 'react'
import { Skeleton } from '@/components/common/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Activity Chart Skeleton */}
        <div className="qz-card p-8 mb-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="flex items-end gap-4 h-64">
            {[40, 70, 45, 90, 65, 30, 80].map((height, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}
