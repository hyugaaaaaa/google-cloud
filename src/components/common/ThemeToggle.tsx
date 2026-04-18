"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-qz-bg dark:bg-[#2E3856] border border-qz-border dark:border-[#2E3856]" />
    )
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-xl bg-qz-bg dark:bg-[#2E3856] border border-qz-border dark:border-[#2E3856] flex items-center justify-center text-qz-text dark:text-white hover:bg-qz-border dark:hover:bg-[#3B4664] transition-colors overflow-hidden group"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5 text-qz-yellow" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5 text-qz-blue" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-qz-blue/5 dark:bg-qz-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
