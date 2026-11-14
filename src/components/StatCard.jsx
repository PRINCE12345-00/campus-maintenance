import { motion } from 'framer-motion'

export default function StatCard({ title, value, detail, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-gradient-to-br from-blue-500/20 to-sky-500/10 text-blue-200 ring-1 ring-blue-400/20',
    emerald: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 text-emerald-200 ring-1 ring-emerald-400/20',
    amber: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-200 ring-1 ring-amber-400/20',
    rose: 'bg-gradient-to-br from-rose-500/20 to-pink-500/10 text-rose-200 ring-1 ring-rose-400/20',
    slate: 'bg-gradient-to-br from-slate-500/20 to-slate-400/5 text-slate-200 ring-1 ring-white/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      className="glass-panel rounded-3xl p-5 shadow-[0_18px_40px_rgba(2,6,23,0.4)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
          {Icon ? <Icon size={20} /> : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </motion.div>
  )
}
