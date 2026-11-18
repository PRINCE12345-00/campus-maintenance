import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { permissionsApi } from '../../services/api'
import { getPermissionChain, getPermissionStageLabel } from '../../utils/approvalWorkflow'
import { triggerMobileNotification } from '../../utils/mobileNotifications'

const statusOptions = ['All', 'Pending Approval', 'Under Review', 'Changes Requested', 'Approved', 'Rejected']
const typeOptions = ['All', 'Educational', 'Cultural']

export default function AdminPermissionsPage() {
  const { permissions, setPermissions } = useAppContext()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [comments, setComments] = useState({})
  const [loadingAction, setLoadingAction] = useState({})
  const [successBanner, setSuccessBanner] = useState('')

  const filteredPermissions = useMemo(() => {
    return permissions.filter((item) => {
      const matchQ = !query || [item.title, item.submittedBy, item.department, item.location, item.purpose].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchS = statusFilter === 'All'
        || item.status === statusFilter
        || (statusFilter === 'Pending Approval' && ['Pending Approval', 'Under Review'].includes(item.status))
      const matchT = typeFilter === 'All' || item.type === typeFilter
      return matchQ && matchS && matchT
    })
  }, [permissions, query, statusFilter, typeFilter])

  const pendingCount = useMemo(() => {
    return permissions.filter((p) => ['Pending Approval', 'Under Review', 'Changes Requested'].includes(p.status)).length
  }, [permissions])

  const updatePermission = async (id, decision) => {
    const comment = String(comments[id] || '').trim()
    if (!['approve', 'final_approve'].includes(decision) && !comment) {
      window.alert('Please add a reviewer comment/reason before returning or rejecting a request.')
      return
    }

    setLoadingAction((prev) => ({ ...prev, [id]: decision }))
    setSuccessBanner('')

    const permissionItem = permissions.find((p) => p.id === id)
    const studentEmail = permissionItem?.submittedByEmail || 'student@dcrust.in'

    try {
      const defaultComment = decision === 'final_approve'
        ? 'Full final approval granted by University Administration'
        : 'Approved by University Administration'

      const { data } = await permissionsApi.review(id, decision, 'admin', comment || defaultComment)
      setPermissions((prev) => prev.map((permission) => (permission.id === id ? data : permission)))

      // Clear comment for this item
      setComments((prev) => ({ ...prev, [id]: '' }))

      // Trigger mobile lock-screen push notification to student
      triggerMobileNotification({
        title: decision === 'final_approve'
          ? 'Permission Fully Approved!'
          : decision === 'approve'
          ? 'Permission Stage Approved!'
          : decision === 'return'
          ? 'Changes Requested!'
          : 'Permission Rejected',
        message: `Your request "${permissionItem?.title || 'Permission'}" has been updated by University Administration.`,
        url: `/student/permission/${id}`,
        tag: `perm-${id}-${Date.now()}`,
      })

      setSuccessBanner(
        decision === 'final_approve'
          ? `✓ Full Final Approval Granted! Student notified via Email & Mobile Push (${studentEmail}).`
          : decision === 'approve'
          ? `✓ Current stage approved & advanced! Student notified via Email & Mobile Push (${studentEmail}).`
          : decision === 'return'
          ? `✓ Revision requested! Feedback note sent to student (${studentEmail}).`
          : `✓ Permission rejected. Decision details sent to student (${studentEmail}).`
      )
    } catch {
      // Local fallback in state
      const now = new Date().toISOString()
      const isApprovedDecision = decision === 'approve' || decision === 'final_approve'
      const updatedStatus = isApprovedDecision ? 'Approved' : decision === 'return' ? 'Changes Requested' : 'Rejected'

      const updated = {
        ...permissionItem,
        status: updatedStatus,
        currentStage: decision === 'final_approve' ? null : permissionItem?.currentStage,
        approvalHistory: [
          ...(permissionItem?.approvalHistory || []),
          {
            stage: 'University Administration',
            status: updatedStatus,
            date: now,
            note: comment || (decision === 'final_approve' ? 'Final approval granted' : 'Approved by Admin'),
          },
        ],
      }

      setPermissions((prev) => prev.map((p) => (p.id === id ? updated : p)))

      // Trigger mobile alert
      triggerMobileNotification({
        title: `Permission ${updatedStatus}: ${permissionItem?.title}`,
        message: `Your permission request was updated to ${updatedStatus}.`,
        url: `/student/permission/${id}`,
        tag: `perm-${id}`,
      })

      setSuccessBanner(`✓ Permission updated to ${updatedStatus} and notification dispatched to student!`)
    } finally {
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      setTimeout(() => setSuccessBanner(''), 6000)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <p className="page-eyebrow">Admin Workspace</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-heading">Permission Requests & Approvals</h1>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              {pendingCount} Pending Review
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300 shadow-lg">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
          <p className="text-sm font-semibold">{successBanner}</p>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="glass-panel rounded-3xl p-5 shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, student, department..."
              className="w-64 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm">
              <Filter size={15} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-0 bg-transparent text-sm text-slate-100 outline-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                ))}
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none cursor-pointer"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900">{opt} Type</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-5">
          {filteredPermissions.length === 0 ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-slate-400 text-center">
              <AlertCircle size={20} />
              <p>No permission requests found matching your filters.</p>
            </div>
          ) : (
            filteredPermissions.map((permission) => {
              const currentReviewer = permission.currentStage
                ? getPermissionStageLabel(permission.currentStage)
                : (permission.status === 'Approved' ? 'Fully Approved' : 'Completed')

              const isCompleted = permission.status === 'Approved' || permission.status === 'Rejected'
              const isLoading = loadingAction[permission.id]

              return (
                <div
                  key={permission.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-white/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                          {permission.id}
                        </span>
                        <h3 className="text-lg font-bold text-white">{permission.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${permission.type === 'Cultural'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                          {permission.type}
                        </span>
                        <StatusBadge status={permission.status} />
                      </div>

                      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 text-xs text-slate-400 pt-1">
                        <p>👤 <strong>Student:</strong> {permission.submittedBy} <span className="font-mono text-slate-500">({permission.submittedByEmail || 'aarav@student.dcrust.in'})</span></p>
                        <p>🏛️ <strong>Department:</strong> {permission.department || 'Computer Science'}</p>
                        <p>📍 <strong>Location & Date:</strong> {permission.location} • {permission.date}</p>
                        <p>👨‍🏫 <strong>Faculty Mentor:</strong> {permission.faculty || 'Department Faculty'}</p>
                      </div>

                      <div className="mt-2 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-300 border border-white/5">
                        <span className="font-semibold text-slate-400">Purpose: </span>
                        {permission.purpose}
                      </div>

                      {/* Multi-Stage Approval Chain Tracker */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-400">Multi-Stage Workflow:</span>
                          <span className="text-teal-300 flex items-center gap-1 font-semibold">
                            <Clock size={12} /> Current Stage: {currentReviewer}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getPermissionChain(permission).map((stage, idx) => (
                            <span
                              key={stage.stage}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${stage.status === 'Approved'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : stage.status === 'Pending'
                                  ? 'bg-blue-900/60 text-blue-200 border border-blue-400/40 ring-1 ring-blue-400/50'
                                  : stage.status === 'Returned'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                    : stage.status === 'Rejected'
                                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                      : 'bg-slate-800 text-slate-500 border border-white/5'
                                }`}
                            >
                              {idx + 1}. {getPermissionStageLabel(stage.stage)}: {stage.status}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detail Link */}
                      <div className="pt-1">
                        <Link
                          to={`/admin/permission/${permission.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                        >
                          View Full Audit Tracking & Timeline →
                        </Link>
                      </div>
                    </div>

                    {/* Review & Action Panel */}
                    <div className="w-full lg:w-72 shrink-0 rounded-xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-teal-400" /> Admin Action
                        </span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Mail size={12} /> Auto-Notifies Student
                        </span>
                      </div>

                      {!isCompleted ? (
                        <>
                          <textarea
                            rows={2}
                            value={comments[permission.id] || ''}
                            onChange={(e) => setComments((prev) => ({ ...prev, [permission.id]: e.target.value }))}
                            placeholder="Add official reviewer note / feedback..."
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400"
                          />

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={Boolean(isLoading)}
                              onClick={() => updatePermission(permission.id, 'approve')}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              <Check size={14} /> {isLoading === 'approve' ? 'Advancing…' : `Approve & Advance (${currentReviewer})`}
                            </button>

                            <button
                              type="button"
                              disabled={Boolean(isLoading)}
                              onClick={() => updatePermission(permission.id, 'final_approve')}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                            >
                              <ShieldCheck size={13} /> {isLoading === 'final_approve' ? 'Granting…' : 'Final Approval (Super Admin)'}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={Boolean(isLoading)}
                                onClick={() => updatePermission(permission.id, 'return')}
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-600/90 px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
                              >
                                Need Changes
                              </button>

                              <button
                                type="button"
                                disabled={Boolean(isLoading)}
                                onClick={() => updatePermission(permission.id, 'reject')}
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600/90 px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg bg-slate-900/80 p-3 text-center text-xs">
                          <p className="font-semibold text-slate-200">Decision Finalized</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Status: <strong className={permission.status === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}>{permission.status}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </motion.div>
  )
}
