import { useMemo, useState } from 'react'
import { Check, ClipboardCheck, FileText, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { complaintsApi, permissionsApi } from '../../services/api'
import { getPermissionChain } from '../../utils/approvalWorkflow'

const normalizeDepartment = (value = '') => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const departmentMatches = (record, department) => {
  const target = normalizeDepartment(`${record.department || ''} ${record.destination || ''} ${record.submittedByDepartment || ''} ${record.currentStage || ''}`)
  const departmentName = normalizeDepartment(department)

  if (!departmentName || departmentName === 'administrative office') return true
  return target.includes(departmentName) || target.includes('department') || target.includes('department head')
}

export default function DepartmentHeadDashboard() {
  const { complaints, setComplaints, permissions, setPermissions, user } = useAppContext()
  const [message, setMessage] = useState('')
  const [comments, setComments] = useState({})
  const department = user?.department || 'Computer Science & Engineering'

  const departmentComplaints = useMemo(() => complaints.filter((item) => {
    const routedToDepartment = !item.destination || item.destination.toLowerCase().includes('department')
    return routedToDepartment && departmentMatches(item, department)
  }), [complaints, department])
  const departmentPermissions = useMemo(() => permissions.filter((item) => {
    const isPendingDepartmentStage = item.currentStage === 'Department Head' || item.status === 'Pending Approval' || item.status === 'Under Review' || item.status === 'Changes Requested'
    return isPendingDepartmentStage && departmentMatches(item, department)
  }), [permissions, department])

  const updateComplaint = async (id, status) => {
    try {
      const { data } = await complaintsApi.updateStatus(id, status, 'department_head')
      setComplaints((items) => items.map((item) => item.id === id ? data : item))
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Could not update complaint. Make sure the backend is running.')
    }
  }

  const decidePermission = async (id, decision) => {
    const comment = comments[id] || ''
    if (decision !== 'approve' && !comment.trim()) {
      setMessage('Add a reviewer comment before returning or rejecting a request.')
      return
    }
    try {
      const { data } = await permissionsApi.review(id, decision, 'department_head', comment)
      setPermissions((items) => items.map((item) => item.id === id ? data : item))
      setMessage(decision === 'approve' ? 'Department approval recorded. The request is now with the next reviewer.' : decision === 'return' ? `Request returned to ${data.currentStage || 'the student'} with your feedback.` : 'Permission request rejected at department review.')
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Could not record this decision. Make sure the backend is running.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Department Head workspace</p>
        <h1 className="mt-2 text-3xl font-bold">{department}</h1>
        <p className="mt-2 text-slate-300">Review departmental complaints and approve student requests before they move to the next office.</p>
      </header>

      {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</p>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3"><FileText className="text-blue-600" /><div><h2 className="text-xl font-bold text-slate-900">Department permission review</h2><p className="text-sm text-slate-500">Pending requests can be approved; returned requests appear here again after student changes.</p></div></div>
        <div className="space-y-4">
          {departmentPermissions.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No permission requests are waiting for your department.</p>}
          {departmentPermissions.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900">{item.title}</h3><StatusBadge status={item.status} /></div><p className="mt-2 text-sm text-slate-600">{item.type} · {item.location} · {item.date}</p><p className="mt-1 text-sm text-slate-500">Submitted by {item.submittedBy}: {item.purpose}</p></div>
                <Link to={`/department-head/permission/${item.id}`} className="text-sm font-semibold text-blue-600">View tracking</Link>
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700">Reviewer suggestion or reason<textarea value={comments[item.id] || ''} onChange={(event) => setComments((previous) => ({ ...previous, [item.id]: event.target.value }))} rows={2} placeholder="Add required documents, corrections, or review notes" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400" /></label>
              <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decidePermission(item.id, 'approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"><Check size={16} /> Approve for next stage</button><button onClick={() => decidePermission(item.id, 'return')} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Return with suggestions</button><button onClick={() => decidePermission(item.id, 'reject')} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"><X size={16} /> Reject</button></div>
              <div className="mt-3 flex flex-wrap gap-2">{getPermissionChain(item).map((stage) => <span key={stage.stage} className={`rounded-full px-2.5 py-1 text-xs ${stage.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : stage.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>{stage.stage}: {stage.status}</span>)}</div>
              {item.approvalChain?.some((stage) => stage.status === 'Returned') && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Previous reviewer feedback: {item.approvalChain.find((stage) => stage.status === 'Returned')?.comment}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3"><ClipboardCheck className="text-blue-600" /><div><h2 className="text-xl font-bold text-slate-900">Department complaints</h2><p className="text-sm text-slate-500">Update operational status as the issue is handled.</p></div></div>
        <div className="space-y-3">
          {departmentComplaints.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No complaints are routed to this department.</p>}
          {departmentComplaints.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.id} · {item.location} · {item.submittedBy}</p><p className="mt-1 text-xs text-blue-700">Routed to {item.destination || `${department} Department`}</p></div><div className="flex items-center gap-3"><StatusBadge status={item.status} /><select aria-label={`Update status for ${item.title}`} value={item.status} onChange={(event) => updateComplaint(item.id, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none ring-0"><option className="text-slate-700">Submitted</option><option className="text-slate-700">Assigned</option><option className="text-slate-700">In Progress</option><option className="text-slate-700">Resolved</option><option className="text-slate-700">Closed</option></select><Link to={`/department-head/complaint/${item.id}`} className="text-sm font-semibold text-blue-600">Details</Link></div></article>)}
        </div>
      </section>
    </div>
  )
}
