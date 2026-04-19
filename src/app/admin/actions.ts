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

  // 認証チェック（必要に応じて）
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証が必要です' }
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
