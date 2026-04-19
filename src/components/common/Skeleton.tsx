import React from 'react'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-qz-border dark:bg-[#2E3856] rounded-xl ${className}`} 
      style={style}
    />
  )
}
