// A single status-update notification (Pickup Confirmed, In Progress, etc.).
const TONES = {
  sky: 'border-sky-100 bg-sky-50/60',
  violet: 'border-violet-100 bg-violet-50/60',
  amber: 'border-amber-100 bg-amber-50/60',
  success: 'border-success/20 bg-success-soft/60',
}

const DOT = {
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  success: 'bg-success',
}

export default function NotificationCard({ title, body, time, tone = 'sky' }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${TONES[tone] || TONES.sky}`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[tone] || DOT.sky}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {time && <span className="shrink-0 text-xs text-ink/45">{time}</span>}
        </div>
        {body && <p className="mt-0.5 text-sm text-ink/60">{body}</p>}
      </div>
    </div>
  )
}
