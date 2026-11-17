import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { directResetLocalPassword } from '../../utils/authStorage'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState(location.state?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resolvedEmail, setResolvedEmail] = useState('')

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    const cleanId = identifier.trim()
    if (!cleanId) {
      setError('Please enter your registered email address or roll number.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    // 1. Try Backend API first if online
    try {
      const response = await authApi.directResetPassword({
        identifier: cleanId,
        newPassword,
      })

      const email = response?.data?.email || cleanId
      setResolvedEmail(email)

      // Also persist to local browser storage so it works offline forever
      directResetLocalPassword(cleanId, newPassword)

      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { state: { email } })
      }, 3000)
      return
    } catch (apiError) {
      console.warn('Backend unavailable or returned error, verifying against local storage:', apiError?.message)
    }

    // 2. Offline / Local Persistent Storage Fallback
    const localResult = directResetLocalPassword(cleanId, newPassword)
    setLoading(false)

    if (localResult.success) {
      const email = localResult.email || cleanId
      setResolvedEmail(email)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { state: { email } })
      }, 3000)
    } else {
      setError(localResult.message || 'No registered account found matching that email or roll number.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.15),_transparent_25%),linear-gradient(180deg,_#020817_0%,_#0f172a_30%,_#111827_100%)] px-4 py-8">
      <div className="w-full max-w-lg rounded-[30px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.6)] backdrop-blur-xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft size={16} /> Back to login
        </Link>

        {/* Header */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            <KeyRound size={16} /> Direct Password Recovery
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Reset Your Password</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter your registered email or university roll number and choose a new password.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 leading-relaxed">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleResetPassword} autoComplete="off" className="mt-6 space-y-5">
            {/* Identifier (Email or Roll Number) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Registered Email or University Roll Number
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="text"
                  name="reset-identifier"
                  autoComplete="off"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    setError('')
                  }}
                  className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-sm"
                  placeholder="name@student.dcrust.in or 23001001076"
                  autoFocus={!identifier}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-sm"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Confirm New Password</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm-new-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-sm"
                  placeholder="Re-enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.38)] transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating password…' : 'Save New Password & Reset'}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
              <p className="mt-2 text-sm text-slate-300">
                Your password has been updated securely. You can now login immediately with your new password.
              </p>
              <p className="mt-2 text-xs text-slate-400">Redirecting to login page in a few seconds…</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login', { state: { email: resolvedEmail } })}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
            >
              Go to Login Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
