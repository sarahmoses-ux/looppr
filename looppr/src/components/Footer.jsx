import { Link } from 'react-router-dom'
import logoTransparent from '../assets/looppr-mark-transparent.png'

const COLUMNS = [
  {
    heading: 'Customers',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Help & FAQ', href: '/faq' },
      { label: 'Cities & coverage', href: '/cities' },
    ],
  },
  {
    heading: 'Partners',
    links: [
      { label: 'For business', href: '/laundromats' },
      { label: 'Laundromat partners', href: '/laundromats' },
      { label: 'Drive with us', href: '/drive' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/getlooppr',
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/getlooppr',
    path: (
      <path
        fill="currentColor"
        stroke="none"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/getlooppr',
    path: (
      <path
        fill="currentColor"
        stroke="none"
        d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/getlooppr',
    path: (
      <path
        fill="currentColor"
        stroke="none"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    ),
  },
]

function FooterLink({ href, children }) {
  const className = 'text-sm text-white/60 transition-colors hover:text-white'
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="bg-ink-footer text-white/60">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoTransparent} alt="" loading="lazy" decoding="async" className="h-8 w-8" />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Looppr
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Laundry pickup and delivery, powered by the local laundromats
              already in your neighborhood. Edmond &amp; Oklahoma City.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/80 transition-colors hover:bg-white/15"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    {s.path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Looppr Inc. · Edmond, Oklahoma</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white/80">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white/80">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
