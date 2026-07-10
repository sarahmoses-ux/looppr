import { Link } from 'react-router-dom'

const VARIANTS = {
  primary:
    'bg-periwinkle text-white hover:bg-periwinkle-text shadow-[0_6px_20px_-4px_rgba(124,115,230,0.35)]',
  accent: 'bg-periwinkle text-white hover:bg-periwinkle/90',
  inverse: 'bg-white text-ink hover:bg-periwinkle-soft',
  ghost: 'bg-transparent text-periwinkle-text border border-line hover:border-periwinkle-muted hover:text-ink',
  'ghost-light': 'bg-transparent text-white border border-white/30 hover:border-white/70',
  destructive: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
}

export default function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  className = '',
  children,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
