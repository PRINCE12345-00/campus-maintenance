import { useState } from 'react'
import { Bell, BellRing, CheckCircle2, Smartphone } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

export default function MobileNotificationBanner() {
  const { mobilePermission, requestMobilePermission, notifyDevice } = useAppContext()
  const [isActivating, setIsActivating] = useState(false)
  const [testSent, setTestSent] = useState(false)

  const handleEnable = async () => {
    setIsActivating(true)
    await requestMobilePermission()
    setIsActivating(false)
  }

  const handleSendTest = async () => {
    setTestSent(true)
    await notifyDevice({
      title: '📱 Test Mobile Notification',
      message: 'Awesome! Your device is successfully linked. You will receive live complaint resolution alerts right here.',
      url: '/student/complaints',
    })
    setTimeout(() => setTestSent(false), 3500)
  }

  if (mobilePermission === 'granted') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 px-4 py-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5 text-teal-300">
          <div className="rounded-full bg-teal-500/20 p-1.5 text-teal-400">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="font-semibold text-slate-100">Mobile Push Notifications Active</p>
            <p className="text-[11px] text-slate-400">Live complaint updates and resolution % will pop up on your device screen</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testSent}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-600/20 px-3 py-1.5 font-medium text-teal-200 transition hover:bg-teal-600/40"
        >
          <BellRing size={13} /> {testSent ? 'Alert Dispatched!' : 'Send Test Alert to Phone'}
        </button>
      </div>
    )
  }

  if (mobilePermission === 'denied') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-xs text-amber-200/90">
        <Smartphone size={16} className="shrink-0 text-amber-400" />
        <p>
          Notifications are blocked in your browser settings. To get lock-screen updates on your phone, click the lock icon in the address bar and switch Notifications to &apos;Allow&apos;.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 p-4 text-xs shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30">
          <Smartphone size={18} />
        </div>
        <div>
          <p className="font-bold text-sm text-white">Enable Mobile Push Notifications</p>
          <p className="mt-0.5 text-slate-300">
            Get instant lock-screen alerts on your phone whenever the admin reviews your complaint or updates its resolution percentage.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleEnable}
        disabled={isActivating}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 font-semibold text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        <Bell size={14} /> {isActivating ? 'Requesting…' : 'Enable Mobile Alerts'}
      </button>
    </div>
  )
}
