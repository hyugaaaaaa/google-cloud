import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPushErrorMessage,
  isStaleSubscriptionError,
  sendPushMessage,
  type StoredPushSubscription,
} from '@/lib/push/webpush'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const subscriptions = (data || []) as StoredPushSubscription[]

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: 'No active push subscriptions found' }, { status: 400 })
  }

  const payload = {
    title: 'CloudMaster テスト通知',
    body: '通知設定は正常です。このままデイリー通知を受け取れます。',
    url: '/dashboard/daily',
  }

  const staleIds: string[] = []
  let sent = 0

  for (const subscription of subscriptions) {
    try {
      await sendPushMessage(subscription, payload)
      sent += 1
    } catch (error) {
      console.error('Test push delivery failed', {
        endpoint: subscription.endpoint,
        userId: subscription.user_id,
        error: getPushErrorMessage(error),
      })

      if (isStaleSubscriptionError(error)) {
        staleIds.push(subscription.id)
      }
    }
  }

  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds)

    const { count } = await supabase
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (!count) {
      await supabase
        .from('profiles')
        .update({ push_opt_in: false })
        .eq('id', user.id)
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    total: subscriptions.length,
    staleRemoved: staleIds.length,
  })
}
