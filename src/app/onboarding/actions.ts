'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardingSchema = z.object({
  goal: z.string().trim().max(120).optional().nullable(),
  dailyGoal: z.coerce.number().int().min(5).max(180),
  examDate: z.string().optional().nullable(),
  pushOptIn: z.boolean().default(false),
})

export async function completeOnboardingAction(_: unknown, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ログインが必要です。' }
  }

  const parsed = onboardingSchema.safeParse({
    goal: formData.get('goal') as string,
    dailyGoal: formData.get('dailyGoal') as string,
    examDate: (formData.get('examDate') as string) || null,
    pushOptIn: formData.get('pushOptIn') === 'on',
  })

  if (!parsed.success) {
    return { error: '入力内容を確認してください。' }
  }

  const { goal, dailyGoal, examDate, pushOptIn } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      onboarding_goal: goal || null,
      onboarding_daily_goal: dailyGoal,
      onboarding_exam_date: examDate || null,
      push_opt_in: pushOptIn,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'オンボーディングの保存に失敗しました。' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
