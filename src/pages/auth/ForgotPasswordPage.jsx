import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setError('Please enter your registered email address.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.15),_transparent_25%),linear-gradient(180deg,_#020817_0%,_#0f172a_30%,_#111827_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.58)] backdrop-blur-xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Reset password</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Forgot your password?</h1>
          <p className="mt-4 text-slate-300">Enter your university email. We’ll send a reset link for demo purposes.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                <Mail size={18} className="text-slate-400" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500" placeholder="name@student.dcrust.in" />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.38)] transition hover:brightness-110">Send reset link</button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            A password reset link has been prepared for demo use. Please return to the login page and continue with the demo credentials.
          </div>
        )}
      </div>
    </div>
  )
}
