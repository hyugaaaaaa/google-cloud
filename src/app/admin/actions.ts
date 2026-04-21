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

export async function createQuestionAction(data: {
  category_id: string;
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

  if (!data.category_id || !data.content.trim() || data.options.some(o => !o.trim()) || !data.answer) {
    return { error: '必須項目が入力されていません' }
  }

  // 重複チェック（問題文が既に存在しないか）

  const { data: existing } = await supabase
    .from('questions')
    .select('id')
    .ilike('content', data.content.trim())
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: '同じ問題文の問題が既に存在します' }
  }

  const { error } = await supabase
    .from('questions')
    .insert({
      category_id: data.category_id,
      content: data.content.trim(),
      options: data.options,
      answer: data.answer,
      explanation: data.explanation.trim(),
    })

  if (error) {
    // UNIQUE制約違反のハンドリング
    if (error.code === '23505') {
      return { error: '同じ問題文の問題が既に存在します' }
    }
    console.error('Create question error:', error)
    return { error: '問題の作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/questions')
  revalidatePath('/')
  return { success: true }
}

export async function bulkCreateQuestionsAction(items: {
  category: string;
  content: string;
  options: string[];
  answer: string;
  explanation: string;
}[]) {
  const supabase = await createClient()

  // 認証・管理者チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== 'hyuga0510@icloud.com') {
    return { error: '管理者権限が必要です' }
  }

  if (!items || items.length === 0) {
    return { error: '問題が含まれていません' }
  }

  if (items.length > 50) {
    return { error: '1回のインポートは50問までです' }
  }

  // カテゴリ一覧を取得してname→idのマップを作成
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')

  if (catError || !categories) {
    return { error: 'カテゴリの取得に失敗しました' }
  }

  const categoryMap = new Map(categories.map(c => [c.name.trim(), c.id]))

  // 既存の問題文を全件取得して重複チェック用セットを作成
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('content')

  const existingContents = new Set(
    (existingQuestions || []).map(q => q.content.trim().toLowerCase())
  )

  const results = { success: 0, failed: 0, skipped: 0, errors: [] as string[] }

  // バッチ内重複検出用セット
  const batchContents = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const lineNum = i + 1

    // バリデーション
    if (!item.content?.trim()) {
      results.failed++
      results.errors.push(`問題 ${lineNum}: 問題文が空です`)
      continue
    }
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      results.failed++
      results.errors.push(`問題 ${lineNum}: 選択肢は4つ必要です`)
      continue
    }
    if (item.options.some((o: string) => !o?.trim())) {
      results.failed++
      results.errors.push(`問題 ${lineNum}: 空の選択肢があります`)
      continue
    }
    if (!item.options.includes(item.answer)) {
      results.failed++
      results.errors.push(`問題 ${lineNum}: answer が options に含まれていません`)
      continue
    }

    const categoryId = categoryMap.get(item.category?.trim())
    if (!categoryId) {
      results.failed++
      results.errors.push(`問題 ${lineNum}: カテゴリ「${item.category}」が見つかりません`)
      continue
    }

    const normalizedContent = item.content.trim().toLowerCase()

    // DBに既に存在する問題との重複チェック
    if (existingContents.has(normalizedContent)) {
      results.skipped++
      results.errors.push(`問題 ${lineNum} をスキップ（重複）: ${item.content.slice(0, 30)}...`)
      continue
    }

    // 同バッチ内の重複チェック
    if (batchContents.has(normalizedContent)) {
      results.skipped++
      results.errors.push(`問題 ${lineNum} をスキップ（バッチ内重複）: ${item.content.slice(0, 30)}...`)
      continue
    }

    batchContents.add(normalizedContent)

    const { error } = await supabase.from('questions').insert({
      category_id: categoryId,
      content: item.content.trim(),
      options: item.options.map((o: string) => o.trim()),
      answer: item.answer.trim(),
      explanation: (item.explanation || '').trim(),
    })

    if (error) {
      if (error.code === '23505') {
        results.skipped++
        results.errors.push(`問題 ${lineNum} をスキップ（DB重複）: ${item.content.slice(0, 30)}...`)
      } else {
        results.failed++
        results.errors.push(`問題 ${lineNum}: DB挿入エラー - ${error.message}`)
      }
    } else {
      results.success++
      existingContents.add(normalizedContent) // 追加済みとしてマーク
    }
  }

  if (results.success > 0) {
    revalidatePath('/admin/questions')
    revalidatePath('/')
  }

  return results
}

