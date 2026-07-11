import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoTransparent from '../assets/looppr-mark-transparent.png'
import Button from './Button'

const LINKS = [
  { label: 'Pricing', to: '/pricing' },
  { label: 'For business', to: '/business' },
  { label: 'Partners', to: '/laundromats' },
  { label: 'Drive', to: '/drive' },
  { label: 'Cities', to: '/cities' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, status, logout } = useAuth()
  const isAuthed = status === 'authenticated'

  return (
    <>
      <header className="border-b border-line bg-linen/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="flex items-center gap-0" onClick={() => setOpen(false)}>
          <img src={logoTransparent} alt="Looppr" className="-mr-1 h-9 w-9" />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Looppr
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth actions live here on sm+ only. Below that they'd have to
            share the row with the logo and the hamburger, which is exactly
            what was cramped/misaligned before — so on small screens they
            move into the hamburger menu instead (below) rather than being
            squeezed down to fit. */}
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to="/home"
                className="!hidden text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:!inline-flex"
              >
                {user?.name?.split(' ')[0]}
              </Link>
              <Button
                onClick={logout}
                variant="ghost"
                className="!hidden whitespace-nowrap px-6! py-3! text-sm! sm:!inline-flex"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/login"
                variant="ghost"
                className="!hidden whitespace-nowrap px-6! py-3! text-sm! sm:!inline-flex"
              >
                Sign in
              </Button>
              <Button
                to="/signup"
                variant="primary"
                className="!hidden whitespace-nowrap px-6! py-3! text-sm! sm:!inline-flex"
              >
                Get started
              </Button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Toggle menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
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
            </>
          )}
        </div>
      </nav>
    </header>

    {!isAuthed && open && (
      <div className="border-t border-ink/8 bg-linen px-4 py-4 sm:px-6 lg:px-8 md:hidden">
        <div className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Button to="/signup" variant="primary" onClick={() => setOpen(false)} className="w-full py-2.5! text-sm!">
              Get started
            </Button>
            <Button to="/login" variant="ghost" onClick={() => setOpen(false)} className="w-full py-2.5! text-sm!">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    )}

    {isAuthed && location.pathname === '/home' && (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-linen/95 px-2 py-2 shadow-[0_-8px_24px_-12px_rgba(30,27,75,0.2)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {LINKS.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex min-w-0 flex-1 flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                  isActive ? 'bg-periwinkle text-white shadow-sm' : 'text-ink/65 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )}
    </>
  )
}
