import { useMemo, useState } from 'react'
import { Check, FileCheck2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAppContext } from '../../context/AppContext'
import { permissionsApi } from '../../services/api'
import { getPermissionChain } from '../../utils/approvalWorkflow'

const roleConfig = {
  cultural_coordinator: { title: 'Cultural Coordinator', stage: 'Cultural Coordinator', path: 'cultural-coordinator', description: 'Review cultural activities after Department Head approval.' },
  technical_coordinator: { title: 'Technical Coordinator', stage: 'Technical Coordinator', path: 'technical-coordinator', description: 'Review technical and educational activities after Department Head approval.' },
  dsw: { title: 'Dean of Student Welfare', stage: 'DSW', path: 'dsw', description: 'Review requests advanced by the appropriate coordinator.' },
  registrar: { title: 'Registrar', stage: 'Registrar', path: 'registrar', description: 'Review requests advanced through their coordinator and DSW.' },
  vice_chancellor: { title: 'Vice Chancellor', stage: 'Vice Chancellor', path: 'vice-chancellor', description: 'Provide the final decision on requests that passed all previous authorities.' },
}

export default function AuthorityDashboard({ role }) {
  const config = roleConfig[role]
  const { permissions, setPermissions, user } = useAppContext()
  const [comments, setComments] = useState({})
  const [message, setMessage] = useState('')
  const pending = useMemo(() => permissions.filter((item) => item.currentStage === config.stage && (role === 'cultural_coordinator' ? item.type === 'Cultural' : role === 'technical_coordinator' ? item.type !== 'Cultural' : true)), [permissions, config.stage, role])
  const returnTarget = (item) => {
    const chain = getPermissionChain(item)
    const index = chain.findIndex((stage) => stage.stage === config.stage)
    return index > 0 ? chain[index - 1].stage : 'the student'
  }

  const decide = async (id, decision) => {
    const comment = comments[id] || ''
    if (decision !== 'approve' && !comment.trim()) {
      setMessage('Add a comment before returning or rejecting a request.')
      return
    }
    try {
      const { data } = await permissionsApi.review(id, decision, role, comment)
      setPermissions((items) => items.map((item) => item.id === id ? data : item))
      setMessage(decision === 'approve' ? `Approved. The request advanced to ${data.currentStage || 'complete'}.` : decision === 'return' ? `Returned with feedback to ${returnTarget(item)}.` : 'Request rejected with your reason recorded.')
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Could not save your decision. Confirm the backend is running.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Authority workspace</p>
        <h1 className="mt-2 text-3xl font-bold">{config.title}</h1>
        <p className="mt-2 text-slate-300">{config.description}</p>
        <p className="mt-3 text-sm text-slate-400">Signed in as {user?.name || config.title}</p>
      </header>
      {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</p>}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Requests awaiting your review</h2><p className="mt-1 text-sm text-slate-500">Only requests at your approval stage are shown.</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">{pending.length} pending</span></div>
        <div className="space-y-4">
          {pending.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">There are no requests waiting at your stage.</p>}
          {pending.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex items-center gap-2"><FileCheck2 className="text-blue-600" size={18} /><h3 className="font-bold text-slate-900">{item.title}</h3><StatusBadge status={item.status} /></div><p className="mt-2 text-sm text-slate-600">{item.type} · {item.location} · {item.date}</p><p className="mt-1 text-sm text-slate-500">By {item.submittedBy} · {item.department || 'Department not specified'}</p><p className="mt-2 text-sm text-slate-700">{item.purpose}</p></div>
                <Link to={`/${config.path}/permission/${item.id}`} className="text-sm font-semibold text-blue-600">Full request & history</Link>
              </div>
              {item.approvalChain?.filter((stage) => stage.status === 'Returned').map((stage) => <p key={stage.stage} className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Earlier feedback from {stage.stage}: {stage.comment}</p>)}
              <div className="mt-4 flex flex-wrap gap-2">{getPermissionChain(item).map((stage, index) => <span key={stage.stage} className={`rounded-full px-2.5 py-1 text-xs ${stage.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : stage.status === 'Pending' ? 'bg-blue-100 text-blue-800' : stage.status === 'Returned' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'}`}>{index + 1}. {stage.stage}: {stage.status}</span>)}</div>
              <label className="mt-4 block text-sm font-medium text-slate-700">Suggestions / decision notes<textarea value={comments[item.id] || ''} onChange={(event) => setComments((previous) => ({ ...previous, [item.id]: event.target.value }))} rows={2} placeholder="Add recommendations or explain requested changes" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /></label>
              <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decide(item.id, 'approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"><Check size={16} /> Approve & advance</button><button onClick={() => decide(item.id, 'return')} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Return to {returnTarget(item)}</button><button onClick={() => decide(item.id, 'reject')} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"><X size={16} /> Reject</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
