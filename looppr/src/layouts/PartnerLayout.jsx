import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/looppr-mark-transparent.png'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { PartnerDataProvider } from '../context/PartnerDataContext'
import { updateAvailability } from '../services/partnerDashboardApi'

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/partners/dashboard', end: true, label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { to: '/partners/dashboard/incoming', label: 'Incoming Orders', icon: <><path d="M4 4h16v5H4zM4 13h16v7H4z" /><path d="M8 16h5" /></> },
  { to: '/partners/dashboard/accepted', label: 'Accepted Orders', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></> },
  { to: '/partners/dashboard/schedule', label: 'Pickup Schedule', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  { to: '/partners/dashboard/drivers', label: 'Drivers', icon: <><path d="M5 17h14l-1.5-6.5A2 2 0 0 0 15.6 9H8.4a2 2 0 0 0-1.9 1.5z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></> },
  { to: '/partners/dashboard/earnings', label: 'Earnings', icon: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
  { to: '/partners/dashboard/reviews', label: 'Customer Reviews', icon: <><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.3 1.6-6.8L2.2 8.9l6.9-.6z" /></> },
  { to: '/partners/dashboard/notifications', label: 'Notifications', icon: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></> },
  { to: '/partners/dashboard/profile', label: 'Business Profile', icon: <><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></> },
  { to: '/partners/dashboard/settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 15H2.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 11 2.5a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 17 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21.4 9v.09a2 2 0 0 1 0 4z" /></> },
]

function SidebarNav({ partner, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-0 px-5 py-5">
        <img src={logo} alt="Looppr" className="-mr-1 h-8 w-8" />
        <span className="font-display text-base font-semibold tracking-tight text-ink">Looppr</span>
        <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">Partner</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-sky-50 text-sky-700' : 'text-ink/60 hover:bg-linen hover:text-ink'}`
            }
          >
            <Icon path={icon} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {partner?.logo ? <img src={partner.logo} alt="" className="h-full w-full object-cover" /> : (partner?.businessName || 'P').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{partner?.businessName}</p>
            <p className="truncate text-xs text-ink/50">{partner?.email}</p>
          </div>
        </div>
        <button type="button" onClick={onLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-red-50 hover:text-red-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

function AvailabilityToggle() {
  const { partner, setPartner } = usePartnerAuth()
  const [busy, setBusy] = useState(false)
  const online = partner?.availability === 'online'

  async function toggle() {
    setBusy(true)
    try {
      const { partner: updated } = await updateAvailability(online ? 'offline' : 'online')
      setPartner(updated)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${online ? 'bg-success-soft text-success-dark' : 'bg-ink/5 text-ink/60'}`}
      aria-pressed={online}
    >
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-success' : 'bg-ink/40'}`} />
      {online ? 'Online' : 'Offline'}
    </button>
  )
}

function PartnerLayoutInner() {
  const { partner, logout } = usePartnerAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/partners/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-linen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
        <SidebarNav partner={partner} onLogout={handleLogout} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarNav partner={partner} onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-ink/60 transition-colors hover:bg-linen lg:hidden">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
            </button>
            <p className="hidden text-sm font-medium text-ink/50 sm:block">
              Welcome, <span className="font-semibold text-ink">{partner?.ownerName || partner?.businessName}</span>
            </p>
            <div className="ml-auto">
              <AvailabilityToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function PartnerLayout() {
  return (
    <PartnerDataProvider>
      <PartnerLayoutInner />
    </PartnerDataProvider>
  )
}
