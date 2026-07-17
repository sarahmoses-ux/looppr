// Panel wrapper for dashboard sections (tables, lists). Optional header with
// a title + action slot (e.g. a "View all" link or "Request pickup" button).
export default function DashboardCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white shadow-[0_2px_16px_-8px_rgba(30,27,75,0.10)] ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-display text-base font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink/50">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
