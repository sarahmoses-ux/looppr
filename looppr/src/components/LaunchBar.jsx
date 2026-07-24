import { Link } from 'react-router-dom'

export default function LaunchBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-periwinkle px-4 py-2.5 text-center sm:px-6 lg:px-8">
      <div className="mobile-marquee w-full sm:w-auto">
        <div className="mobile-marquee__track items-center">
          <span className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:hidden sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Looppr is live in OKC, Edmond, Norman &amp; Moore
          </span>
          <span
            className="ml-6 flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:hidden sm:text-sm"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Looppr is live in OKC, Edmond, Norman &amp; Moore
          </span>
          <span className="hidden items-center gap-2 whitespace-nowrap text-xs font-semibold text-white sm:flex sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Looppr is live in OKC, Edmond, Norman &amp; Moore
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-display text-xs font-bold tracking-wide text-white">
        Available now
      </span>
      <Link
        to="/book"
        className="whitespace-nowrap text-xs font-bold text-white underline opacity-90 hover:opacity-100"
      >
        Book a pickup
      </Link>
    </div>
  )
}
