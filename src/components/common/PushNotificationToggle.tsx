'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

function base64UrlToUint8Array(base64Url: string) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData.split('').map((char) => char.charCodeAt(0)))
}

type PushNotificationToggleProps = {
  initialOptIn?: boolean
}

export function PushNotificationToggle({ initialOptIn = false }: PushNotificationToggleProps) {
  const [enabled, setEnabled] = useState(initialOptIn)
  const [isPending, setIsPending] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
  )

  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  }, [])

  const resolveVapidPublicKey = useCallback(async () => {
    if (vapidPublicKey) return vapidPublicKey

    try {
      const response = await fetch('/api/push/public-key', {
        method: 'GET',
        cache: 'no-store',
      })
      const result = (await response.json().catch(() => null)) as
        | { publicKey?: string; error?: string }
        | null

      if (!response.ok || !result?.publicKey) {
        return null
      }

      setVapidPublicKey(result.publicKey)
      return result.publicKey
    } catch (error) {
      console.error('Failed to load VAPID public key:', error)
      return null
    }
  }, [vapidPublicKey])

  useEffect(() => {
    if (!supported) return

    const syncSubscriptionState = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription) {
          setEnabled(true)
        }
      } catch (error) {
        console.error('Failed to sync push subscription state:', error)
      }
    }

    void syncSubscriptionState()
  }, [supported])

  useEffect(() => {
    if (!supported || vapidPublicKey) return
    void resolveVapidPublicKey()
  }, [supported, vapidPublicKey, resolveVapidPublicKey])

  const enableNotifications = async () => {
    if (!supported) {
      toast.error('このブラウザはプッシュ通知に対応していません。')
      return
    }

    const key = await resolveVapidPublicKey()

    if (!key) {
      toast.error('通知設定が未完了です（VAPIDキー未設定）。')
      return
    }

    setIsPending(true)
    try {
      if (Notification.permission === 'denied') {
        toast.error('ブラウザ設定で通知がブロックされています。設定を変更してください。')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('通知許可が必要です。')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      const existingSubscription = await registration.pushManager.getSubscription()
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(key),
        }))

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) {
        throw new Error('Subscription API failed')
      }

      setEnabled(true)
      toast.success('デイリー通知を有効化しました。')
    } catch (error) {
      console.error(error)
      toast.error('通知の有効化に失敗しました。')
    } finally {
      setIsPending(false)
    }
  }

  const disableNotifications = async () => {
    if (!supported) return

    setIsPending(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()

      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }

      setEnabled(false)
      toast.success('デイリー通知をオフにしました。')
    } catch (error) {
      console.error(error)
      toast.error('通知設定の更新に失敗しました。')
    } finally {
      setIsPending(false)
    }
  }

  const sendTestNotification = async () => {
    if (!enabled) {
      toast.error('先に通知を有効化してください。')
      return
    }

    if (!supported) {
      toast.error('このブラウザはプッシュ通知に対応していません。')
      return
    }

    setIsTesting(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()

      if (!subscription) {
        toast.error('購読情報が見つかりません。通知を再度有効化してください。')
        return
      }

      // サーバー側購読が消えていた場合に備えてテスト前に同期する
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })

      const response = await fetch('/api/push/test', {
        method: 'POST',
      })

      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        toast.error(result?.error || 'テスト通知の送信に失敗しました。')
        return
      }

      toast.success('テスト通知を送信しました。通知センターを確認してください。')
    } catch (error) {
      console.error(error)
      toast.error('テスト通知の送信に失敗しました。')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="qz-card p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-qz-blue">Daily Reminder</p>
        <p className="text-sm font-bold text-qz-text-light mt-1">PWA通知で、学習の継続をサポートします。</p>
      </div>

      {enabled ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isTesting || isPending}
            onClick={sendTestNotification}
            className="rounded-xl border-2 border-qz-blue/20 bg-qz-blue/10 px-4 py-2 text-sm font-black text-qz-blue transition-colors hover:bg-qz-blue/15 disabled:opacity-60"
          >
            {isTesting ? '送信中...' : 'テスト通知'}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={disableNotifications}
            className="rounded-xl border-2 border-qz-border px-4 py-2 text-sm font-black text-qz-text transition-colors hover:bg-qz-bg dark:border-[#2E3856] dark:text-white dark:hover:bg-[#2E3856]"
          >
            <span className="inline-flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              {isPending ? '更新中...' : '通知をオフ'}
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={enableNotifications}
          className="qz-btn-primary !py-2 !px-4 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {isPending ? '有効化中...' : '通知を有効化'}
          </span>
        </button>
      )}
    </div>
  )
}
