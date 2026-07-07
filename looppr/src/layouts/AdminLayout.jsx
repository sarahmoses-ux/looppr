import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoOnDark from '../assets/looppr-mark-on-dark.png'
import Button from '../components/Button'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src={logoOnDark} alt="Looppr" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Looppr</span>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-ink/60 sm:inline">{user?.name}</span>
            <Button
              onClick={logout}
              variant="ghost"
              className="px-4! py-2! text-xs! sm:px-5! sm:text-sm!"
            >
              Sign out
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink/50 hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
