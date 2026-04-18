'use client'

import { useState, useEffect } from 'react'

export function SafeDate({ date, format = 'ja-JP' }: { date: string | Date, format?: string }) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString(format))
  }, [date, format])

  return <span suppressHydrationWarning>{formatted}</span>
}
