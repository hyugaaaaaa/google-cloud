'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveHistoryAction(questionId: string, isCorrect: boolean) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // ログインしていなければ履歴保存はスキップする
    return { error: 'Not authorized' }
  }

  const { error } = await supabase.from('histories').insert({
    user_id: user.id,
    question_id: questionId,
    is_correct: isCorrect
  })

  if (error) {
    console.error("Failed to save history:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function saveBulkHistoryAction(records: { questionId: string, isCorrect: boolean }[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authorized' }
  }

  const inserts = records.map(r => ({
    user_id: user.id,
    question_id: r.questionId,
    is_correct: r.isCorrect
  }))

  const { error } = await supabase.from('histories').insert(inserts)

  if (error) {
    console.error("Failed to save bulk history:", error)
    return { error: error.message }
  }

  return { success: true }
}
