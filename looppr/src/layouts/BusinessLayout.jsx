import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/looppr-mark-transparent.png'
import { useBusinessAuth } from '../context/BusinessAuthContext'
import { BusinessDataProvider, useBusinessData } from '../context/BusinessDataContext'
import RequestPickupModal from '../components/business/RequestPickupModal'

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/business/dashboard', end: true, label: 'Overview', icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { to: '/business/dashboard/requests', label: 'Laundry Requests', icon: <><path d="M9 5h6M9 5a2 2 0 0 1-4 0M9 5a2 2 0 0 0-4 0" /><path d="M5 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5" /><path d="M9 12h6M9 16h4" /></> },
  { to: '/business/dashboard/schedule', label: 'Pickup Schedule', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  { to: '/business/dashboard/invoices', label: 'Invoices', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></> },
  { to: '/business/dashboard/notifications', label: 'Notifications', icon: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></> },
  { to: '/business/dashboard/settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 15H2.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 11 2.5a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 17 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21.4 9v.09a2 2 0 0 1 0 4z" /></> },
]

function SidebarNav({ business, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-0 px-5 py-5">
        <img src={logo} alt="Looppr" className="-mr-1 h-8 w-8" />
        <span className="font-display text-base font-semibold tracking-tight text-ink">Looppr</span>
        <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
          Business
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-ink/60 hover:bg-linen hover:text-ink'
              }`
            }
          >
            <Icon path={icon} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {(business?.businessName || 'B').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{business?.businessName}</p>
            <p className="truncate text-xs text-ink/50">{business?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

function BusinessLayoutInner() {
  const { business, logout } = useBusinessAuth()
  const { reload } = useBusinessData()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pickupOpen, setPickupOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/business/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-linen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
        <SidebarNav business={business} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarNav business={business} onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-ink/60 transition-colors hover:bg-linen lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <p className="hidden text-sm font-medium text-ink/50 sm:block">
              Welcome back, <span className="font-semibold text-ink">{business?.contactPerson || business?.businessName}</span>
            </p>
            <button
              type="button"
              onClick={() => setPickupOpen(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_-4px_rgba(14,165,233,0.45)] transition-colors hover:bg-sky-600"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
              Request pickup
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet context={{ openPickup: () => setPickupOpen(true) }} />
        </main>
      </div>

      <RequestPickupModal
        key={pickupOpen ? 'open' : 'closed'}
        open={pickupOpen}
        onClose={() => setPickupOpen(false)}
        onCreated={() => reload()}
      />
    </div>
  )
}

// Provides the shared dashboard data to the whole /business/dashboard subtree,
// then renders the sidebar shell.
export default function BusinessLayout() {
  return (
    <BusinessDataProvider>
      <BusinessLayoutInner />
    </BusinessDataProvider>
  )
}
