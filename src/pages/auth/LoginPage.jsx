import { useState } from 'react'
import { ArrowLeft, ChevronDown, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { demoUsers } from '../../data/mockData'
import { useAppContext } from '../../context/AppContext'
import { authApi } from '../../services/api'

const demoRoleOptions = [
  { value: 'student', label: 'Student', email: 'aarav@student.dcrust.in' },
  { value: 'admin', label: 'Admin', email: 'chahalprince0481@gmail.com' },
  { value: 'department_head', label: 'Department Head', email: 'hod.cse@dcrust.in' },
  { value: 'cultural_coordinator', label: 'Cultural Coordinator', email: 'cultural.coordinator@dcrust.in' },
  { value: 'technical_coordinator', label: 'Technical Coordinator', email: 'technical.coordinator@dcrust.in' },
  { value: 'dsw', label: 'DSW', email: 'dsw@dcrust.in' },
  { value: 'registrar', label: 'Registrar', email: 'registrar@dcrust.in' },
  { value: 'vice_chancellor', label: 'Vice Chancellor', email: 'vc@dcrust.in' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setProfile } = useAppContext()
  const [form, setForm] = useState({ email: location.state?.email || 'aarav@student.dcrust.in', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemoRole, setSelectedDemoRole] = useState('student')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password.trim()) nextErrors.password = 'Password is required.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      const { data } = await authApi.login({
        email: form.email,
        password: form.password,
      })

      const user = data.user
      setUser(user)
      if (user.role === 'student') {
        setProfile(user)
      }
      const routeByRole = {
        admin: '/admin',
        department_head: '/department-head',
        cultural_coordinator: '/cultural-coordinator',
        technical_coordinator: '/technical-coordinator',
        dsw: '/dsw',
        registrar: '/registrar',
        vice_chancellor: '/vice-chancellor',
        student: '/student',
      }
      navigate(routeByRole[user.role] || '/student')
    } catch (error) {
      const message = error?.response?.data?.message || 'Email or password is incorrect. Use your registered student account or the demo credentials.'
      setErrors({ form: message })
    }
  }

  const demoLogin = (role) => {
    const userByRole = {
      student: demoUsers.student,
      admin: demoUsers.admin,
      department_head: demoUsers.departmentHead,
      cultural_coordinator: demoUsers.culturalCoordinator,
      technical_coordinator: demoUsers.technicalCoordinator,
      dsw: demoUsers.dsw,
      registrar: demoUsers.registrar,
      vice_chancellor: demoUsers.viceChancellor,
    }
    const selectedUser = userByRole[role]
    setUser(selectedUser)
    navigate(role === 'student' ? '/student' : role === 'admin' ? '/admin' : role === 'department_head' ? '/department-head' : `/${role === 'vice_chancellor' ? 'vice-chancellor' : role.replaceAll('_', '-')}`)
  }

  const selectedDemoUser = demoRoleOptions.find((option) => option.value === selectedDemoRole) || demoRoleOptions[0]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.15),_transparent_25%),linear-gradient(180deg,_#020817_0%,_#0f172a_30%,_#111827_100%)] px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/60 shadow-[0_30px_90px_rgba(2,6,23,0.58)] backdrop-blur-xl">
        <div className="grid lg:grid-cols-2">
          <div className="bg-slate-950 p-8 text-white lg:p-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="mt-12">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-300">DCRUST</p>
              <h1 className="mt-4 text-4xl font-bold">Smart Campus Portal</h1>
              <p className="mt-5 text-slate-300">
                Manage complaints, permission requests, and campus operations from a single responsive dashboard.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Quick demo access</label>
                <div className="relative">
                  <select
                    value={selectedDemoRole}
                    onChange={(event) => setSelectedDemoRole(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 pr-10 text-sm font-medium text-white outline-none transition focus:border-blue-400/60"
                    aria-label="Select demo login role"
                  >
                    {demoRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-3 py-2.5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-300">Selected role</p>
                    <p className="mt-1 text-sm font-semibold text-white">{selectedDemoUser.label}</p>
                    <p className="text-xs text-slate-400">{selectedDemoUser.email}</p>
                  </div>
                  <UserRound size={18} className="text-blue-300" />
                </div>

                <button
                  type="button"
                  onClick={() => demoLogin(selectedDemoRole)}
                  className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.30)] transition hover:brightness-110"
                >
                  Login as {selectedDemoUser.label}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-6 sm:p-8 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Welcome back</p>
              <h2 className="mt-3 text-3xl font-bold text-white">Login to your account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-400/20">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="name@domain.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>

              {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-400/20">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-slate-400 transition hover:text-slate-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-950" /> Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">Forgot password?</Link>
              </div>

              <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.38)] transition hover:brightness-110">
                Login
              </button>

              <div className="text-center text-sm text-slate-300">
                Need an account? <Link to="/register" className="font-semibold text-blue-300">Create one</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
