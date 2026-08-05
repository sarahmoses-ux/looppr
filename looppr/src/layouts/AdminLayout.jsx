import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { effectiveAdminRole } from '../constants/adminRoles'
import logo from '../assets/looppr-mark-transparent.png'

// Icon set lifted from the getloopper-app-design "Looppr OS" mockup
// (24x24 viewBox, stroke currentColor, strokeWidth 2) so the sidebar reads
// as the same visual language as the reference design.
function IconDashboard() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
function IconOperations() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="8" height="7" rx="1.5" />
      <rect x="13" y="13" width="8" height="7" rx="1.5" />
    </svg>
  )
}
function IconCustomers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}
function IconApplications() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  )
}
function IconCrm() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="18" cy="8" r="2.4" />
      <path d="M15.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
    </svg>
  )
}
function IconGrowth() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 17.4 0 20M12 3c-2.5 2.6-2.5 17.4 0 20" />
    </svg>
  )
}
function IconReports() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V10M12 19V5M20 19v-6" />
    </svg>
  )
}
function IconSystem() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  )
}
function IconAdminUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3z" />
      <path d="M9.5 12l1.8 1.8L14.8 10" />
    </svg>
  )
}
function IconPayouts() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5c0-1.4 1.2-2.5 2.5-2.5s2.5.9 2.5 2.1c0 3.2-5 1.6-5 4.8 0 1.2 1.2 2.1 2.5 2.1s2.5-1.1 2.5-2.5" />
    </svg>
  )
}

// Mirrors the Operations / CRM / Growth / Reports / System grouping from the
// getloopper-app-design "Looppr OS" mockup. CRM/Growth/Reports/System are
// locked placeholders — that part of the design has no real page behind it
// yet, so they show the mockup's own lock affordance instead of a dead link.
//
// `roles` on an item/child gates it to those admin sub-roles (super_admin
// always sees everything); omit `roles` for items open to every admin.
// Mirrors the backend's requireAdminRole(...) matrix in routes/adminRoutes.js
// — kept in sync by hand since nav is presentation-only, not a security
// boundary (the API enforces the real one).
const NAV_TREE = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard, to: '/admin/dashboard', end: true },
  {
    id: 'ops',
    label: 'Operations',
    icon: IconOperations,
    children: [
      { label: 'Bookings', to: '/admin/bookings' },
      { label: 'Jobs & Routes', to: '/admin/jobs' },
      { label: 'Orders', to: '/admin/orders' },
      { label: 'Customer Care', to: '/admin/customer-care', roles: ['support'] },
    ],
  },
  { id: 'customers', label: 'Customers', icon: IconCustomers, to: '/admin/customers' },
  { id: 'applications', label: 'Applications', icon: IconApplications, to: '/admin/applications', roles: ['ops'] },
  { id: 'crm', label: 'CRM & Pipeline', icon: IconCrm, to: '/admin/crm' },
  { id: 'growth', label: 'Data Collection', icon: IconGrowth, to: '/admin/data-collection', roles: [] },
  { id: 'reports', label: 'Reports', icon: IconReports, to: '/admin/reports', roles: [] },
  { id: 'payouts', label: 'Payouts & Invoices', icon: IconPayouts, to: '/admin/payouts', roles: [] },
  { id: 'system', label: 'Activity Log', icon: IconSystem, to: '/admin/activity-log', roles: ['ops'] },
  { id: 'admin-users', label: 'Admin Users', icon: IconAdminUsers, to: '/admin/admin-users', roles: [] },
]

function canSee(item, adminRole) {
  if (!item.roles) return true
  return adminRole === 'super_admin' || item.roles.includes(adminRole)
}

