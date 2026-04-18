'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// バリデーションスキーマの定義
const historySchema = z.object({
  questionId: z.string().uuid(),
  isCorrect: z.boolean(),
  userAnswer: z.string().optional().nullable(),
  studyMode: z.string().default('study')
})

const bulkHistorySchema = z.array(z.object({
  questionId: z.string().uuid(),
  isCorrect: z.boolean(),
  userAnswer: z.string().optional().nullable()
}))

export async function saveHistoryAction(questionId: string, isCorrect: boolean, userAnswer?: string, studyMode: string = 'study') {
  // バリデーション
  const validated = historySchema.safeParse({ questionId, isCorrect, userAnswer, studyMode })
  if (!validated.success) {
    return { error: 'Invalid input data' }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase.from('histories').insert({
    user_id: user.id,
    question_id: validated.data.questionId,
    is_correct: validated.data.isCorrect,
    user_answer: validated.data.userAnswer,
    study_mode: validated.data.studyMode
  })

  if (error) {
    console.error("Failed to save history:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function saveBulkHistoryAction(records: any[], studyMode: string = 'study') {
  // バリデーション
  const validatedRecords = bulkHistorySchema.safeParse(records)
  if (!validatedRecords.success) {
    return { error: 'Invalid input records' }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authorized' }
  }

  const inserts = validatedRecords.data.map(r => ({
    user_id: user.id,
    question_id: r.questionId,
    is_correct: r.isCorrect,
    user_answer: r.userAnswer,
    study_mode: studyMode
  }))

  const { error } = await supabase.from('histories').insert(inserts)

  if (error) {
    console.error("Failed to save bulk history:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function updateStreakAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, last_login_at')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  if (profile.last_login_at) {
    const lastLoginDate = new Date(profile.last_login_at)
    const lastLoginStr = lastLoginDate.toISOString().split('T')[0]

    // 今日すでにログイン済みなら何もしない
    if (todayStr === lastLoginStr) {
      return { success: true, streak: profile.streak_count }
    }

    // 昨日ログインしていたかチェック
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak = 1
    if (lastLoginStr === yesterdayStr) {
      newStreak = (profile.streak_count || 0) + 1
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_count: newStreak,
        last_login_at: now.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error("Streak update error:", updateError)
      return { error: updateError.message }
    }

    return { success: true, streak: newStreak }
  } else {
    // 初回ログイン
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_count: 1,
        last_login_at: now.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error("Streak initial update error:", updateError)
      return { error: updateError.message }
    }

    return { success: true, streak: 1 }
  }
}

/**
 * ブックマークの切り替えを行うアクション
 */
export async function toggleBookmarkAction(questionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // 既にブックマークされているか確認
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    // 削除
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id)
    
    if (error) return { error: error.message }
    return { success: true, bookmarked: false }
  } else {
    // 追加
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        question_id: questionId
      })
    
    if (error) return { error: error.message }
    return { success: true, bookmarked: true }
  }
}
