import { Link } from 'react-router-dom'
import logo from '../../assets/looppr-mark-transparent.png'
import SEO from '../SEO'

const HIGHLIGHTS = [
  '8-hour turnaround SLA, in writing',
  'One consolidated monthly invoice',
  'Dedicated account manager for high-volume accounts',
  'Live pickup tracking across every location',
]

// Split-screen auth layout for the Business Portal. Mirrors the customer
// AuthLayout: the branding panel is a single stack centered both vertically
// and horizontally, and the form column's title/subtitle are centered too.
export default function BusinessAuthShell({ title, subtitle, children, footer, description, keywords, noindex = true }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <SEO title={`${title} · Looppr for Business`} description={description} keywords={keywords} noindex={noindex} />

      <Link to="/business" className="absolute left-6 top-6 z-10 flex items-center gap-0 lg:hidden">
        <img src={logo} alt="" className="-mr-1 h-9 w-9" />
        <span className="font-display text-xl font-semibold tracking-tight text-ink">Looppr</span>
        <span className="ml-2 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
          for Business
        </span>
      </Link>

      {/* Branding panel — centered stack, same treatment as AuthLayout. */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:items-center lg:justify-center lg:p-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(124,115,230,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(56,189,248,0.22), transparent 42%)',
          }}
        />

        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          <Link to="/business" className="flex items-center gap-0">
            <img src={logo} alt="Looppr" className="-mr-1.5 h-11 w-11" />
            <span className="font-display text-2xl font-semibold tracking-tight text-white">Looppr</span>
            <span className="ml-2 rounded-full bg-sky-400/20 px-2.5 py-0.5 text-xs font-semibold text-sky-200 ring-1 ring-inset ring-sky-400/30">
              for Business
            </span>
          </Link>

          <p className="mt-12 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
            Commercial laundry, <em className="italic text-periwinkle-muted">handled.</em>
          </p>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70 xl:text-xl">
            Hotels, gyms, Airbnb hosts and med spas trust Looppr for linen turnaround — picked up
            daily on your schedule and billed once a month.
          </p>

          <ul className="mt-9 flex flex-col items-center gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm leading-relaxed text-white/75">
                <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-sky-300" fill="none" aria-hidden="true">
                  <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form column — centered title/subtitle, left-aligned fields. */}
      <div className="flex items-center justify-center px-4 py-16 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
            For business
          </p>
          <h1 className="mt-3 text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-center text-base font-medium text-ink/60 sm:text-lg">{subtitle}</p>
          )}
          <div className="mt-10 text-left">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink/60">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
