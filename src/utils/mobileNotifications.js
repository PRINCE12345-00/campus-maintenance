// Utility for Mobile & Web Push Notifications

// Play a pleasant alert chime using native Web Audio API
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(440, now) // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15) // E5

    gainNode.gain.setValueAtTime(0.15, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.35)
    osc2.stop(now + 0.35)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// Register service worker
export async function initServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return registration
  } catch (error) {
    console.warn('Service Worker registration skipped or failed:', error?.message)
    return null
  }
}

// Check notification support and permission state
export function getNotificationState() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' }
  }
  return {
    supported: true,
    permission: Notification.permission, // 'default', 'granted', 'denied'
  }
}

// Request permission from the student
export async function requestMobilePermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, reason: 'unsupported' }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      playNotificationChime()
      await initServiceWorker()

      // Trigger instant confirmation notification
      await triggerMobileNotification({
        title: '🔔 Mobile Alerts Enabled!',
        message: 'You will now receive real-time complaint updates directly on your device.',
        url: '/student/complaints',
        tag: 'welcome-alert',
      })

      localStorage.setItem('scms-mobile-alerts', 'enabled')
      return { success: true, permission: 'granted' }
    }
    return { success: false, permission }
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return { success: false, error: error.message }
  }
}

// Trigger a native notification on the phone / screen
export async function triggerMobileNotification({ title, message, url = '/student/complaints', tag }) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission !== 'granted') {
    return false
  }

  playNotificationChime()

  const options = {
    body: message,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: tag || `notif-${Date.now()}`,
    vibrate: [200, 100, 200, 100, 200],
    data: { url },
  }

  // 1. Try displaying via Service Worker registration (shows in Android notification shade / lock screen)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options)
        return true
      }
    } catch {
      // Fallback below
    }
  }

  // 2. Direct browser notification fallback
  try {
    const notif = new Notification(title, options)
    notif.onclick = () => {
      window.focus()
      if (url) window.location.href = url
    }
    return true
  } catch {
    return false
  }
}
