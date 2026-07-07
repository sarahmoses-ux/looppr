import logoTransparent from '../assets/looppr-mark-transparent.png'

// Single source of truth for site-wide SEO defaults. Update SITE_URL once
// a production domain is confirmed — everything else (canonical URLs,
// sitemap.xml, robots.txt Sitemap: line, OG/Twitter tags) derives from it.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://getlooppr.com').replace(/\/+$/, '')

export const SITE_NAME = 'Looppr'

export const DEFAULT_TITLE = 'Looppr — Laundry day, off your plate.'

export const DEFAULT_DESCRIPTION =
  'Looppr — book a laundry pickup in minutes. A trusted local laundry pro washes and folds your clothes, then delivers them back to your door.'

// Placeholder — swap for a dedicated 1200x630 branded social share image
// before launch. The logo mark crops safely but isn't a real OG banner.
export const DEFAULT_OG_IMAGE = `${SITE_URL}${logoTransparent}`

export const SOCIAL_PROFILES = [
  'https://instagram.com/getlooppr',
  'https://x.com/getlooppr',
  'https://facebook.com/getlooppr',
  'https://linkedin.com/company/getlooppr',
]
