'use client'

import { useActionState } from 'react'
import { completeOnboardingAction } from '@/app/onboarding/actions'
import { ArrowRight, Bell, Calendar, Sparkles, Target } from 'lucide-react'

const initialState = {
  error: '',
}

type OnboardingFormProps = {
  defaultGoal?: string
  defaultDailyGoal?: number
  defaultExamDate?: string | null
  defaultPushOptIn?: boolean
}

export function OnboardingForm({
  defaultGoal = 'cdl-pass',
  defaultDailyGoal = 20,
  defaultExamDate,
  defaultPushOptIn = false,
}: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState)

  return (
    <form action={formAction} className="qz-card p-8 md:p-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-qz-blue/10 text-qz-blue rounded-full text-xs font-black uppercase tracking-widest">
          <Sparkles className="h-4 w-4" />
          Personalized Setup
        </div>
        <h2 className="text-3xl font-black leading-tight">あなた専用の学習プランを作成します</h2>
        <p className="text-sm font-bold text-qz-text-light">2分で完了。以降の弱点分析・通知・おすすめ順に反映されます。</p>
      </div>

      {state?.error && (
        <div className="rounded-xl border border-qz-error/30 bg-qz-error/10 px-4 py-3 text-sm font-bold text-qz-error">
          {state.error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
            学習ゴール
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="rounded-xl border border-qz-border p-4 cursor-pointer hover:border-qz-blue transition-colors">
              <input type="radio" name="goal" value="cdl-pass" defaultChecked={defaultGoal === 'cdl-pass'} className="mr-2" />
              <span className="text-sm font-black">CDL合格</span>
            </label>
            <label className="rounded-xl border border-qz-border p-4 cursor-pointer hover:border-qz-blue transition-colors">
              <input type="radio" name="goal" value="foundation" defaultChecked={defaultGoal === 'foundation'} className="mr-2" />
              <span className="text-sm font-black">基礎固め</span>
            </label>
            <label className="rounded-xl border border-qz-border p-4 cursor-pointer hover:border-qz-blue transition-colors">
              <input type="radio" name="goal" value="career" defaultChecked={defaultGoal === 'career'} className="mr-2" />
              <span className="text-sm font-black">キャリア強化</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="dailyGoal" className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
            1日の目標問題数
          </label>
          <div className="relative">
            <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-qz-text-light" />
            <input
              id="dailyGoal"
              name="dailyGoal"
              type="number"
              min={5}
              max={180}
              defaultValue={defaultDailyGoal}
              className="qz-input w-full pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="examDate" className="block text-xs font-black uppercase tracking-widest text-qz-text-light mb-2">
            受験予定日（任意）
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-qz-text-light" />
            <input id="examDate" name="examDate" type="date" defaultValue={defaultExamDate || ''} className="qz-input w-full pl-10" />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-qz-border p-4">
          <input type="checkbox" name="pushOptIn" defaultChecked={defaultPushOptIn} className="mt-0.5" />
          <div>
            <p className="text-sm font-black flex items-center gap-2"><Bell className="h-4 w-4 text-qz-blue" /> デイリー通知を受け取る</p>
            <p className="text-xs font-bold text-qz-text-light mt-1">PWA通知を許可すると、学習リマインドを受け取れます。</p>
          </div>
        </label>
      </div>

      <button type="submit" disabled={isPending} className="qz-btn-primary w-full flex items-center justify-center gap-2 text-lg">
        {isPending ? '保存中...' : 'この内容で開始'}
        {!isPending && <ArrowRight className="h-5 w-5" />}
      </button>
    </form>
  )
}
