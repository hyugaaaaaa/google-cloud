'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

type AuthActionState = {
  error: string
}

async function getRequestOrigin() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  if (origin) return origin

  const forwardedHost = headersList.get('x-forwarded-host')
  const host = headersList.get('host')
  const protocol =
    headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

  if (forwardedHost) return `${protocol}://${forwardedHost}`
  if (host) return `${protocol}://${host}`

  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data?.url) {
    const errorMessage = encodeURIComponent(error?.message || 'google_auth_failed')
    redirect(`/login?error=${errorMessage}`)
  }

  redirect(data.url)
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

export async function loginWithGoogleAction() {
  await signInWithGoogle()
}

export async function signupWithGoogleAction() {
  await signInWithGoogle()
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
