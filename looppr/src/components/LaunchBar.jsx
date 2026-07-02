import { useEffect, useState } from 'react'

const LAUNCH_DATE = new Date('2026-07-23T00:00:00-05:00')

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(LAUNCH_DATE - new Date()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-periwinkle px-6 py-2.5 text-center">
      <span className="text-xs font-semibold text-white sm:text-sm">
        🚀 Looppr launches July 1, 2026 in OKC, Edmond, Norman &amp; Moore
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-xs font-bold tracking-wide text-white">
        {countdown}
      </span>
      <a
        href="#schedule"
        className="whitespace-nowrap text-xs font-bold text-white underline opacity-90 hover:opacity-100"
      >
        Join the waitlist →
      </a>
    </div>
  )
}
