import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'

export default function PermissionReviewPage() {
  const { id } = useParams()
  const { permissions } = useAppContext()
  const permission = permissions.find((item) => item.id === id)

  if (!permission) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-soft">Permission request not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Permission review</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{permission.title}</h1>
          </div>
          <StatusBadge status={permission.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Type</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.type}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Date</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.date}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Faculty</p>
            <p className="mt-2 font-semibold text-slate-800">{permission.faculty}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Purpose</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{permission.purpose}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Approval tracking</h2>
              <p className="mt-1 text-sm text-slate-500">{permission.currentStage ? `Currently awaiting: ${permission.currentStage}` : `Workflow ${permission.status.toLowerCase()}`}</p>
            </div>
            <StatusBadge status={permission.status} />
          </div>
          <div className="mt-5 space-y-3">
            {(permission.approvalChain || []).map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${stage.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : stage.status === 'Pending' ? 'bg-blue-100 text-blue-700' : stage.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{stage.stage}</p>
                  {stage.comment && <p className="text-sm text-slate-500">{stage.comment}</p>}
                </div>
                <span className="text-sm font-medium text-slate-600">{stage.status}</span>
              </div>
            ))}
          </div>
          {permission.approvalHistory?.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-800">History</h3>
              {permission.approvalHistory.map((event, index) => <div key={`${event.stage}-${index}`} className="mt-3 rounded-xl bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-700">{event.stage}: {event.status} · {new Date(event.date).toLocaleString()}</p>{event.note && <p className="mt-1 text-sm text-slate-600">{event.note}</p>}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
