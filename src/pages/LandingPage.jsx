import { ArrowRight, Building2, ClipboardList, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: ClipboardList,
    title: 'Complaint Management',
    description: 'Students can report maintenance, cleaning, network, and infrastructure issues through a simple digital workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Permission Management',
    description: 'Apply for educational and cultural events with approval flows built for academic coordination.',
  },
  {
    icon: Sparkles,
    title: 'Smart Analytics',
    description: 'Track recurring campus issues and get mock AI-driven predictions for maintenance planning.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-5 py-3 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">D</div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">DCRUST</p>
              <h1 className="text-sm font-semibold text-slate-900">Smart Campus</h1>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Login</Link>
            <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Register</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <Building2 size={14} />
              Smart Campus Management System
            </div>
            <h2 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Smarter campus operations for a future-ready university.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Designed for Deenbandhu Chhotu Ram University of Science and Technology, Murthal, this platform centralizes complaints, permissions, notifications, and analytics for students and administration.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">
                Student Registration
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="text-2xl font-bold text-slate-900">1400+</div>
                <div className="text-xs text-slate-500">Students served</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="text-2xl font-bold text-slate-900">92%</div>
                <div className="text-xs text-slate-500">Issue resolution</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="text-2xl font-bold text-slate-900">24/7</div>
                <div className="text-xs text-slate-500">Campus visibility</div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="rounded-[24px] bg-slate-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-300">University overview</p>
                  <h3 className="mt-2 text-2xl font-bold">Live Campus Pulse</h3>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">Online</div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Complaints resolved</span>
                    <span className="font-semibold text-emerald-300">78%</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-800 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Permission approvals</span>
                    <span className="font-semibold text-blue-300">89%</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active issues</p>
                  <p className="mt-3 text-3xl font-bold text-white">28</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending reviews</p>
                  <p className="mt-3 text-3xl font-bold text-white">12</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Core features</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">A complete campus operations dashboard</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon size={24} />
                </div>
                <h4 className="text-xl font-semibold text-slate-900">{title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">About the project</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">A modern student-first management experience</h3>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                The Smart Campus Management System improves transparency between students, hostel staff, maintenance teams, and university administration. It streamlines complaint logging, permission handling, and analytics to reduce manual delays and improve campus responsiveness.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Issue tracking</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">5 states</p>
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Access roles</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">2</p>
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Permission types</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">2</p>
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Analytics layer</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">Demo ML</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-slate-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 DCRUST Smart Campus Management System | Designed by Prince Chahal</p>
          <div className="flex gap-6">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="/login">Login</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
