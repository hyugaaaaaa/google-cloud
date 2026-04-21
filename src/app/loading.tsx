import React from 'react'


export default function Loading() {
  return (
    <div className="min-h-screen bg-qz-bg text-qz-text">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Hero Skeleton */}
        <div className="bg-white dark:bg-[#1A1D23] qz-card p-6 md:p-16 mb-8 md:mb-16 animate-pulse">
          <div className="h-4 w-48 bg-qz-blue/10 rounded-full mb-6 mx-auto"></div>
          <div className="h-12 md:h-20 w-3/4 bg-qz-blue/5 rounded-2xl mb-8 mx-auto"></div>
          <div className="h-4 md:h-6 w-1/2 bg-qz-text-light/5 rounded-xl mb-12 mx-auto"></div>
          <div className="h-16 w-64 bg-qz-blue/20 rounded-2xl mx-auto"></div>
        </div>

        {/* Challenge Skeletons */}
        <div className="space-y-6 md:space-y-12 mb-16">
          {[1, 2].map((i) => (
            <div key={i} className="qz-card p-4 md:p-10 bg-qz-blue/5 border-none animate-pulse">
              <div className="flex items-center gap-4 md:gap-12">
                <div className="w-10 h-10 md:w-20 md:h-20 bg-qz-text-light/10 rounded-xl md:rounded-[32px]"></div>
                <div className="flex-grow space-y-3">
                  <div className="h-6 md:h-10 w-48 bg-qz-text-light/10 rounded-lg"></div>
                  <div className="h-3 md:h-5 w-full max-w-lg bg-qz-text-light/5 rounded-md"></div>
                </div>
                <div className="hidden md:block w-40 h-16 bg-qz-text-light/10 rounded-[24px]"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="qz-card p-4 md:p-8 h-[160px] md:h-[240px] bg-qz-blue/5 border-qz-border dark:border-[#2E3856] animate-pulse">
              <div className="flex justify-between mb-6">
                <div className="h-4 w-24 bg-qz-text-light/10 rounded-full"></div>
                <div className="h-4 w-12 bg-qz-text-light/10 rounded-lg"></div>
              </div>
              <div className="h-6 md:h-10 w-full bg-qz-text-light/10 rounded-lg mb-4"></div>
              <div className="flex justify-end mt-auto">
                <div className="h-4 w-20 bg-qz-text-light/10 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
