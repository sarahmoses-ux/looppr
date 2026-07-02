import { Link } from 'react-router-dom'
import logoTransparent from '../assets/looppr-mark-transparent.png'

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2.5 lg:hidden"
      >
        <img src={logoTransparent} alt="" className="h-7 w-7" />
        <span className="font-display text-base font-semibold text-ink">Looppr</span>
      </Link>

      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(127,119,221,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(242,121,74,0.22), transparent 40%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(250,246,239,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,246,239,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <img src={logoTransparent} alt="Looppr" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold text-linen">Looppr</span>
        </Link>
        <div className="relative max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight text-linen">
            Laundry day, off your plate.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-linen/60">
            Book a pickup, and we’ll email you the moment your laundry pro
            has it ready and again when it’s back at your door.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-periwinkle">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-ink/60">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
