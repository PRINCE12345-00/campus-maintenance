import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const { complaints } = useAppContext()

  const complaint = useMemo(() => complaints.find((item) => item.id === id), [complaints, id])

  if (!complaint) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-soft">Complaint not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Complaint details</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{complaint.title}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Complaint ID</p>
            <p className="mt-2 font-semibold text-slate-800">{complaint.id}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Category</p>
            <p className="mt-2 font-semibold text-slate-800">{complaint.category}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-2 font-semibold text-slate-800">{complaint.location}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Priority</p>
            <p className="mt-2 font-semibold text-slate-800">{complaint.priority}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Description</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{complaint.description}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Uploaded evidence</h2>
          {complaint.attachments?.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complaint.attachments.map((attachment, index) => {
                const evidence = typeof attachment === 'string' ? { name: attachment } : attachment
                return (
                  <div key={`${evidence.name}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {evidence.dataUrl ? (
                      <a href={evidence.dataUrl} target="_blank" rel="noreferrer" aria-label={`Open full-size ${evidence.name}`}>
                        <img src={evidence.dataUrl} alt={`Complaint evidence: ${evidence.name}`} className="h-48 w-full object-cover" />
                      </a>
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-slate-100 text-sm text-slate-500">Preview unavailable</div>
                    )}
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="truncate text-sm text-slate-700">{evidence.name}</span>
                      {evidence.dataUrl && <a href={evidence.dataUrl} download={evidence.name} className="shrink-0 text-sm font-semibold text-blue-600">Open / save</a>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No evidence was attached to this complaint.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold text-slate-900">Status timeline</h2>
        <div className="mt-6 space-y-4">
          {complaint.timeline?.map((step, index) => (
            <div key={`${step.status}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600" />
                {index !== complaint.timeline.length - 1 && <div className="mt-1 h-16 w-px bg-slate-200" />}
              </div>
              <div className="flex-1 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800">{step.status}</p>
                  <span className="text-xs text-slate-500">{step.date}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
