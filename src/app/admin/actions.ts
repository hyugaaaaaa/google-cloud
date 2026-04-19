'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateQuestionAction(id: string, updates: {
  content: string;
  options: string[];
  answer: string;
  explanation: string;
}) {
  const supabase = await createClient()

  // 認証・管理者チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== 'hyuga0510@icloud.com') {
    return { error: '管理者権限が必要です' }
  }

  const { error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Update question error:', error)
    return { error: '問題の更新に失敗しました' }
  }

  revalidatePath('/admin/questions')
  revalidatePath('/dashboard')
  revalidatePath('/')
  
  return { success: true }
}

export async function deleteQuestionAction(id: string) {
  const supabase = await createClient()

  // 認証・管理者チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== 'hyuga0510@icloud.com') {
    return { error: '管理者権限が必要です' }
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: '削除に失敗しました' }
  }

  revalidatePath('/admin/questions')
  return { success: true }
}
