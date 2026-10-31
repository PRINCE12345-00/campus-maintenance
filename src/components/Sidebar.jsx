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

const departmentHeadLinks = [
  { to: '/department-head', label: 'Department overview', icon: Gauge },
]

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
    <aside className="h-full w-full bg-slate-950 text-slate-100 shadow-soft">
      <div className="flex items-center gap-3 border-b border-slate-800 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">D</div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">DCRUST</p>
          <h2 className="text-lg font-semibold text-white">Smart Campus</h2>
        </div>
      </div>

      <nav className="space-y-2 px-3 py-5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-slate-800 p-3">
        <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
