export default function Select({ label, id, error, className = '', children, ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-ink/80">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-periwinkle'
        }`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
