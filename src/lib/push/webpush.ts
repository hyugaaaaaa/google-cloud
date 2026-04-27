import 'server-only'

import webpush from 'web-push'

export type StoredPushSubscription = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

type PushPayload = {
  title: string
  body: string
  url: string
}

type WebPushError = Error & {
  statusCode?: number
  body?: string
}

let webPushConfigured = false

function resolveVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
}

function resolveVapidPrivateKey() {
  return process.env.VAPID_PRIVATE_KEY
}

function resolveVapidSubject() {
  return process.env.VAPID_SUBJECT || 'mailto:support@cloudmaster.app'
}

function ensureWebPushConfigured() {
  if (webPushConfigured) return

  const publicKey = resolveVapidPublicKey()
  const privateKey = resolveVapidPrivateKey()
  const subject = resolveVapidSubject()

  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY/NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are required.')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  webPushConfigured = true
}

function toWebPushSubscription(subscription: StoredPushSubscription) {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  }
}

export async function sendPushMessage(subscription: StoredPushSubscription, payload: PushPayload) {
  ensureWebPushConfigured()
  const serialized = JSON.stringify(payload)
  return webpush.sendNotification(toWebPushSubscription(subscription), serialized)
}

export function isStaleSubscriptionError(error: unknown) {
  const webPushError = error as WebPushError
  return webPushError.statusCode === 404 || webPushError.statusCode === 410
}

export function getPushErrorStatus(error: unknown) {
  const webPushError = error as WebPushError
  return webPushError.statusCode || null
}

export function getPushErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Unknown push delivery error'
}
