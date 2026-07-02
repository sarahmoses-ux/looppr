import { useState } from 'react'

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      {open ? (
        <>
          <path
            d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
        </>
      ) : (
        <path
          d="M2.5 2.5l15 15M8.35 8.4a2.25 2.25 0 0 0 3.2 3.2M6.2 6.24C3.9 7.6 2.3 10 2.3 10s3 6 7.7 6c1.4 0 2.63-.35 3.68-.9M11.2 4.2c-.4-.07-.8-.1-1.2-.1-5.5 0-8.5 6-8.5 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default function Input({ label, id, error, className = '', type = 'text', ...rest }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (visible ? 'text' : 'password') : type

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-ink/80">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 ${
            isPassword ? 'pr-11' : ''
          } ${error ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-periwinkle'}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink/45 transition-colors hover:text-ink"
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