const PAGE_META = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Business overview' },
  '/admin/bookings': { title: 'Bookings', subtitle: 'Pickup windows for the next 7 days' },
  '/admin/jobs': { title: 'Jobs & Routes', subtitle: 'Advance jobs through fulfillment' },
  '/admin/orders': { title: 'Orders', subtitle: 'All Looppr laundry orders' },
  '/admin/customer-care': { title: 'Customer Care', subtitle: 'Contact form requests' },
  '/admin/customers': { title: 'Customers', subtitle: 'All registered Looppr customers' },
  '/admin/applications': { title: 'Applications', subtitle: 'Review Partner and Driver applications' },
  '/admin/crm': { title: 'CRM & Pipeline', subtitle: 'B2B leads and business accounts' },
  '/admin/reports': { title: 'Reports', subtitle: 'Revenue and order volume' },
  '/admin/activity-log': { title: 'Activity Log', subtitle: 'Every automated and manual action, in order' },
  '/admin/data-collection': { title: 'Data Collection', subtitle: 'Every intake point, in one view' },
  '/admin/admin-users': { title: 'Admin Users', subtitle: 'Manage admin accounts and access levels' },
  '/admin/payouts': { title: 'Payouts & Invoices', subtitle: 'Partner/driver payouts and business invoices' },
}

function NavIcon({ icon: Icon }) {
  return (
    <span className="flex w-4.5 shrink-0 items-center justify-center">
      <Icon />
    </span>
  )
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function SidebarContent({ user, onNavigate, onLogout }) {
  const location = useLocation()
  const { showToast } = useToast()
  const [openGroups, setOpenGroups] = useState({ ops: true })
  const adminRole = effectiveAdminRole(user)

  const visibleNav = useMemo(
    () =>
      NAV_TREE.filter((item) => canSee(item, adminRole))
        .map((item) =>
          item.children ? { ...item, children: item.children.filter((c) => canSee(c, adminRole)) } : item,
        )
        .filter((item) => !item.children || item.children.length > 0),
    [adminRole],
  )

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function linkClasses({ isActive }) {
    return `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${
      isActive ? 'bg-white/25 text-white' : 'text-linen/90 hover:bg-white/10'
    }`
  }

  return (
    <div className="flex h-full flex-col p-3.5">
      <div className="mb-3 flex items-center gap-2.5 border-b border-white/15 px-1.5 pb-4">
        <img src={logo} alt="" className="h-6 w-6 object-contain brightness-0 invert" />
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-tight text-white">
            Looppr <span className="text-linen/80">OS</span>
          </p>
          <p className="truncate text-[10px] tracking-wide text-linen/70">Admin console</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          if (item.locked) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => showToast(`${item.label} isn't built yet.`, 'error')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-linen/40"
              >
                <NavIcon icon={item.icon} />
                <span className="flex-1 truncate">{item.label}</span>
                <LockIcon />
              </button>
            )
          }

          if (item.children) {
            const hasActive = item.children.some((c) => location.pathname.startsWith(c.to))
            const open = openGroups[item.id] ?? hasActive
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((g) => ({ ...g, [item.id]: !open }))}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition-colors ${
                    hasActive && !open ? 'bg-white/10 text-white' : 'text-linen/90 hover:bg-white/10'
                  }`}
                >
                  <NavIcon icon={item.icon} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-[10px] text-linen/70">{open ? '▾' : '▸'}</span>
                </button>
                {open && (
                  <div className="mb-1 mt-0.5 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                      <NavLink key={child.to} to={child.to} onClick={onNavigate} className={linkClasses}>
                        {({ isActive }) => (
                          <span className={`pl-6.75 ${isActive ? 'text-white' : 'text-linen/85'}`}>
                            {child.label}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink key={item.id} to={item.to} end={item.end} onClick={onNavigate} className={linkClasses}>
              <NavIcon icon={item.icon} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-3 flex items-center gap-2.5 border-t border-white/15 px-1 pt-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-white">{user?.name}</p>
          <p className="truncate text-[10.5px] capitalize text-linen/70">{adminRole.replace('_', ' ')}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          className="shrink-0 rounded-md p-1.5 text-linen/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  const meta = useMemo(
    () => PAGE_META[location.pathname] || { title: 'Admin', subtitle: '' },
    [location.pathname],
  )

  function handleSearchSubmit(e) {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/admin/orders?search=${encodeURIComponent(q)}` : '/admin/orders')
  }

  return (
    <div className="flex min-h-screen bg-linen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-periwinkle shadow-2xl transition-transform duration-200 md:static md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} onLogout={logout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-line p-2 text-ink md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
              {meta.title}
            </p>
            {meta.subtitle && <p className="truncate text-xs text-ink/50">{meta.subtitle}</p>}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden items-center gap-2 rounded-xl border border-line bg-linen px-3 py-2 sm:flex sm:w-56 lg:w-72"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0 text-ink/40" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </form>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
