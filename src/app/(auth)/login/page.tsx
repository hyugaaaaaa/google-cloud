'use client'

import React, { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction, loginWithGoogleAction } from '@/app/(auth)/actions'
import { Header } from '@/components/common/Header'
import { LogIn, Key, Mail, ArrowRight } from 'lucide-react'

const initialState = {
  error: ''
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const oauthError = searchParams.get('error')
  const oauthErrorMessage = oauthError
    ? oauthError === 'google_auth_failed'
      ? 'Googleログインに失敗しました。時間をおいて再試行してください。'
      : oauthError
    : ''
  const errorMessage = state?.error || oauthErrorMessage

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-[480px] w-full space-y-8 qz-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-qz-blue"></div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-qz-blue/10 rounded-2xl mb-6">
              <LogIn className="w-8 h-8 text-qz-blue" />
            </div>
            <h2 className="text-3xl font-black text-qz-text dark:text-white mb-2">
              ログイン
            </h2>
            <p className="text-qz-text-light dark:text-qz-text-light font-bold">
              学習セットを作成・学習するためにログイン
            </p>
          </div>

          <form action={formAction} className="mt-10 space-y-6">
            {errorMessage && (
              <div className="bg-qz-error/10 border border-qz-error/20 text-qz-error p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-qz-error animate-pulse"></span>
                {errorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2 transition-colors group-focus-within:text-qz-blue">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-qz-text-light group-focus-within:text-qz-blue transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-qz-bg dark:bg-[#2E3856] border-2 border-transparent rounded-[12px] text-qz-text dark:text-white font-bold placeholder-qz-text-light/50 focus:outline-none focus:border-qz-blue focus:bg-white dark:focus:bg-[#1A1D23] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-qz-text-light transition-colors group-focus-within:text-qz-blue">
                    パスワード
                  </label>
                  <Link href="#" className="text-[11px] font-black text-qz-blue hover:underline">
                    パスワードを忘れた場合
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-qz-text-light group-focus-within:text-qz-blue transition-colors">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-qz-bg dark:bg-[#2E3856] border-2 border-transparent rounded-[12px] text-qz-text dark:text-white font-bold placeholder-qz-text-light/50 focus:outline-none focus:border-qz-blue focus:bg-white dark:focus:bg-[#1A1D23] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="qz-btn-primary w-full flex items-center justify-center gap-2 group shadow-lg shadow-qz-blue/20"
            >
              <span className="text-xl">{isPending ? 'ログイン中...' : 'ログイン'}</span>
              {!isPending && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <form action={loginWithGoogleAction}>
            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border-2 border-qz-border dark:border-[#2E3856] bg-white dark:bg-[#1A1D23] px-4 py-3.5 font-black text-qz-text dark:text-white transition-all hover:bg-qz-bg dark:hover:bg-[#2E3856]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.1-1.5H12z" />
              </svg>
              Googleでログイン
            </button>
          </form>

          <div className="relative pt-6">
            <div className="absolute inset-0 flex items-center px-10">
              <div className="w-full border-t border-qz-border dark:border-[#2E3856]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black">
              <span className="bg-white dark:bg-[#1A1D23] px-4 text-qz-text-light">または</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-qz-text-light">
              アカウントをお持ちでないですか？
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center w-full py-3.5 border-2 border-qz-border dark:border-[#2E3856] rounded-xl text-qz-text dark:text-white font-black hover:bg-qz-bg dark:hover:bg-[#2E3856] transition-all"
            >
              新規登録ページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
