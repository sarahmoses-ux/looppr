// Overview / analytics metric tile. Soft shadow, rounded, subtle hover lift —
// the "premium SaaS" surface used across the dashboard.
export default function StatCard({ label, value, hint, icon, accent = 'sky' }) {
  const accents = {
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    success: 'bg-success-soft text-success-dark',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="group rounded-2xl border border-line bg-white p-5 shadow-[0_2px_16px_-8px_rgba(30,27,75,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_rgba(30,27,75,0.22)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink/55">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-ink/45">{hint}</p>}
    </div>
  )
}
