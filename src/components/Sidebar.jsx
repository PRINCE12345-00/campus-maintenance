import { Bell, Building2, ClipboardCheck, Gauge, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const studentLinks = [
  { to: '/student', label: 'Overview', icon: Gauge },
  { to: '/student/complaints', label: 'My Complaints', icon: ClipboardCheck },
  { to: '/student/permissions', label: 'Permissions', icon: ShieldCheck },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
]

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: Gauge },
  { to: '/admin/complaints', label: 'Complaints', icon: ClipboardCheck },
  { to: '/admin/permissions', label: 'Permissions', icon: ShieldCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: Building2 },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
]

const departmentHeadLinks = [{ to: '/department-head', label: 'Department overview', icon: Gauge }]
const authorityLinks = [{ to: '/', label: 'Authority dashboard', icon: Gauge }]

export default function Sidebar({ role = 'student' }) {
  const navigate = useNavigate()
  const { setUser } = useAppContext()
  const links = role === 'admin' ? adminLinks : role === 'department_head' ? departmentHeadLinks : ['cultural_coordinator', 'technical_coordinator', 'dsw', 'registrar', 'vice_chancellor'].includes(role) ? authorityLinks.map((item) => ({ ...item, to: `/${role === 'vice_chancellor' ? 'vice-chancellor' : role.replaceAll('_', '-')}` })) : studentLinks

  const handleSignOut = () => {
    localStorage.removeItem('scms-user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
<<<<<<< HEAD
    <aside className="h-full w-full bg-slate-950 text-slate-100 shadow-soft">
      <div className="flex items-center gap-3 border-b border-slate-800 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">D</div>
=======
    <aside className="h-full w-full border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.9))] text-slate-100 shadow-[0_32px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <img src={universityLogo} alt="DCRUST university logo" className="h-9 w-9 rounded-xl bg-white object-contain p-1" />
        </div>
>>>>>>> bca09af (UPDATED)
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">DCRUST</p>
          <h2 className="text-lg font-semibold text-white">Smart Campus</h2>
        </div>
      </div>

      <div className="px-3 py-5">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-[0_14px_30px_rgba(37,99,235,0.4)] ring-1 ring-blue-400/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? 'bg-white/10' : 'bg-slate-800/80'}`}>
                    <Icon size={16} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80">
            <LogOut size={16} />
          </span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
