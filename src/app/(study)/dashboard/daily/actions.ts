'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkDailyCompletionAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('histories')
    .select('id')
    .eq('user_id', user.id)
    .eq('study_mode', 'daily')
    .gte('created_at', startOfDay.toISOString())

  return data && data.length >= 6
}
