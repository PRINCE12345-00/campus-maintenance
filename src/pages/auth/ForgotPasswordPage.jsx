import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Send, ShieldCheck, RefreshCw } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Steps: 1 = Request OTP, 2 = Verify OTP & Reset Password
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [resolvedEmail, setResolvedEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Clear any unwanted autofill on initial mount
  useEffect(() => {
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
  }, [])

  // Cooldown countdown for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Step 1: Send OTP to student's registered email
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setInfoMessage('')

    const cleanId = identifier.trim()
    if (!cleanId) {
      setError('Please enter your registered email address or university roll number.')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.forgotPassword({ identifier: cleanId })
      const data = response?.data || {}

      setMaskedEmail(data.maskedEmail || data.email || cleanId)
      setResolvedEmail(data.email || cleanId)
      setInfoMessage(`A 6-digit verification code has been sent to ${data.maskedEmail || data.email || 'your email'}.`)
      setStep(2)
      setResendCooldown(60) // 60 seconds cooldown
    } catch (err) {
      console.error('Request OTP failed:', err)
      setError(err?.response?.data?.message || 'No registered account found with that email or roll number.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and save new password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    const cleanId = identifier.trim()
    const cleanOtp = otp.trim()

    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code sent to your email.')
      return
    }

    if (cleanOtp.length !== 6) {
      setError('Verification code must be exactly 6 digits.')
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

    try {
      const response = await authApi.resetPassword({
        identifier: cleanId,
        otp: cleanOtp,
        newPassword,
      })

      const email = response?.data?.email || resolvedEmail || cleanId
      setResolvedEmail(email)
      setSuccess(true)

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { email } })
      }, 3000)
    } catch (err) {
      console.error('Reset password failed:', err)
      setError(err?.response?.data?.message || 'Invalid or expired verification code. Please check and try again.')
    } finally {
      setLoading(false)
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
            <KeyRound size={16} /> Verified Password Recovery
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Reset Your Password</h1>
          <p className="mt-2 text-sm text-slate-300">
            {step === 1
              ? 'Enter your registered email or university roll number to receive a secure verification code.'
              : `Enter the 6-digit code sent to ${maskedEmail || 'your email'} and set your new password.`}
          </p>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-950/40 p-3.5 text-xs text-blue-300 flex items-center gap-2.5 leading-relaxed">
            <Mail size={16} className="shrink-0 text-blue-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 leading-relaxed">
            {error}
          </div>
        )}

        {!success ? (
          step === 1 ? (
            /* STEP 1: Enter Identifier & Request OTP */
            <form onSubmit={handleRequestOtp} autoComplete="off" className="mt-6 space-y-5">
              {/* Hidden dummy fields to divert aggressive browser password managers */}
              <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
                <input type="text" name="fake_username_prevention" tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Registered Email or University Roll Number
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#090e1a] px-3.5 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    name="reset_user_identity"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      setError('')
                    }}
                    className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-sm"
                    placeholder="name@student.dcrust.in or 23001001076"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.38)] transition hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending verification code…</span>
                ) : (
                  <>
                    <Send size={16} /> Send Verification Code (OTP)
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter OTP & New Password */
            <form onSubmit={handleVerifyOtpAndReset} autoComplete="off" className="mt-6 space-y-5">
              {/* Hidden dummy fields to divert aggressive browser password managers */}
              <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
                <input type="text" name="fake_username_prevention" tabIndex={-1} autoComplete="off" />
                <input type="password" name="fake_password_prevention" tabIndex={-1} autoComplete="new-password" />
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    6-Digit Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setError('')
                      setInfoMessage('')
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    Change Roll No / Email
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#090e1a] px-3.5 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                  <ShieldCheck size={18} className="text-blue-400 shrink-0" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    name="reset_otp_code"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setOtp(val)
                      setError('')
                    }}
                    className="w-full border-0 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-base tracking-[0.3em] font-mono font-bold"
                    placeholder="123456"
                    autoFocus
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#090e1a] px-3.5 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                  <LockKeyhole size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="reset_new_secret"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
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
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Confirm New Password</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#090e1a] px-3.5 py-3 ring-1 ring-transparent transition focus-within:border-blue-400/60 focus-within:ring-blue-500/20">
                  <LockKeyhole size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="reset_confirm_secret"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
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
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.38)] transition hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying & updating password…' : 'Verify Code & Reset Password'}
              </button>

              {/* Resend OTP */}
              <div className="flex items-center justify-center text-xs text-slate-400 pt-1">
                {resendCooldown > 0 ? (
                  <span>Resend code in <strong className="text-blue-400 font-mono">{resendCooldown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>
            </form>
          )
        ) : (
          /* Success Screen */
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
              <p className="mt-2 text-sm text-slate-300">
                Your password has been securely updated. You can now log in immediately with your new password.
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

