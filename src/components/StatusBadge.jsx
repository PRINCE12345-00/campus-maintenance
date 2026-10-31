import { statusColors } from '../utils/formatters'

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[status] || 'bg-slate-200 text-slate-700'}`}>
      {status}
    </span>
  )
}
