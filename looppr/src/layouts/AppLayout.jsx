import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoOnDark from '../assets/looppr-mark-on-dark.png'
import Button from '../components/Button'

function OverviewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 11.5 12 4l8 7.5M6 9.8V19a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0A1.5 1.5 0 0 1 13.5 15v5H17a1 1 0 0 0 1-1V9.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function OrdersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7h16M4 7l1.5 12a1.5 1.5 0 0 0 1.5 1.3h10a1.5 1.5 0 0 0 1.5-1.3L20 7M9 11h6M9 4h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4.75 19.25c1.1-3.2 4-5 7.25-5s6.15 1.8 7.25 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/home', label: 'Overview', Icon: OverviewIcon, end: true },
  { to: '/orders', label: 'My Orders', Icon: OrdersIcon },
  { to: '/profile', label: 'Profile', Icon: ProfileIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

function NavItems({ onNavigate, className = '' }) {
  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {NAV_ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-periwinkle-soft text-periwinkle-text'
                : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
            }`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-linen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-white lg:px-4 lg:py-6">
        <Link to="/home" className="flex items-center gap-2.5 px-2">
          <img src={logoOnDark} alt="Looppr" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Looppr
          </span>
        </Link>

        <NavItems className="mt-8" />

        <div className="mt-auto space-y-3 border-t border-line px-2 pt-4">
          <p className="truncate text-sm font-medium text-ink/70">{user?.name}</p>
          <Button onClick={logout} variant="ghost" className="w-full px-4! py-2.5! text-sm!">
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile / tablet top bar */}
        <header className="border-b border-line bg-white/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-6">
            <Link to="/home" className="flex items-center gap-2.5">
              <img src={logoOnDark} alt="Looppr" className="h-8 w-8 rounded-lg" />
              <span className="font-display text-lg font-semibold tracking-tight text-ink">
                Looppr
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>

          {open && (
            <div className="border-t border-line px-4 py-4 sm:px-6">
              <NavItems onNavigate={() => setOpen(false)} />
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                <p className="truncate text-sm font-medium text-ink/70">{user?.name}</p>
                <Button onClick={logout} variant="ghost" className="w-full px-4! py-2.5! text-sm!">
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
