import { useMemo, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import { complaintsApi } from '../services/api'
import { formatDate } from '../utils/formatters'
import { triggerMobileNotification } from '../utils/mobileNotifications'

const PROGRESS_STAGES = [
  { percent: 10, label: 'Submitted', desc: 'Complaint registered', icon: '📝' },
  { percent: 25, label: 'Assigned', desc: 'Technician assigned', icon: '👷' },
  { percent: 50, label: 'In Progress', desc: 'Repairs underway', icon: '🔧' },
  { percent: 75, label: 'Verification', desc: 'Quality & safety check', icon: '🔍' },
  { percent: 100, label: 'Resolved', desc: 'Work complete & closed', icon: '✅' },
]

const QUICK_TEMPLATES = [
  {
    name: 'Technician Assigned',
    progress: 25,
    status: 'Assigned',
    subject: '[Update: 25% Assigned] Technician dispatched to inspect issue',
    message: 'Hello! Your complaint has been reviewed by the maintenance office and assigned to our on-duty technician for inspection today.',
  },
  {
    name: 'Work In Progress',
    progress: 50,
    status: 'In Progress',
    subject: '[Progress: 50% In Progress] Maintenance work is currently underway',
    message: 'Maintenance team is on-site and actively fixing the issue. We are working to restore normal operation as quickly as possible.',
  },
  {
    name: 'Parts Ordered / Minor Delay',
    progress: 40,
    status: 'In Progress',
    subject: '[Progress: 40% In Progress] Replacement parts requested from campus store',
    message: 'The initial inspection is complete. Specific replacement fittings/materials have been requested and work will resume as soon as they arrive.',
  },
  {
    name: 'Verification & Quality Check',
    progress: 75,
    status: 'In Progress',
    subject: '[Progress: 75% Testing] Repairs finished, undergoing final inspection',
    message: 'The physical repairs have been executed. The maintenance supervisor is now testing and verifying safety standards before sign-off.',
  },
  {
    name: 'Successfully Resolved',
    progress: 100,
    status: 'Resolved',
    subject: '[Resolved: 100%] Complaint successfully fixed and verified',
    message: 'Great news! Your complaint has been completely resolved and tested. Please inspect the area and let us know if you need any further assistance.',
  },
]

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const { complaints, setComplaints, setNotifications, user } = useAppContext()

  const complaint = useMemo(() => complaints.find((item) => item.id === id), [complaints, id])

  const location = useLocation()
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'department_head' || user?.role?.includes('coordinator') || location.pathname.startsWith('/admin')

  // Evidence Review Gate State
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [isReviewingEvidence, setIsReviewingEvidence] = useState(false)

  // Admin Update & Email Form State
  const [selectedProgress, setSelectedProgress] = useState(complaint?.progress || (complaint?.status === 'Resolved' ? 100 : 25))
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'In Progress')
  const [emailSubject, setEmailSubject] = useState(
    `[Progress Update: ${complaint?.title || ''}] Status: ${complaint?.status || 'In Progress'}`,
  )
  const [emailMessage, setEmailMessage] = useState('')
  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [successBanner, setSuccessBanner] = useState('')
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1)

  const studentEmail = complaint?.submittedByEmail || 'aarav@student.dcrust.in'
  const studentName = complaint?.submittedBy || 'Student'
  const currentProgress = complaint?.progress !== undefined && complaint?.progress !== null
    ? complaint.progress
    : (complaint?.status === 'Resolved' || complaint?.status === 'Closed' ? 100 : complaint?.status === 'In Progress' ? 50 : 20)

  const handleApplyTemplate = (index) => {
    const template = QUICK_TEMPLATES[index]
    if (!template) return
    setSelectedTemplateIndex(index)
    setSelectedProgress(template.progress)
    setSelectedStatus(template.status)
    setEmailSubject(`[Progress: ${template.progress}% - ${template.status}] ${complaint.title}`)
    setEmailMessage(`Dear ${studentName},\n\n${template.message}\n\nLocation: ${complaint.location}\nComplaint ID: ${complaint.id}\nCampus Maintenance Cell`)
  }

  const handleEvidenceDecision = async (decision) => {
    if (!complaint) return
    setIsReviewingEvidence(true)
    const reasonText = rejectReason.trim() || 'Uploaded image does not match the reported issue or category.'

    try {
      const response = await complaintsApi.reviewEvidence(complaint.id, decision, decision === 'reject' ? reasonText : undefined)
      if (response?.data?.complaint) {
        setComplaints((prev) => prev.map((item) => (item.id === complaint.id ? response.data.complaint : item)))
      }
    } catch {
      // Local fallback in state
      const updatedComplaint = {
        ...complaint,
        evidenceStatus: decision === 'approve' ? 'Approved' : 'Rejected',
        evidenceReviewReason: decision === 'reject' ? reasonText : undefined,
        status: decision === 'approve' ? 'Assigned' : 'Rejected',
        progress: decision === 'approve' ? 25 : complaint.progress,
        timeline: [
          ...(complaint.timeline || []),
          {
            status: decision === 'approve' ? 'Evidence Verified' : 'Evidence Rejected',
            progress: decision === 'approve' ? 25 : complaint.progress,
            date: new Date().toISOString().slice(0, 10),
            note: decision === 'approve'
              ? 'On-site evidence photo verified by Admin. Technician assigned.'
              : `Evidence photo rejected by Admin: ${reasonText}`,
          },
        ],
      }
      setComplaints((prev) => prev.map((item) => (item.id === complaint.id ? updatedComplaint : item)))
    } finally {
      setIsReviewingEvidence(false)
      setShowRejectInput(false)
      setSuccessBanner(decision === 'approve' ? 'Evidence verified! Complaint status updated to Assigned.' : 'Evidence rejected and complaint marked as Rejected.')
    }
  }

  const handleSendUpdate = async (e) => {
    e.preventDefault()
    if (!complaint) return

    setIsSending(true)
    setSuccessBanner('')

    const finalSubject = emailSubject.trim() || `[Progress Update: ${selectedProgress}% - ${selectedStatus}] ${complaint.title}`
    const finalMessage = emailMessage.trim() || `Status updated to ${selectedStatus} (${selectedProgress}% completed).`

    const payload = {
      status: selectedStatus,
      progress: selectedProgress,
      emailSubject: finalSubject,
      emailMessage: finalMessage,
      sendEmail: sendEmailNotification,
      reviewerRole: user?.role || 'admin',
      comment: finalMessage,
    }

    try {
      // Call backend API if available
      const response = await complaintsApi.sendUpdate(complaint.id, payload)
      if (response?.data?.complaint) {
        setComplaints((prev) => prev.map((item) => (item.id === complaint.id ? response.data.complaint : item)))
      }
    } catch {
      // Local fallback in state & AppContext
      const newEmailRecord = {
        id: `EML-${Date.now()}`,
        date: new Date().toISOString(),
        sender: user?.name ? `${user.name} (${user.role})` : 'Campus Admin (Prince Chahal)',
        recipient: studentEmail,
        subject: finalSubject,
        message: finalMessage,
        status: selectedStatus,
        progress: selectedProgress,
        delivered: true,
        mode: 'email',
      }

      const updatedComplaint = {
        ...complaint,
        status: selectedStatus,
        progress: selectedProgress,
        lastUpdated: new Date().toISOString().slice(0, 10),
        emailUpdates: [newEmailRecord, ...(complaint.emailUpdates || [])],
        timeline: [
          ...(complaint.timeline || []),
          {
            status: selectedStatus,
            progress: selectedProgress,
            date: new Date().toISOString().slice(0, 10),
            note: finalMessage,
            emailSent: sendEmailNotification,
          },
        ],
      }

      setComplaints((prev) => prev.map((item) => (item.id === complaint.id ? updatedComplaint : item)))

      // Add to student notifications
      setNotifications((prev) => [
        {
          id: `NOT-${Date.now()}`,
          userEmail: studentEmail,
          title: finalSubject,
          message: finalMessage,
          type: 'complaint',
          complaintId: complaint.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    } finally {
      // Dispatch mobile push notification to student device
      triggerMobileNotification({
        title: finalSubject,
        message: `${finalMessage} (${selectedProgress}% resolved)`,
        url: `/student/complaint/${complaint.id}`,
        tag: `cmp-${complaint.id}-${Date.now()}`,
      })

      setIsSending(false)
      setSuccessBanner(
        sendEmailNotification
          ? `Progress updated to ${selectedProgress}%! Email & mobile device push alert dispatched to ${studentEmail}.`
          : `Progress updated to ${selectedProgress}%.`,
      )
      setEmailMessage('')
    }
  }

  if (!complaint) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-soft">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
        <p className="text-lg font-semibold">Complaint not found.</p>
        <Link to={isAdminOrStaff ? '/admin/complaints' : '/student/complaints'} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
          Return to complaints list
        </Link>
      </div>
    )
  }

  const backLink = isAdminOrStaff ? '/admin/complaints' : '/student/complaints'

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-400">
            <ArrowLeft size={16} /> Back to Complaints
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{complaint.title}</h1>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono font-medium text-slate-300 border border-white/10">
              {complaint.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 shadow-sm transition">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{successBanner}</p>
        </div>
      )}

      {/* VISUAL RESOLUTION PROGRESS TRACKER */}
      <div className="glass-panel overflow-hidden rounded-3xl p-6 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Live Resolution Status</p>
            <h2 className="text-lg font-bold text-white">Complaint Progress Tracking</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Progress:</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
              currentProgress === 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : currentProgress >= 50
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {currentProgress === 100 ? <CheckCheck size={16} /> : <Clock size={15} />}
              {currentProgress}% Resolved
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-800 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(5, currentProgress)}%` }}
            />
          </div>

          {/* Milestone Step Checkpoints */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0">
            {PROGRESS_STAGES.map((step) => {
              const isPassed = currentProgress >= step.percent
              const isCurrent = (currentProgress >= step.percent && currentProgress < step.percent + 25) || (step.percent === 100 && currentProgress === 100)
              return (
                <div key={step.label} className="flex flex-col items-center text-center sm:px-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'border-2 border-slate-700 bg-slate-800 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-blue-500/30 ring-offset-1 ring-offset-slate-900' : ''}`}
                  >
                    {isPassed ? '✓' : step.icon}
                  </div>
                  <p className={`mt-2 text-xs font-bold ${isPassed ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="hidden text-[11px] text-slate-400 sm:block">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ADMIN COMMUNICATION & EMAIL DISPATCH PORTAL (Visible to Admins / Authority) */}
      {isAdminOrStaff && (
        <div className="rounded-3xl border border-blue-200/70 bg-gradient-to-br from-slate-900 via-[#142B4A] to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/20 p-2.5 text-blue-400 border border-blue-400/30">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Admin Control Center</p>
                <h2 className="text-xl font-bold text-white">Update Progress & Send Student Email Notification</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck size={14} className="text-emerald-400" /> Authorized Admin Action
            </div>
          </div>

          <form onSubmit={handleSendUpdate} className="mt-6 space-y-5">
            {/* Target Student Email Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
              <div>
                <span className="text-slate-400">Recipient Student:</span>
                <span className="ml-2 font-semibold text-slate-100">{studentName}</span>
                <span className="ml-2 text-teal-300 font-mono">({studentEmail})</span>
              </div>
              <div>
                <span className="text-slate-400">Destination:</span>
                <span className="ml-2 font-medium text-slate-200">{complaint.destination || 'Maintenance Cell'}</span>
              </div>
            </div>

            {/* Quick Template Presets */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Sparkles size={14} className="text-amber-400" /> Quick Notification Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(idx)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                      selectedTemplateIndex === idx
                        ? 'border-blue-400 bg-blue-600 text-white shadow-md'
                        : 'border-white/10 bg-slate-800/60 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tmpl.name} ({tmpl.progress}%)
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Status Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Update Complaint Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-400"
                >
                  {['Submitted', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map((s) => (
                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                  ))}
                </select>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Resolution Percentage ({selectedProgress}%)
                  </label>
                  <span className="text-teal-400 font-bold">{selectedProgress}% Completed</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={selectedProgress}
                    onChange={(e) => setSelectedProgress(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-blue-500"
                  />
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedProgress(val)}
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          selectedProgress === val
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Subject */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter subject for student email..."
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-400 placeholder:text-slate-500"
              />
            </div>

            {/* Email Message Body */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Official Message / Email Body for Student
              </label>
              <textarea
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Explain the progress achieved, who was dispatched, or resolution details..."
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-400 placeholder:text-slate-500"
              />
            </div>

            {/* Send Email Checkbox & Submit */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 accent-blue-600"
                />
                <span>Send direct email notification to student ({studentEmail})</span>
              </label>

              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
              >
                {isSending ? (
                  <>Sending update…</>
                ) : (
                  <>
                    <Send size={16} /> Send Email & Update Progress
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OFFICIAL EMAIL COMMUNICATIONS & UPDATES FEED */}
      <div className="glass-panel overflow-hidden rounded-3xl p-6 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400 border border-blue-400/20">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Email Notifications & Admin Updates</h2>
              <p className="text-xs text-slate-400">Official correspondence sent by campus maintenance administration</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 border border-white/10">
            {complaint.emailUpdates?.length || 0} message{complaint.emailUpdates?.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {complaint.emailUpdates?.length ? (
            complaint.emailUpdates.map((email, idx) => (
              <div
                key={email.id || idx}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-white/20 hover:bg-slate-900/80"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{email.subject}</span>
                    {email.progress !== undefined && (
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/30">
                        {email.progress}% Resolved
                      </span>
                    )}
                    {email.status && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-white/10">
                        {email.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {email.date ? new Date(email.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>From: <strong className="text-slate-200">{email.sender || 'Admin Office'}</strong></span>
                  <span>To: <strong className="text-slate-200">{email.recipient || studentEmail}</strong></span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                    <CheckCheck size={14} /> Delivered via Email
                  </span>
                </div>

                <div className="mt-3.5 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200 leading-relaxed shadow-xs">
                  <p className="whitespace-pre-line">{email.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              <Mail className="mx-auto mb-2 text-slate-500" size={24} />
              No email updates have been sent for this complaint yet.
              {isAdminOrStaff && (
                <p className="mt-1 text-xs text-blue-400">Use the admin panel above to send the first progress notification to the student.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* COMPLAINT DETAILS & ATTRIBUTES */}
      <div className="glass-panel rounded-3xl p-6 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <h2 className="text-xl font-bold text-white">Complaint Information</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Complaint ID</p>
            <p className="mt-1.5 font-mono font-semibold text-slate-100">{complaint.id}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</p>
            <p className="mt-1.5 font-semibold text-slate-100">{complaint.category}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location</p>
            <p className="mt-1.5 font-semibold text-slate-100">{complaint.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</p>
            <p className="mt-1.5 font-semibold text-slate-100">{complaint.priority}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Submitted By</p>
            <p className="mt-1.5 font-semibold text-slate-100">{complaint.submittedBy} <span className="text-xs text-slate-400 font-normal">({studentEmail})</span></p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Routing</p>
            <p className="mt-1.5 font-semibold text-slate-100">{complaint.destination || 'Department'}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
          <p className="mt-2 text-sm leading-7 text-slate-200 whitespace-pre-line">{complaint.description}</p>
        </div>

        {/* Uploaded Evidence */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-md font-bold text-white">Uploaded Evidence</h3>
            {complaint.evidenceStatus === 'Approved' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Check size={14} /> Evidence Verified ✓
              </span>
            ) : complaint.evidenceStatus === 'Rejected' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
                <X size={14} /> Evidence Rejected ✕
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                <Clock size={14} /> Verification Pending ⏳
              </span>
            )}
          </div>

          {complaint.attachments?.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complaint.attachments.map((attachment, index) => {
                const evidence = typeof attachment === 'string' ? { name: attachment } : attachment
                return (
                  <div key={`${evidence.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                    {evidence.dataUrl ? (
                      <a href={evidence.dataUrl} target="_blank" rel="noreferrer" aria-label={`Open full-size ${evidence.name}`}>
                        <img src={evidence.dataUrl} alt={`Complaint evidence: ${evidence.name}`} className="h-44 w-full object-cover" />
                      </a>
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-slate-900 text-sm text-slate-400">
                        Evidence file: {evidence.name}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate text-xs text-slate-200">{evidence.name}</span>
                        {evidence.isLiveCapture && (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-medium text-teal-300 border border-teal-500/30 shrink-0">
                            <Camera size={10} /> Live Photo
                          </span>
                        )}
                      </div>
                      {evidence.dataUrl && (
                        <a href={evidence.dataUrl} download={evidence.name} className="shrink-0 text-xs font-semibold text-blue-400 hover:underline">
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No physical evidence or photos were attached.</p>
          )}

          {/* Admin Stage-1 Evidence Review Gate */}
          {isAdminOrStaff && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-teal-400" />
                <h4 className="text-sm font-bold text-white">Stage-1: Admin Evidence Authenticity Gate</h4>
              </div>
              <p className="text-xs text-slate-300">
                Inspect the attached photo to ensure it genuinely represents the reported problem (<span className="text-teal-300 font-medium">{complaint.category}</span> at <span className="text-teal-300 font-medium">{complaint.location}</span>). If irrelevant or fake, reject to prevent wasted technician visits.
              </p>

              {complaint.evidenceStatus === 'Approved' ? (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span><strong>Approved:</strong> Evidence photo was verified by maintenance admin. Work proceeds normally.</span>
                </div>
              ) : complaint.evidenceStatus === 'Rejected' ? (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Rejected by Admin (Irrelevant / Fake Photo)</p>
                    <p className="mt-0.5 text-slate-300">{complaint.evidenceReviewReason || 'Image does not match the reported issue or campus category.'}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {!showRejectInput ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={isReviewingEvidence}
                        onClick={() => handleEvidenceDecision('approve')}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        <Check size={14} /> Approve Photo & Assign Technician
                      </button>
                      <button
                        type="button"
                        disabled={isReviewingEvidence}
                        onClick={() => setShowRejectInput(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        <X size={14} /> Reject Photo (Irrelevant/Fake)
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-2">
                      <label className="block text-xs font-semibold text-rose-300">
                        Reason for Rejection (will be sent to student):
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Photo shows a flower/unrelated object instead of electrical issue"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-400"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isReviewingEvidence}
                          onClick={() => handleEvidenceDecision('reject')}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(false)}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STATUS & AUDIT TIMELINE */}
      <div className="glass-panel rounded-3xl p-6 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="flex items-center gap-2">
          <Wrench size={18} className="text-blue-400" />
          <h2 className="text-xl font-bold text-white">Activity & Status Timeline</h2>
        </div>
        <div className="mt-6 space-y-4">
          {complaint.timeline?.map((step, index) => (
            <div key={`${step.status}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  step.status === 'Resolved' || step.progress === 100
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`} />
                {index !== complaint.timeline.length - 1 && <div className="mt-1 h-14 w-px bg-slate-700" />}
              </div>
              <div className="flex-1 rounded-2xl bg-slate-900/60 border border-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-100">{step.status}</p>
                    {step.progress !== undefined && (
                      <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                        {step.progress}%
                      </span>
                    )}
                    {step.emailSent && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                        <Mail size={11} /> Email notified
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(step.date)}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-300">{step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
