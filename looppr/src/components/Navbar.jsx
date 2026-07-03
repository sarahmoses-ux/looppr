import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoOnDark from '../assets/looppr-mark-on-dark.png'
import Button from './Button'

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Why Looppr', href: '#why-loopr' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, status, logout } = useAuth()
  const isAuthed = status === 'authenticated'

  return (
    <header className="border-b border-line bg-linen/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={logoOnDark} alt="Looppr" className="h-9 w-9 rounded-lg" />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Looppr
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/laundromats"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            For laundromats
          </Link>
          <Link
            to="/drive"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Drive
          </Link>
          <Link
            to="/cities"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Cities
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to="/home"
                className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:inline-flex"
              >
                {user?.name?.split(' ')[0]}
              </Link>
              <Button
                onClick={logout}
                variant="ghost"
                className="px-4! py-2.5! text-xs! sm:px-6! sm:py-3! sm:text-sm!"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </Button>
              <Button
                to="/signup"
                variant="primary"
                className="px-4! py-2.5! text-xs! sm:px-6! sm:py-3! sm:text-sm!"
              >
                Get started
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
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
      </nav>

      {open && (
        <div className="border-t border-ink/8 bg-linen px-4 sm:px-6 lg:px-8 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/laundromats"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              For laundromats
            </Link>
            <Link
              to="/drive"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Drive with us
            </Link>
            <Link
              to="/cities"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Cities
            </Link>
            {isAuthed ? (
              <Link
                to="/home"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink sm:hidden"
              >
                {user?.name?.split(' ')[0]}’s account
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink sm:hidden"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
