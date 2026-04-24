import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { resolvePlanTier } from '@/lib/feature-gates'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: '学習目標とペースを設定し、CloudMasterのパーソナライズ機能を有効化します。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/onboarding',
  },
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, xp, level, plan_tier, onboarding_completed, onboarding_goal, onboarding_daily_goal, onboarding_exam_date, push_opt_in')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-qz-bg dark:bg-qz-bg">
      <Header
        userEmail={user.email || ''}
        streak={profile?.streak_count || 0}
        xp={profile?.xp || 0}
        level={profile?.level || 1}
        planTier={resolvePlanTier(profile?.plan_tier)}
      />

      <main className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <OnboardingForm
          defaultGoal={profile?.onboarding_goal || 'cdl-pass'}
          defaultDailyGoal={profile?.onboarding_daily_goal || 20}
          defaultExamDate={profile?.onboarding_exam_date || null}
          defaultPushOptIn={profile?.push_opt_in || false}
        />
      </main>
    </div>
  )
}
