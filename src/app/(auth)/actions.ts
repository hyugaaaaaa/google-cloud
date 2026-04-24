'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthActionState = {
  error: string
}

export async function loginAction(_: AuthActionState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signupAction(_: AuthActionState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string

  if (!email || !password || !nickname) {
    return { error: 'Email, password, and nickname are required' }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  const user = authData.user
  if (user) {
    // プロフィールはデータベース側のトリガー(handle_new_user)で自動作成されるため、
    // ここでは提供されたニックネームで更新を行う
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nickname: nickname,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update failed:', profileError)
      // 登録自体は成功しているので、ここでのエラーは致命的ではないが、
      // ユーザーに状況を伝えるためにエラーを返す
      return { error: 'プロフィールの更新に失敗しました。ログイン後に再度お試しください。' }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
