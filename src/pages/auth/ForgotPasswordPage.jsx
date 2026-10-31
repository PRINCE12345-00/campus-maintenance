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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reset password</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Forgot your password?</h1>
          <p className="mt-4 text-slate-600">Enter your university email. We’ll send a reset link for demo purposes.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-blue-500">
                <Mail size={18} className="text-slate-400" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 bg-transparent outline-none placeholder:text-slate-400" placeholder="name@student.dcrust.in" />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Send reset link</button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            A password reset link has been prepared for demo use. Please return to the login page and continue with the demo credentials.
          </div>
        )}
      </div>
    </div>
  )
}
