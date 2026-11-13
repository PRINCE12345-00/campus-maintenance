import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { permissionsApi } from '../../services/api'
import { getPermissionChain } from '../../utils/approvalWorkflow'

export default function AdminPermissionsPage() {
  const { permissions, setPermissions } = useAppContext()
  const [comments, setComments] = useState({})
  const downstreamPermissions = permissions.filter((item) => item.currentStage === 'DSW')

  const updatePermission = async (id, decision) => {
    const comment = comments[id] || ''
    if (decision !== 'approve' && !comment.trim()) {
      window.alert('Add a reviewer comment before returning or rejecting a request.')
      return
    }
    try {
      const { data } = await permissionsApi.review(id, decision, 'dsw', comment)
      setPermissions((prev) => prev.map((permission) => permission.id === id ? data : permission))
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Could not update this approval. Check that the backend is running.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Permission review</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Educational & Cultural approvals</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="space-y-4">
          {downstreamPermissions.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">Requests appear here after the Department Head approves them.</p>}
          {downstreamPermissions.map((permission) => (
            <div key={permission.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-slate-900">{permission.title}</p>
                    <StatusBadge status={permission.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{permission.type} • {permission.location}</p>
                  <p className="mt-1 text-sm text-slate-500">Purpose: {permission.purpose}</p>
                  <p className="mt-1 text-sm text-slate-500">Submitted by: {permission.submittedBy}</p>
                  {permission.approvalChain?.filter((stage) => stage.status === 'Returned').map((stage) => <p key={stage.stage} className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Previous feedback from {stage.stage}: {stage.comment}</p>)}
                  <p className="mt-2 text-sm font-semibold text-blue-700">Current reviewer: {permission.currentStage || 'Workflow complete'}</p>
                  <Link to={`/admin/permission/${permission.id}`} className="mt-2 inline-flex text-sm font-semibold text-blue-600">View full tracking</Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getPermissionChain(permission).map((stage, index) => (
                      <span key={stage.stage} className={`rounded-full px-2.5 py-1 text-xs ${stage.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : stage.status === 'Pending' ? 'bg-blue-100 text-blue-800' : stage.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-600'}`}>
                        {index + 1}. {stage.stage} · {stage.status}
                      </span>
                    ))}
                  </div>
                </div>

                {permission.status !== 'Approved' && permission.status !== 'Rejected' && (
                  <div className="min-w-56 space-y-2">
                    <textarea value={comments[permission.id] || ''} onChange={(event) => setComments((previous) => ({ ...previous, [permission.id]: event.target.value }))} rows={2} placeholder="Review suggestions or reason" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                    <div className="flex flex-wrap gap-2">
                    <button onClick={() => updatePermission(permission.id, 'approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                      <Check size={16} /> Approve at this stage
                    </button>
                    <button onClick={() => updatePermission(permission.id, 'return')} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Return with suggestions</button>
                    <button onClick={() => updatePermission(permission.id, 'reject')} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                      <X size={16} /> Reject
                    </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
