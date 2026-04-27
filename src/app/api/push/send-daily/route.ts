import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getPushErrorMessage,
  getPushErrorStatus,
  isStaleSubscriptionError,
  sendPushMessage,
  type StoredPushSubscription,
} from '@/lib/push/webpush'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REMINDER_URL = '/dashboard/daily'
const TOKYO_TIME_ZONE = 'Asia/Tokyo'

type ProfilePushState = {
  id: string
  push_opt_in: boolean
  last_push_reminder_at: string | null
}

type DailyPushSummary = {
  totalSubscriptions: number
  eligibleSubscriptions: number
  sent: number
  failed: number
  staleRemoved: number
  optedOutUsers: number
  skippedTodayUsers: number
  deliveryDate: string
}

function toTokyoDate(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TOKYO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(date)
}

function isAuthorizedRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

function buildReminderPayload() {
  return {
    title: 'CloudMaster',
    body: '今日のデイリーチャレンジを始めましょう。6問で学習習慣をキープできます。',
    url: REMINDER_URL,
  }
}

async function fetchSubscriptions() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')

  if (error) {
    throw new Error(`Failed to fetch push subscriptions: ${error.message}`)
  }

  return (data || []) as StoredPushSubscription[]
}

async function fetchProfileStates(userIds: string[]) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, push_opt_in, last_push_reminder_at')
    .in('id', userIds)

  if (error) {
    throw new Error(`Failed to fetch profile states: ${error.message}`)
  }

  return (data || []) as ProfilePushState[]
}

async function cleanupStaleSubscriptions(staleSubscriptions: StoredPushSubscription[]) {
  if (staleSubscriptions.length === 0) {
    return { staleRemoved: 0, optedOutUsers: 0 }
  }

  const admin = createAdminClient()
  const staleIds = staleSubscriptions.map((subscription) => subscription.id)
  const affectedUserIds = [...new Set(staleSubscriptions.map((subscription) => subscription.user_id))]

  const { error: deleteError } = await admin.from('push_subscriptions').delete().in('id', staleIds)

  if (deleteError) {
    throw new Error(`Failed to delete stale subscriptions: ${deleteError.message}`)
  }

  let optedOutUsers = 0
  for (const userId of affectedUserIds) {
    const { count, error: countError } = await admin
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      throw new Error(`Failed to count user subscriptions: ${countError.message}`)
    }

    if (!count) {
      const { error: profileError } = await admin
        .from('profiles')
        .update({ push_opt_in: false })
        .eq('id', userId)

      if (profileError) {
        throw new Error(`Failed to update push_opt_in for ${userId}: ${profileError.message}`)
      }

      optedOutUsers += 1
    }
  }

  return { staleRemoved: staleIds.length, optedOutUsers }
}

async function markDailyReminderSent(userIds: string[], deliveryDate: string) {
  if (userIds.length === 0) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ last_push_reminder_at: deliveryDate })
    .in('id', userIds)

  if (error) {
    throw new Error(`Failed to update last_push_reminder_at: ${error.message}`)
  }
}

async function runDailyPushDelivery(): Promise<DailyPushSummary> {
  const deliveryDate = toTokyoDate(new Date())
  const subscriptions = await fetchSubscriptions()

  if (subscriptions.length === 0) {
    return {
      totalSubscriptions: 0,
      eligibleSubscriptions: 0,
      sent: 0,
      failed: 0,
      staleRemoved: 0,
      optedOutUsers: 0,
      skippedTodayUsers: 0,
      deliveryDate,
    }
  }

  const uniqueUserIds = [...new Set(subscriptions.map((subscription) => subscription.user_id))]
  const profiles = await fetchProfileStates(uniqueUserIds)

  const profileMap = new Map<string, ProfilePushState>()
  profiles.forEach((profile) => profileMap.set(profile.id, profile))

  let skippedTodayUsers = 0
  const skippedUserSet = new Set<string>()

  const eligibleSubscriptions = subscriptions.filter((subscription) => {
    const profile = profileMap.get(subscription.user_id)
    if (!profile || !profile.push_opt_in) return false

    if (profile.last_push_reminder_at === deliveryDate) {
      if (!skippedUserSet.has(profile.id)) {
        skippedUserSet.add(profile.id)
        skippedTodayUsers += 1
      }
      return false
    }

    return true
  })

  const payload = buildReminderPayload()
  const staleSubscriptions: StoredPushSubscription[] = []
  const successfulUsers = new Set<string>()

  let sent = 0
  let failed = 0

  for (const subscription of eligibleSubscriptions) {
    try {
      await sendPushMessage(subscription, payload)
      sent += 1
      successfulUsers.add(subscription.user_id)
    } catch (error) {
      failed += 1
      const statusCode = getPushErrorStatus(error)
      console.error('Daily push delivery failed', {
        endpoint: subscription.endpoint,
        userId: subscription.user_id,
        statusCode,
        error: getPushErrorMessage(error),
      })

      if (isStaleSubscriptionError(error)) {
        staleSubscriptions.push(subscription)
      }
    }
  }

  const { staleRemoved, optedOutUsers } = await cleanupStaleSubscriptions(staleSubscriptions)
  await markDailyReminderSent([...successfulUsers], deliveryDate)

  return {
    totalSubscriptions: subscriptions.length,
    eligibleSubscriptions: eligibleSubscriptions.length,
    sent,
    failed,
    staleRemoved,
    optedOutUsers,
    skippedTodayUsers,
    deliveryDate,
  }
}

async function handleDelivery(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await runDailyPushDelivery()
    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Daily push delivery job failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected push delivery failure',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return handleDelivery(request)
}

export async function POST(request: NextRequest) {
  return handleDelivery(request)
}
