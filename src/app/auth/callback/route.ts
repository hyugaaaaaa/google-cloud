import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath) return '/onboarding'
  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return '/onboarding'
  return nextPath
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const safeNextPath = sanitizeNextPath(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(safeNextPath, requestUrl.origin))
    }

    console.error('Google OAuth callback failed:', error.message)
  }

  const errorDescription =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error') ||
    'google_auth_failed'

  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', errorDescription)
  return NextResponse.redirect(loginUrl)
}
