'use client'
import { useEffect } from 'react'

export function usePushSubscription() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function subscribe() {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const existing = await reg.pushManager.getSubscription()
      if (existing) return

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
    }

    subscribe()
  }, [])
}
