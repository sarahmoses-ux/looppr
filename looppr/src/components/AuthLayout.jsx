import { Link } from 'react-router-dom'
import logoTransparent from '../assets/looppr-mark-transparent.png'
import SEO from './SEO'

export default function AuthLayout({ eyebrow, title, subtitle, noindex = false, children }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <SEO title={title} description={subtitle} noindex={noindex} />
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2.5 lg:hidden"
      >
        <img src={logoTransparent} alt="" className="h-7 w-7" />
        <span className="font-display text-lg font-bold text-ink">Looppr</span>
      </Link>

      {/* Branding panel — content is a single stack (logo, heading, subtitle)
          centered both vertically and horizontally within the panel. */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:items-center lg:justify-center lg:p-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(124,115,230,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(124,115,230,0.2), transparent 40%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(248,247,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(248,247,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoTransparent} alt="Looppr" className="h-11 w-11" />
            <span className="font-display text-2xl font-bold text-white">Looppr</span>
          </Link>

          {/* Repeated brand tagline, not page-unique content — kept out of
              the heading outline so the page's own <h1 (the `title` prop)
              stays the single top-level heading. */}
          <p className="mt-12 font-display text-6xl font-bold leading-[1.05] tracking-tight text-white xl:text-7xl">
            Laundry, <em className="italic text-periwinkle-muted">handled.</em>
          </p>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70 xl:text-xl">
            Book a pickup, and we’ll email you the moment your laundry pro
            has it ready and again when it’s back at your door.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-periwinkle">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-center text-base font-medium text-ink/60 sm:text-lg">
              {subtitle}
            </p>
          )}
          <div className="mt-10 text-left">{children}</div>
        </div>
      </div>
    </div>
  )
}
