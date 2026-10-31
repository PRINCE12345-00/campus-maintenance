import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { mockAnalytics } from '../../data/mockData'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Data science preview</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Analytics & demo ML predictions</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Complaint category distribution</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockAnalytics.categoryDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {mockAnalytics.categoryDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Affected locations</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.locations}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Monthly complaint trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalytics.monthlyTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="complaints" radius={[8, 8, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Pending vs resolved</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">28 / 62</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Avg. resolution time</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{mockAnalytics.averageResolutionTime} days</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Mock predicted category</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{mockAnalytics.predictedCategory}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Mock priority</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{mockAnalytics.predictedPriority}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Mock ML insights</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><span className="font-semibold text-slate-800">Predicted resolution time:</span> {mockAnalytics.predictedResolutionTime}</li>
            <li><span className="font-semibold text-slate-800">Recurring maintenance issues:</span> {mockAnalytics.recurringIssues.join(', ')}</li>
            <li><span className="font-semibold text-slate-800">Campus hotspots:</span> {mockAnalytics.hotspots.join(', ')}</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Demo warning</h2>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This analytics panel contains demo or mock machine learning predictions for frontend demonstration only. No actual ML model is trained or deployed in this project.
          </div>
        </div>
      </div>
    </div>
  )
}
