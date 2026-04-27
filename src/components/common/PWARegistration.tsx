'use client'

import { useEffect } from 'react'

export function PWARegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const isProduction = process.env.NODE_ENV === 'production'

    if (!isProduction) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch((error) => {
          console.warn('Failed to unregister service workers in development:', error)
        })

      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch((error) => {
            console.warn('Failed to clear caches in development:', error)
          })
      }

      return
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('SW registration failed:', error)
      })
    }

    if (document.readyState === 'complete') {
      void registerServiceWorker()
      return
    }

    window.addEventListener('load', registerServiceWorker, { once: true })
    return () => {
      window.removeEventListener('load', registerServiceWorker)
    }
  }, [])

  return null
}
