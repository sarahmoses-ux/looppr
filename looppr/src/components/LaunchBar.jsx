import { useEffect, useState } from 'react'
import { joinWaitlist } from '../services/waitlistApi'

const LAUNCH_DATE = new Date('2026-07-12T00:00:00-05:00')

function formatCountdown(diff) {
  if (diff <= 0) return 'Live now!'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${d}d ${h}h ${m}m ${s}s`
}

export default function LaunchBar() {
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(LAUNCH_DATE - new Date()),
  )
  // idle -> form -> success
  const [mode, setMode] = useState('idle')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(LAUNCH_DATE - new Date()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setStatus('pending')
    try {
      await joinWaitlist(email)
      setMode('success')
    } catch (err) {
      setError(
        err.response?.status === 429
          ? 'Too many attempts. Please try again later.'
          : err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
      )
      setStatus('idle')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-periwinkle px-4 py-2.5 text-center sm:px-6 lg:px-8">
      <div className="mobile-marquee w-full sm:w-auto">
        <div className="mobile-marquee__track items-center">
          <span className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:hidden sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
            Looppr launches July 12, 2026 in OKC, Edmond, Norman &amp; Moore
          </span>
          <span
            className="ml-6 flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:hidden sm:text-sm"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
            Looppr launches July 12, 2026 in OKC, Edmond, Norman &amp; Moore
          </span>
          <span className="hidden items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:flex sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
            Looppr launches July 12, 2026 in OKC, Edmond, Norman &amp; Moore
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-xs font-bold tracking-wide text-white">
        {countdown}
      </span>

      {mode === 'idle' && (
        <button
          type="button"
          onClick={() => setMode('form')}
          className="whitespace-nowrap text-xs font-bold text-white underline opacity-90 hover:opacity-100"
        >
          Join the waitlist →
        </button>
      )}

      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="w-44 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white placeholder:text-white/60 outline-none focus:border-white sm:w-56"
          />
          <button
            type="submit"
            disabled={status === 'pending'}
            className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-periwinkle-text transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === 'pending' ? 'Joining…' : 'Notify me'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('idle')
              setError('')
            }}
            aria-label="Cancel"
            className="text-white/70 hover:text-white"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      )}

      {mode === 'success' && (
        <span className="text-xs font-bold text-white">You're on the list!</span>
      )}

      {error && <span className="w-full text-xs font-semibold text-white/90 sm:w-auto">{error}</span>}
    </div>
  )
}
