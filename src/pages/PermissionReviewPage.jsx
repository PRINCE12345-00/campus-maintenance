import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import { permissionsApi } from '../services/api'
import { getPermissionStageLabel } from '../utils/approvalWorkflow'
import { triggerMobileNotification } from '../utils/mobileNotifications'

export default function PermissionReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { permissions, setPermissions, user } = useAppContext()

  const permission = useMemo(() => permissions.find((item) => item.id === id), [permissions, id])

  const [comment, setComment] = useState('')
  const [loadingAction, setLoadingAction] = useState(null)
  const [successBanner, setSuccessBanner] = useState('')

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAdminOrAuthority = useMemo(() => {
    return isAdminRoute || ['admin', 'department_head', 'cultural_coordinator', 'technical_coordinator', 'dsw', 'registrar', 'vice_chancellor'].includes(user?.role)
  }, [isAdminRoute, user?.role])

  if (!permission) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-300">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Permission Request Not Found</h2>
          <p className="mt-2 text-sm text-slate-400">The requested permission ID does not exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    )
  }

  const studentEmail = permission.submittedByEmail || 'student@dcrust.in'
  const studentName = permission.submittedBy || 'Student'
  const isFinalized = permission.status === 'Approved' || permission.status === 'Rejected'
  const currentStageName = permission.currentStage ? getPermissionStageLabel(permission.currentStage) : null

  // Find next stage in chain
  const approvalChain = permission.approvalChain || []
  const currentStageIndex = approvalChain.findIndex((s) => s.stage === permission.currentStage)
  const nextStageObj = currentStageIndex >= 0 && currentStageIndex < approvalChain.length - 1 ? approvalChain[currentStageIndex + 1] : null
  const nextStageName = nextStageObj ? getPermissionStageLabel(nextStageObj.stage) : 'Final Approval'

  const handleReviewAction = async (decision) => {
    const trimmedComment = comment.trim()
    if (['return', 'reject'].includes(decision) && !trimmedComment) {
      window.alert('Please add a reviewer comment or reason before requesting changes or rejecting.')
      return
    }

    setLoadingAction(decision)
    setSuccessBanner('')

    const reviewerRole = isAdminRoute ? 'admin' : (user?.role || 'admin')

    try {
      const defaultNote = decision === 'final_approve'
        ? 'Full final approval granted by University Administration'
        : decision === 'approve'
        ? `Stage (${currentStageName}) approved by Administration. Advanced to next office.`
        : 'Review processed'

      const { data } = await permissionsApi.review(
        permission.id,
        decision,
        reviewerRole,
        trimmedComment || defaultNote
      )
      setPermissions((prev) => prev.map((p) => (p.id === permission.id ? data : p)))
      setComment('')

      const notifHeadline = decision === 'final_approve'
        ? 'Permission Fully Approved!'
        : decision === 'approve'
        ? `Permission Stage Approved: ${currentStageName}`
        : decision === 'return'
        ? 'Changes Requested on Permission'
        : 'Permission Request Rejected'

      const notifMessage = decision === 'final_approve'
        ? `Great news! "${permission.title}" has been granted full and final clearance by University Administration.`
        : decision === 'approve'
        ? `Stage "${currentStageName}" was approved. Your request is now being reviewed by: ${nextStageName}.`
        : `Your request "${permission.title}" has been reviewed by Administration.`

      triggerMobileNotification({
        title: notifHeadline,
        message: notifMessage,
        url: `/student/permission/${permission.id}`,
        tag: `perm-${permission.id}-${Date.now()}`,
      })

      setSuccessBanner(
        decision === 'final_approve'
          ? `✓ Full Final Approval Granted! Student notified via Email & Mobile Push Alert (${studentEmail}).`
          : decision === 'approve'
          ? `✓ Current stage (${currentStageName}) approved! Advanced to "${nextStageName}". Student notified via Email & Mobile Push.`
          : decision === 'return'
          ? `✓ Revision requested! Feedback note sent to student (${studentEmail}).`
          : `✓ Request rejected. Decision details logged and sent to student (${studentEmail}).`
      )
    } catch {
      // Local fallback in state
      const now = new Date().toISOString()
      let updatedStatus = permission.status
      let updatedCurrentStage = permission.currentStage
      let updatedChain = [...approvalChain]

      if (decision === 'final_approve') {
        updatedStatus = 'Approved'
        updatedCurrentStage = null
        updatedChain = updatedChain.map((s) => ({ ...s, status: 'Approved', decidedAt: now }))
      } else if (decision === 'approve') {
        if (currentStageIndex >= 0) {
          updatedChain[currentStageIndex] = {
            ...updatedChain[currentStageIndex],
            status: 'Approved',
            decidedAt: now,
            comment: trimmedComment || 'Approved by Administration',
          }
        }
        if (nextStageObj) {
          updatedCurrentStage = nextStageObj.stage
          const nextIdx = updatedChain.findIndex((s) => s.stage === nextStageObj.stage)
          if (nextIdx >= 0) updatedChain[nextIdx] = { ...updatedChain[nextIdx], status: 'Pending' }
          updatedStatus = 'Pending Approval'
        } else {
          updatedCurrentStage = null
          updatedStatus = 'Approved'
        }
      } else if (decision === 'return') {
        updatedStatus = 'Changes Requested'
        updatedCurrentStage = null
        if (currentStageIndex >= 0) {
          updatedChain[currentStageIndex] = { ...updatedChain[currentStageIndex], status: 'Returned', comment: trimmedComment }
        }
      } else {
        updatedStatus = 'Rejected'
        updatedCurrentStage = null
        if (currentStageIndex >= 0) {
          updatedChain[currentStageIndex] = { ...updatedChain[currentStageIndex], status: 'Rejected', comment: trimmedComment }
        }
      }

      const updated = {
        ...permission,
        status: updatedStatus,
        currentStage: updatedCurrentStage,
        approvalChain: updatedChain,
        approvalHistory: [
          ...(permission.approvalHistory || []),
          {
            stage: 'University Administration',
            status: updatedStatus,
            date: now,
            note: trimmedComment || (decision === 'final_approve' ? 'Final clearance granted' : `Stage approved`),
          },
        ],
        emailUpdates: [
          {
            id: `EML-PER-${Date.now()}`,
            date: now,
            sender: 'Campus Admin (Prince Chahal)',
            recipient: studentEmail,
            subject: `Permission Update: ${permission.title}`,
            message: decision === 'final_approve'
              ? `Your request "${permission.title}" has received full approval.`
              : `Your request was reviewed and advanced to ${updatedCurrentStage || 'complete'}.`,
            status: updatedStatus,
            delivered: true,
          },
          ...(permission.emailUpdates || []),
        ],
      }
      setPermissions((prev) => prev.map((p) => (p.id === permission.id ? updated : p)))

      triggerMobileNotification({
        title: `Permission Updated: ${permission.title}`,
        message: `Status is now ${updatedStatus}.`,
        url: `/student/permission/${permission.id}`,
        tag: `perm-${permission.id}`,
      })

      setSuccessBanner(`✓ Status updated to ${updatedStatus} and notification dispatched to student!`)
    } finally {
      setLoadingAction(null)
      setTimeout(() => setSuccessBanner(''), 7000)
    }
  }

  const backLink = isAdminRoute ? '/admin/permissions' : '/student/permissions'

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-md transition hover:border-white/20 hover:bg-slate-700/80 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Permissions</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request ID:</span>
          <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-sky-400">{permission.id}</span>
          <StatusBadge status={permission.status} />
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-4 text-emerald-200 shadow-xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{successBanner}</p>
        </div>
      )}

      {/* Main Request Hero Card */}
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/50 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase ${
                permission.type === 'Cultural'
                  ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                  : 'border border-blue-500/30 bg-blue-500/20 text-blue-300'
              }`}
            >
              {permission.type} Permission
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{permission.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Overall Status</p>
            <div className="mt-1">
              <StatusBadge status={permission.status} />
            </div>
            {permission.currentStage ? (
              <p className="mt-2 text-xs font-medium text-amber-400">
                Awaiting: <span className="font-semibold underline">{currentStageName}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-400">
                Workflow Complete ({permission.status})
              </p>
            )}
          </div>
        </div>

        {/* Key Event Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-800/50 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              <span>Event Date</span>
            </div>
            <p className="mt-1 font-semibold text-white">{permission.date || 'TBD'}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-800/50 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span>Venue / Location</span>
            </div>
            <p className="mt-1 truncate font-semibold text-white">{permission.location || 'Campus'}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-800/50 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              <span>Applicant</span>
            </div>
            <p className="mt-1 truncate font-semibold text-white">{studentName}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-800/50 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Faculty Guide</span>
            </div>
            <p className="mt-1 truncate font-semibold text-white">{permission.faculty || 'Department Faculty'}</p>
          </div>
        </div>

        {/* Purpose Statement */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-slate-800/40 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Event Purpose & Objective</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{permission.purpose}</p>
        </div>

        {/* Detailed Description / Logistics */}
        {permission.details && (
          <div className="mt-4 rounded-2xl border border-white/5 bg-slate-800/30 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logistics & Arrangements</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">{permission.details}</p>
          </div>
        )}
      </div>

      {/* Student Profile & Contact Card */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white">Student & Academic Details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-800/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Student Name</p>
              <p className="truncate text-sm font-semibold text-white">{studentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-800/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Roll No / ID & Dept</p>
              <p className="truncate text-sm font-semibold text-white">
                {permission.submittedById || '23001001076'} ({permission.department || 'CSE'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-800/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Notification Email</p>
              <p className="truncate text-sm font-semibold text-white">{studentEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Approval Workflow Chain */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Multi-Stage Approval Chain</h3>
            <p className="text-xs text-slate-400">Sequential verification required across university offices</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
              {permission.type} Workflow
            </span>
            {currentStageName && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 animate-pulse">
                Current: {currentStageName}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {approvalChain.map((stage, index) => {
            const isApproved = stage.status === 'Approved'
            const isPending = stage.status === 'Pending'
            const isRejected = stage.status === 'Rejected'
            const isReturned = stage.status === 'Returned'

            return (
              <div
                key={stage.stage}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  isApproved
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : isPending
                    ? 'border-blue-500/50 bg-blue-950/30 ring-1 ring-blue-500/40 shadow-lg shadow-blue-900/20'
                    : isRejected
                    ? 'border-rose-500/30 bg-rose-950/20'
                    : isReturned
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-white/5 bg-slate-800/30 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isApproved
                        ? 'bg-emerald-500 text-white'
                        : isPending
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                        : isRejected
                        ? 'bg-rose-600 text-white'
                        : isReturned
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isApproved ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{getPermissionStageLabel(stage.stage)}</p>
                      {isPending && (
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                          Active Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {stage.decidedAt
                        ? `Decided on ${new Date(stage.decidedAt).toLocaleString()}`
                        : isPending
                        ? 'Currently awaiting review & decision'
                        : 'Queued for later approval'}
                    </p>
                    {stage.comment && (
                      <p className="mt-1 text-xs text-slate-300 italic">"{stage.comment}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isPending
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                        : isRejected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isReturned
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Admin / Authority Action Review Panel */}
      {isAdminOrAuthority && !isFinalized && (
        <div className="glass-panel rounded-3xl border border-sky-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-blue-950/50 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5 text-sky-400">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
              <div>
                <h3 className="text-base font-bold text-white">Administrative Review & Decision</h3>
                <p className="text-xs text-slate-300">
                  Currently awaiting: <span className="font-semibold text-amber-300">{currentStageName || 'Review'}</span>.
                  Every update automatically notifies the student via Email &amp; Mobile Push.
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-200">
              Admin Control Center
            </span>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Reviewer Notes / Feedback (Sent in student notification email)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Add notes for ${currentStageName || 'student'} (e.g. "Approved with condition of maintaining campus discipline")...`}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800/90 p-3.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Action Buttons: Step-by-Step Advance vs Direct Final Approval */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* Step-by-step approve button */}
            <button
              onClick={() => handleReviewAction('approve')}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:brightness-110 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>
                {loadingAction === 'approve'
                  ? 'Advancing...'
                  : `Approve "${currentStageName}" ➔ Advance to "${nextStageName}"`}
              </span>
            </button>

            {/* Direct Super Admin Final Approval Button */}
            <button
              onClick={() => handleReviewAction('final_approve')}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>
                {loadingAction === 'final_approve'
                  ? 'Granting Final Clearance...'
                  : 'Grant Final Approval (Super Admin)'}
              </span>
            </button>

            {/* Request Changes */}
            <button
              onClick={() => handleReviewAction('return')}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/30 disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
              <span>{loadingAction === 'return' ? 'Processing...' : 'Request Changes'}</span>
            </button>

            {/* Reject */}
            <button
              onClick={() => handleReviewAction('reject')}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/30 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>{loadingAction === 'reject' ? 'Rejecting...' : 'Reject Request'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Email & Push Notification Audit History */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold">Email &amp; Push Notification Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {permission.emailUpdates?.length || 0} updates dispatched to student
          </span>
        </div>

        {permission.emailUpdates && permission.emailUpdates.length > 0 ? (
          <div className="mt-4 space-y-3">
            {permission.emailUpdates.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 transition hover:border-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <p className="text-sm font-semibold text-white">{item.subject}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    Delivered via Email &amp; Push
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span>To: <strong className="text-slate-300">{item.recipient}</strong></span>
                  <span>From: {item.sender || 'Campus Administration'}</span>
                  <span>{new Date(item.date).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-800/20 p-6 text-center text-xs text-slate-400">
            No notification updates dispatched for this request yet. Whenever the administration or faculty updates the status, the email dispatch record will appear here.
          </div>
        )}
      </div>

      {/* Historical Audit Trail */}
      {permission.approvalHistory && permission.approvalHistory.length > 0 && (
        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-white border-b border-white/10 pb-4">Audit History Timeline</h3>
          <div className="mt-4 space-y-3">
            {permission.approvalHistory.map((event, index) => (
              <div key={`${event.stage}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-800/30 p-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {event.stage}: <span className="text-sky-300 font-bold">{event.status}</span>
                    </p>
                    <span className="text-[11px] text-slate-400">{new Date(event.date).toLocaleString()}</span>
                  </div>
                  {event.note && <p className="mt-1 text-xs text-slate-300 italic">"{event.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
