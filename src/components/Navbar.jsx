import { Bell, Menu, Search, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function Navbar({ role = 'student', onToggleSidebar, showSidebarButton = false }) {
  const { notifications, user } = useAppContext()
  const unreadCount = notifications.filter((item) => !item.isRead).length

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showSidebarButton && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search campus records"
              className="w-52 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={role === 'admin' ? '/admin/notifications' : '/student/notifications'} className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <UserCircle2 size={30} className="text-slate-600" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Campus User'}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
