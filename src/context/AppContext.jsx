import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { demoUsers, initialComplaints, initialNotifications, initialPermissions } from '../data/mockData'
import {
  getNotificationState,
  initServiceWorker,
  requestMobilePermission as requestMobilePermissionUtil,
  triggerMobileNotification,
} from '../utils/mobileNotifications'
import { complaintsApi, notificationsApi, permissionsApi } from '../services/api'
import { getLocalRegisteredUsers } from '../utils/authStorage'

const AppContext = createContext(null)

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const getStoredUser = () => {
  const storedUser = safeParse(localStorage.getItem('scms-user'), demoUsers.student)
  return storedUser?.role === 'admin' ? demoUsers.admin : storedUser
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [complaints, setComplaints] = useState(() => safeParse(localStorage.getItem('scms-complaints'), initialComplaints))
  const [permissions, setPermissions] = useState(() => safeParse(localStorage.getItem('scms-permissions'), initialPermissions))
  const [notifications, setNotifications] = useState(() => safeParse(localStorage.getItem('scms-notifications'), initialNotifications))
  const [profile, setProfile] = useState(() => safeParse(localStorage.getItem('scms-profile'), demoUsers.student))
  const [mobilePermission, setMobilePermission] = useState(() => getNotificationState().permission)

  // Auto-sync fresh data from backend on load and when user changes
  const refreshData = useCallback(async () => {
    try {
      const [complaintsRes, permissionsRes, notificationsRes] = await Promise.allSettled([
        complaintsApi.getAll(),
        permissionsApi.getAll(),
        notificationsApi.getAll(),
      ])

      if (complaintsRes.status === 'fulfilled' && Array.isArray(complaintsRes.value?.data)) {
        setComplaints(complaintsRes.value.data)
      }
      if (permissionsRes.status === 'fulfilled' && Array.isArray(permissionsRes.value?.data)) {
        setPermissions(permissionsRes.value.data)
      }
      if (notificationsRes.status === 'fulfilled' && Array.isArray(notificationsRes.value?.data)) {
        setNotifications(notificationsRes.value.data)
      }
    } catch {
      // Fallback silently to localStorage
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData, user?.id, user?.email])

  // Initialize service worker and persistent registered user registry on mount
  useEffect(() => {
    initServiceWorker()
    getLocalRegisteredUsers()
  }, [])

  // Listen for storage events (cross-tab / multi-window sync for notifications)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'scms-complaints' && e.newValue) {
        setComplaints(safeParse(e.newValue, complaints))
      }
      if (e.key === 'scms-notifications' && e.newValue) {
        const nextNotifs = safeParse(e.newValue, [])
        setNotifications(nextNotifs)

        // If user is a student and a new notification arrived, pop up native notification on device
        if (user?.role === 'student' && nextNotifs.length > 0) {
          const latest = nextNotifs[0]
          if (!latest.isRead) {
            triggerMobileNotification({
              title: latest.title || 'Smart Campus Alert',
              message: latest.message || 'You have an update on your complaint.',
              url: '/student/complaints',
              tag: latest.id,
            })
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user, complaints])

  useEffect(() => {
    localStorage.setItem('scms-user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('scms-complaints', JSON.stringify(complaints))
  }, [complaints])

  useEffect(() => {
    localStorage.setItem('scms-permissions', JSON.stringify(permissions))
  }, [permissions])

  useEffect(() => {
    localStorage.setItem('scms-notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('scms-profile', JSON.stringify(profile))
  }, [profile])

  const requestMobilePermission = async () => {
    const res = await requestMobilePermissionUtil()
    setMobilePermission(getNotificationState().permission)
    return res
  }

  const notifyDevice = async ({ title, message, url }) => {
    return triggerMobileNotification({ title, message, url })
  }

  const value = useMemo(() => ({
    user,
    setUser,
    complaints,
    setComplaints,
    permissions,
    setPermissions,
    notifications,
    setNotifications,
    profile,
    setProfile,
    mobilePermission,
    requestMobilePermission,
    notifyDevice,
  }), [user, complaints, permissions, notifications, profile, mobilePermission])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
