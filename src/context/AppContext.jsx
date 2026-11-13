import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers, initialComplaints, initialNotifications, initialPermissions } from '../data/mockData'

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
  }), [user, complaints, permissions, notifications, profile])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
