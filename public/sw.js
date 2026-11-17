// Smart Campus Service Worker for Mobile & Web Push Notifications

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen for messages from frontend client to trigger native notification
self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data
    event.waitUntil(
      self.registration.showNotification(title || 'Smart Campus Alert', {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: false,
        ...options,
      })
    )
  }
})

// Web Push event listener
self.addEventListener('push', (event) => {
  let payload = { title: 'Smart Campus Alert', message: 'You have a new update.' }
  try {
    if (event.data) {
      payload = event.data.json()
    }
  } catch {
    payload = { title: 'Smart Campus Alert', message: event.data ? event.data.text() : 'Update received.' }
  }

  const options = {
    body: payload.message || payload.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/student/complaints',
    },
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Smart Campus Maintenance', options)
  )
})

// Notification click event: opens or focuses the portal
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/student/complaints'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/student') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
