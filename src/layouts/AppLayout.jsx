import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function AppLayout({ role = 'student' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-30 bg-slate-900/40 lg:hidden`} onClick={() => setSidebarOpen(false)} />

        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200 lg:static lg:w-72 lg:translate-x-0`}>
          <Sidebar role={role} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar role={role} showSidebarButton onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
