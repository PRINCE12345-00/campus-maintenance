<<<<<<< HEAD
import { useEffect, useState } from 'react'
=======
import { motion } from 'framer-motion'
>>>>>>> bca09af (UPDATED)
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { analyticsApi } from '../../services/api'

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
const tooltipStyle = { background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)', borderRadius: '12px', color: '#e2e8f0' }

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    analyticsApi.get()
      .then(({ data }) => { if (active) setAnalytics(data) })
      .catch(() => { if (active) setError('Could not load live analytics. Check that the Node.js backend is running on port 5000.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading live complaint analytics...</div>
  if (error) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">{error}</div>

  const categoryData = analytics.categoryDistribution || []
  const locationData = analytics.locations || []
  const trendData = analytics.monthlyTrend || []
  const priorityData = analytics.priorityDistribution || []
  const statusData = analytics.statusSummary || []

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
<<<<<<< HEAD
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Data science & analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Live Campus Maintenance Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">Charts are calculated from complaint records returned by the backend, not hard-coded demo chart values.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Total complaints', analytics.totalComplaints], ['Open complaints', analytics.openComplaints], ['Resolved / closed', analytics.resolvedComplaints], ['Avg. resolution time', analytics.averageResolutionTime == null ? 'N/A' : `${analytics.averageResolutionTime} days`]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Complaint category distribution">
          {categoryData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Complaints by location">
          {locationData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={locationData}><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#2563eb" /></BarChart></ResponsiveContainer> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Monthly complaint trend">
          {trendData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#10b981" /></BarChart></ResponsiveContainer> : <EmptyChart />}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Priority distribution</h2>
          <div className="mt-4 space-y-3">{priorityData.length ? priorityData.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-700">{item.name}</span><span className="font-bold text-slate-900">{item.value}</span></div>) : <EmptyChart />}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Status summary & recurring categories</h2>
          <div className="mt-4 space-y-3">{statusData.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-700">{item.name}</span><span className="font-bold text-slate-900">{item.value}</span></div>)}</div>
          <p className="mt-5 text-sm font-semibold text-slate-800">Categories with repeated complaints</p>
          <p className="mt-2 text-sm text-slate-600">{analytics.recurringIssues?.length ? analytics.recurringIssues.join(', ') : 'Not enough repeated category records yet.'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Data limitation</p><p className="mt-1">{analytics.note}</p>
        <p className="mt-2">This page currently provides descriptive analytics. Predictive ML will be enabled after a labelled complaint dataset is collected and the Python model is trained.</p>
      </div>
    </div>
=======
        <p className="page-eyebrow">Data science preview</p>
        <h1 className="page-heading">Analytics &amp; Demo ML</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-bold text-white">Category distribution</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockAnalytics.categoryDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {mockAnalytics.categoryDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockAnalytics.categoryDistribution.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-bold text-white">Affected locations</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.locations}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-bold text-white">Monthly trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.monthlyTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pending vs resolved', value: '28 / 62' },
          { label: 'Avg. resolution time', value: `${mockAnalytics.averageResolutionTime} days` },
          { label: 'Predicted category', value: mockAnalytics.predictedCategory },
          { label: 'Predicted priority', value: mockAnalytics.predictedPriority },
        ].map(({ label, value }) => (
          <div key={label} className="glass-panel rounded-2xl p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-bold text-white">Mock ML insights</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><span className="font-semibold text-slate-100">Predicted resolution time:</span> {mockAnalytics.predictedResolutionTime}</li>
            <li><span className="font-semibold text-slate-100">Recurring issues:</span> {mockAnalytics.recurringIssues.join(', ')}</li>
            <li><span className="font-semibold text-slate-100">Hotspots:</span> {mockAnalytics.hotspots.join(', ')}</li>
          </ul>
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-200">⚠ Demo data only</p>
            <p className="mt-1 text-sm text-amber-300/80">These ML predictions are simulated. Connect a real prediction service to activate live insights.</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-bold text-white">Status summary</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockAnalytics.statusSummary} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                  <Cell fill="#f87171" />
                  <Cell fill="#34d399" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-6">
            {mockAnalytics.statusSummary.map((s, i) => (
              <span key={s.name} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: i === 0 ? '#f87171' : '#34d399' }} />
                {s.name}: <strong className="text-white">{s.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
>>>>>>> bca09af (UPDATED)
  )
}

function ChartCard({ title, children }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"><h2 className="text-lg font-bold text-slate-900">{title}</h2><div className="mt-4 h-64">{children}</div></div>
}

function EmptyChart() { return <div className="flex h-full items-center justify-center text-sm text-slate-400">No complaint records available yet.</div> }
