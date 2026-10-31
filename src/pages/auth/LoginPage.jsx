import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { demoUsers } from '../../data/mockData'
import { useAppContext } from '../../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setProfile } = useAppContext()
  const [form, setForm] = useState({ email: location.state?.email || 'aarav@student.dcrust.in', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

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

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const normalizedEmail = form.email.trim().toLowerCase()
    const registeredUsers = (() => {
      try {
        return JSON.parse(localStorage.getItem('scms-registered-users') || '[]')
      } catch {
        return []
      }
    })()
    const registeredUser = registeredUsers.find((account) => account.email.toLowerCase() === normalizedEmail)

    if (normalizedEmail === demoUsers.admin.email && form.password === 'prince@123') {
      setUser(demoUsers.admin)
      navigate('/admin')
      return
    }

    if (normalizedEmail === demoUsers.student.email && form.password === 'student123') {
      setUser(demoUsers.student)
      setProfile(demoUsers.student)
      navigate('/student')
      return
    }

    if (registeredUser && registeredUser.password === form.password) {
      const { password, ...studentUser } = registeredUser
      setUser(studentUser)
      setProfile(studentUser)
      navigate('/student')
      return
    }

    setErrors({ form: 'Email or password is incorrect. Use your registered student account or the demo credentials.' })
  }

  const demoLogin = (role) => {
    const selectedUser = role === 'student' ? demoUsers.student : demoUsers.admin
    setUser(selectedUser)
    navigate(role === 'student' ? '/student' : '/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
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
              <button onClick={() => demoLogin('student')} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left transition hover:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Demo Student Login</p>
                    <p className="text-xs text-slate-400">aarav@student.dcrust.in</p>
                  </div>
                  <UserRound size={18} className="text-blue-300" />
                </div>
              </button>

              <button onClick={() => demoLogin('admin')} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left transition hover:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Demo Admin Login · Prince</p>
                    <p className="text-xs text-slate-400">chahalprince0481@gmail.com</p>
                  </div>
                  <LockKeyhole size={18} className="text-blue-300" />
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Login to your account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-blue-500">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="name@domain.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-blue-500">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-slate-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" /> Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>

              <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
                Login
              </button>

              <p className="text-center text-sm text-slate-600">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600">Create one</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
