'use client'

import Link from 'next/link'
import { logoutAction } from '@/app/(auth)/actions'
import { User, LogOut, LayoutDashboard, Home, BookOpen } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

type HeaderProps = {
  user?: any
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A1D23] border-b border-qz-border dark:border-[#2E3856] h-[64px] flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-qz-blue rounded-lg flex items-center justify-center group-hover:bg-qz-blue-hover transition-colors">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black text-qz-text dark:text-white tracking-tight">CloudMaster</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-10 flex-1">
          <Link href="/" className="text-[15px] font-bold text-qz-text dark:text-white hover:text-qz-blue transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" /> ホーム
          </Link>
          {user && (
            <Link href="/dashboard" className="text-[15px] font-bold text-qz-text dark:text-white hover:text-qz-blue transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> ダッシュボード
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <div className="h-6 w-px bg-qz-border dark:bg-[#3B4664] mx-1"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-qz-bg dark:bg-[#2E3856] rounded-full border border-qz-border dark:border-[#2E3856]">
                <User className="w-4 h-4 text-qz-blue" />
                <span className="text-xs font-bold truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="p-2 text-qz-text-light hover:text-qz-error hover:bg-qz-error/10 rounded-full transition-all" title="ログアウト">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-[15px] font-bold text-qz-text dark:text-white hover:bg-qz-bg dark:hover:bg-[#2E3856] rounded-xl transition-all">
                ログイン
              </Link>
              <Link href="/register" className="qz-btn-primary !py-2 !px-5 !rounded-xl !text-[15px]">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
