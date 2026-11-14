import { useState } from 'react'
import { ArrowLeft, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.rollNumber.trim()) nextErrors.rollNumber = 'Roll number is required.'
    else if (!/^\d{11}$/.test(form.rollNumber.trim())) nextErrors.rollNumber = 'Enter your 11-digit university roll number.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (form.email.trim().toLowerCase() === 'chahalprince0481@gmail.com') nextErrors.email = 'This email is reserved for the admin demo account.'
    if (!form.department.trim()) nextErrors.department = 'Department is required.'
    if (!form.password.trim() || form.password.length < 6) nextErrors.password = 'Password should be at least 6 characters.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      await authApi.register({
        name: form.name,
        rollNumber: form.rollNumber,
        email: form.email,
        department: form.department,
        password: form.password,
      })

      navigate('/login', { state: { email: form.email.trim().toLowerCase() } })
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.'
      setErrors({ email: message })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.15),_transparent_25%),linear-gradient(180deg,_#020817_0%,_#0f172a_30%,_#111827_100%)] px-4 py-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/60 shadow-[0_30px_90px_rgba(2,6,23,0.58)] backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-slate-950 p-8 text-white">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="mt-12">
              <p className="text-xs uppercase tracking-[0.22em] text-blue-300">Student registration</p>
              <h1 className="mt-4 text-4xl font-bold">Join the campus network</h1>
              <p className="mt-5 text-slate-300">Set up your account to submit issues, request permissions, and track activity in real time.</p>
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-300" size={22} />
                <div>
                  <p className="font-semibold">Secure demo flow</p>
                  <p className="text-sm text-slate-400">Frontend-only registration mock for demo purposes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Create account</p>
              <h2 className="mt-3 text-3xl font-bold text-white">Register as a student</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-blue-400/60 focus:ring-blue-500/20" placeholder="Your full name" />
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">University roll number</label>
                <input name="rollNumber" type="text" inputMode="numeric" maxLength={11} value={form.rollNumber} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-blue-400/60 focus:ring-blue-500/20" placeholder="Example: 23001001087" />
                {errors.rollNumber && <p className="mt-2 text-sm text-red-400">{errors.rollNumber}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Department</label>
                <input name="department" value={form.department} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-blue-400/60 focus:ring-blue-500/20" placeholder="CSE" />
                {errors.department && <p className="mt-2 text-sm text-red-400">{errors.department}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">University email</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                  <Mail size={18} className="text-slate-400" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500" placeholder="yourname@student.dcrust.in" />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-blue-400/60 focus:ring-blue-500/20" placeholder="Create password" />
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Confirm password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-blue-400/60 focus:ring-blue-500/20" placeholder="Confirm password" />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Register</button>
              </div>

              <div className="md:col-span-2 text-center text-sm text-slate-300">
                Already a member? <Link to="/login" className="font-semibold text-blue-300">Login here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
