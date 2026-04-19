import React from 'react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-qz-border dark:bg-[#2E3856] rounded-xl ${className}`} 
    />
  )
}
