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

function calculateXpForAnswer(isCorrect: boolean) {
  return isCorrect ? 12 : 4;
}

function calculateBulkBonus(
  records: { isCorrect: boolean }[],
  studyMode: string,
): number {
  if (studyMode === 'daily' && records.length >= 6) {
    return 20;
  }

  if (studyMode === 'mock' && records.length >= 20) {
    const correctCount = records.filter((record) => record.isCorrect).length;
    const score = correctCount / records.length;
    if (score >= 0.8) return 60;
    if (score >= 0.7) return 40;
  }

  return 0;
}

async function awardXp(userId: string, xpDelta: number, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (xpDelta <= 0) {
    return { xpAwarded: 0 };
  }

  const { data: xpResult, error: xpError } = await supabase.rpc('add_profile_xp', {
    target_user_id: userId,
    xp_delta: xpDelta,
  });

  if (xpError) {
    console.error('XP award failed:', xpError);
    return { xpAwarded: 0 };
  }

  const latest = Array.isArray(xpResult) ? xpResult[0] : null;

  return {
    xpAwarded: xpDelta,
    newXp: latest?.new_xp as number | undefined,
    newLevel: latest?.new_level as number | undefined,
  };
}

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

  const xpResult = await awardXp(user.id, calculateXpForAnswer(validated.data.isCorrect), supabase);

  return { success: true, ...xpResult }
}

export async function saveBulkHistoryAction(records: unknown[], studyMode: string = 'study') {
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

  const baseXp = validatedRecords.data.reduce(
    (sum, record) => sum + calculateXpForAnswer(record.isCorrect),
    0,
  );
  const bonusXp = calculateBulkBonus(validatedRecords.data, studyMode);
  const xpResult = await awardXp(user.id, baseXp + bonusXp, supabase);

  return { success: true, ...xpResult }
}

export async function updateStreakAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, last_login_at, last_streak_reward_at')
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

    const todayDate = todayStr;
    const rewardAlreadyGiven = profile.last_streak_reward_at === todayDate;
    let rewardXp = 0;
    let rewardLevel: number | undefined;

    if (!rewardAlreadyGiven && newStreak > 0 && newStreak % 7 === 0) {
      const reward = await awardXp(user.id, 75, supabase);
      rewardXp = reward.xpAwarded;
      rewardLevel = reward.newLevel;

      await supabase
        .from('profiles')
        .update({ last_streak_reward_at: todayDate })
        .eq('id', user.id);
    }

    return { success: true, streak: newStreak, rewardXp, rewardLevel }
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

    return { success: true, streak: 1, rewardXp: 0 }
  }
}

/**
 * ブックマークの切り替えを行うアクション
 */
export async function toggleBookmarkAction(questionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // 既にブックマークされているか確認（過去の重複データによるエラーを防ぐため limit(1) を使用）
  const { data: existingRecords, error: selectError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .limit(1)

  if (selectError) {
    console.error("Bookmark select error:", selectError);
    return { error: 'Failed to fetch bookmark status' }
  }

  const isBookmarked = existingRecords && existingRecords.length > 0;

  if (isBookmarked) {
    // 削除（重複データも一掃するため、idではなくuser_idとquestion_idで削除）
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', questionId)
    
    if (error) {
      console.error("Bookmark delete error:", error);
      return { error: error.message }
    }
    return { success: true, bookmarked: false }
  } else {
    // 追加
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        question_id: questionId
      })
    
    if (error) {
      // 連続クリックによるユニーク制約違反の場合はエラーとしない
      if (error.code === '23505') {
        return { success: true, bookmarked: true }
      }
      console.error("Bookmark insert error:", error);
      return { error: error.message }
    }
    return { success: true, bookmarked: true }
  }
}
