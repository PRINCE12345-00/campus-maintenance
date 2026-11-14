import { Bell, Menu, Search, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function Navbar({ role = 'student', onToggleSidebar, showSidebarButton = false }) {
  const { notifications, user } = useAppContext()
  const unreadCount = notifications.filter((item) => !item.isRead).length

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showSidebarButton && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 lg:hidden"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search campus records"
              className="w-52 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={role === 'admin' ? '/admin/notifications' : role === 'department_head' ? '/department-head' : ['cultural_coordinator', 'technical_coordinator', 'dsw', 'registrar', 'vice_chancellor'].includes(role) ? `/${role === 'vice_chancellor' ? 'vice-chancellor' : role.replaceAll('_', '-')}` : '/student/notifications'}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-[10px] font-semibold text-white shadow-lg shadow-rose-500/30">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_10px_25px_rgba(2,6,23,0.45)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-violet-500/20 ring-1 ring-white/10">
              <UserCircle2 size={26} className="text-sky-200" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.name || 'Campus User'}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
