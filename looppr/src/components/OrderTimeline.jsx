import { ORDER_FLOW } from '../constants/orderStatus'

// Vertical stepper through the full order lifecycle. 'cancelled' isn't a
// step in the sequence (see constants/orderStatus.js) — it's shown as a
// callout above whatever progress had been made instead.
export default function OrderTimeline({ status }) {
  const isCancelled = status === 'cancelled'
  const currentIndex = ORDER_FLOW.findIndex((s) => s.value === status)

  return (
    <div>
      {isCancelled && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
          <p className="text-sm font-semibold text-red-600">This order was cancelled.</p>
        </div>
      )}
      <ol>
        {ORDER_FLOW.map((step, i) => {
          const isDone = !isCancelled && i < currentIndex
          const isCurrent = !isCancelled && i === currentIndex
          const isLast = i === ORDER_FLOW.length - 1

          return (
            <li key={step.value} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5 ${
                    isDone ? 'bg-success' : 'bg-line'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? 'border-success bg-success text-white'
                    : isCurrent
                      ? 'border-periwinkle bg-periwinkle text-white'
                      : 'border-line bg-white'
                }`}
              >
                {isDone && (
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <p
                className={`pt-0.5 text-sm ${
                  isCurrent ? 'font-semibold text-ink' : isDone ? 'text-ink/70' : 'text-ink/40'
                }`}
              >
                {step.label}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
