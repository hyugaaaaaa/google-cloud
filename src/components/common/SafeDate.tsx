'use client'

import { useState, useEffect } from 'react'

export function SafeDate({ date, format = 'ja-JP' }: { date: string | Date, format?: string }) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatted(new Date(date).toLocaleDateString(format))
  }, [date, format])

  return <span suppressHydrationWarning>{formatted}</span>
}
