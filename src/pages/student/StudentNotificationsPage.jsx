import { BellRing, CheckCheck } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { getStudentNotifications } from '../../utils/studentRecords'

export default function StudentNotificationsPage() {
  const { notifications, setNotifications, user } = useAppContext()
  const visibleNotifications = getStudentNotifications(notifications, user)

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Notifications</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Inbox</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="space-y-4">
          {visibleNotifications.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">You have no notifications yet.</p>
          )}
          {visibleNotifications.map((notification) => (
            <div key={notification.id} className={`rounded-2xl border p-4 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-xl bg-white p-2 text-blue-600">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!notification.isRead && (
                  <button onClick={() => markAsRead(notification.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <CheckCheck size={16} /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
