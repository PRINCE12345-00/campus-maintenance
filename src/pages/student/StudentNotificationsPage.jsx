import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Megaphone,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import MobileNotificationBanner from '../../components/MobileNotificationBanner'
import { useAppContext } from '../../context/AppContext'
import { notificationsApi } from '../../services/api'
import { getStudentNotifications } from '../../utils/studentRecords'

export default function StudentNotificationsPage() {
  const location = useLocation()
  const { notifications, setNotifications, user } = useAppContext()
  const [successBanner, setSuccessBanner] = useState('')

  const isAdmin = location.pathname.startsWith('/admin') || user?.role === 'admin'

  // If in Admin workspace, admin sees all notifications; otherwise, filter by student identity
  const visibleNotifications = useMemo(() => {
    if (isAdmin) {
      return notifications || []
    }
    return getStudentNotifications(notifications, user)
  }, [isAdmin, notifications, user])

  // Automatically mark visible notifications as read on page load so badge drops to 0!
  useEffect(() => {
    const hasUnread = visibleNotifications.some((n) => !n.isRead)
    if (hasUnread) {
      // Optimistically update context
      setNotifications((prev) =>
        prev.map((item) => {
          if (isAdmin || (user?.email && item.userEmail?.toLowerCase() === user.email.toLowerCase())) {
            return { ...item, isRead: true }
          }
          return item
        })
      )

      // Persist to backend disk
      notificationsApi.markAllRead(isAdmin ? '' : user?.email).catch(() => {})
    }
  }, [isAdmin, user?.email, visibleNotifications, setNotifications])

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
    try {
      await notificationsApi.markRead(id)
    } catch {
      // silently handle
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    setSuccessBanner('✓ All notifications marked as read!')
    try {
      await notificationsApi.markAllRead(isAdmin ? '' : user?.email)
    } catch {
      // silently handle
    }
    setTimeout(() => setSuccessBanner(''), 4000)
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your notification history?')) return
    setNotifications((prev) => {
      if (isAdmin) return []
      return prev.filter((item) => item.userEmail && item.userEmail.toLowerCase() !== (user?.email || '').toLowerCase())
    })
    setSuccessBanner('✓ Notifications cleared!')
    try {
      await notificationsApi.clearAll(isAdmin ? '' : user?.email)
    } catch {
      // silently handle
    }
    setTimeout(() => setSuccessBanner(''), 4000)
  }

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-eyebrow">{isAdmin ? 'Admin Workspace' : 'Student Workspace'}</p>
          <h1 className="page-heading">Notifications &amp; Activity Alerts</h1>
          <p className="mt-1 text-xs text-slate-400">
            {isAdmin
              ? 'Real-time alert stream of campus complaints, permissions, and broadcast notices.'
              : 'Updates regarding your submitted complaints, permissions, and department announcements.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 px-3.5 py-2.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/25 shadow-sm"
            >
              <CheckCheck size={14} className="text-sky-300" />
              <span>Mark All as Read</span>
            </button>
          )}

          {visibleNotifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white shadow-sm"
            >
              <Trash2 size={14} className="text-slate-400" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-3.5 text-xs font-semibold text-emerald-200 shadow-xl backdrop-blur-md">
          <Check size={16} className="text-emerald-400" />
          <span>{successBanner}</span>
        </div>
      )}

      <MobileNotificationBanner />

      {/* Notifications Container */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2 text-white">
            <Bell size={18} className="text-sky-400" />
            <h2 className="text-base font-bold">Activity Inbox</h2>
          </div>
          <span className="text-xs text-slate-400">
            {visibleNotifications.length} total • <span className={unreadCount > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>{unreadCount} unread</span>
          </span>
        </div>

        <div className="space-y-3">
          {visibleNotifications.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-xs text-slate-400">
              <Bell className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">Your notification inbox is clear.</p>
              <p className="mt-1">New updates regarding complaints, permissions, or campus announcements will show up here.</p>
            </div>
          )}

          {visibleNotifications.map((item) => {
            const isRead = item.isRead
            const isAnnouncement = item.type === 'announcement'
            const isPermission = item.type === 'permission' || item.title?.toLowerCase().includes('permission')
            const isComplaint = item.type === 'complaint' || item.title?.toLowerCase().includes('complaint')

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  !isRead
                    ? 'border-sky-500/40 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 shadow-md ring-1 ring-sky-500/20'
                    : 'border-white/5 bg-slate-950/40 opacity-80 hover:opacity-100 hover:border-white/10'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isAnnouncement
                          ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
                          : isPermission
                          ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                          : isComplaint
                          ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isAnnouncement ? <Megaphone size={16} /> : isPermission ? <ShieldCheck size={16} /> : <FileText size={16} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`font-semibold text-sm ${!isRead ? 'text-white font-bold' : 'text-slate-200'}`}>
                          {item.title}
                        </p>
                        {!isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                        )}
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {item.type || 'Notice'}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.message}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                        </span>
                        {item.userEmail && (
                          <span className="font-mono text-slate-400">
                            To: {item.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    >
                      <Check size={13} />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
