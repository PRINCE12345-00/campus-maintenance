export default function StatCard({ title, value, detail, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          {Icon ? <Icon size={20} /> : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </div>
  )
}
