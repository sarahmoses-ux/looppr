import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoOnDark from '../assets/looppr-mark-on-dark.png'
import Button from '../components/Button'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link to="/home" className="flex items-center gap-2.5">
            <img src={logoOnDark} alt="Looppr" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Looppr
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-ink/60 sm:inline">
              {user?.name}
            </span>
            <Button
              onClick={logout}
              variant="ghost"
              className="px-4! py-2! text-xs! sm:px-5! sm:text-sm!"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
