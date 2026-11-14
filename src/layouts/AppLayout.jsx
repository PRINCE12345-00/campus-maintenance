import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { complaintsApi, notificationsApi, permissionsApi } from '../services/api'
import { useAppContext } from '../context/AppContext'

export default function AppLayout({ role = 'student' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { setComplaints, setPermissions, setNotifications } = useAppContext()

  useEffect(() => {
    let active = true
    Promise.allSettled([complaintsApi.getAll(), permissionsApi.getAll(), notificationsApi.getAll()]).then((results) => {
      if (!active) return
      const [complaintResult, permissionResult, notificationResult] = results
      if (complaintResult.status === 'fulfilled') setComplaints(complaintResult.value.data)
      if (permissionResult.status === 'fulfilled') setPermissions(permissionResult.value.data)
      if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value.data)
    })
    return () => { active = false }
  }, [role, setComplaints, setPermissions, setNotifications])

  return (
    <div className="dashboard-shell min-h-screen text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-10rem] h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden`} onClick={() => setSidebarOpen(false)} />

        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-out lg:static lg:w-72 lg:translate-x-0`}>
          <Sidebar role={role} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar role={role} showSidebarButton onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="dashboard-page mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
