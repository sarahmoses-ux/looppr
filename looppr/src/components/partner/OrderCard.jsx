import { useState } from 'react'
import StageBadge from './StageBadge'
import {
  formatAddress,
  formatCurrency,
  formatDate,
  LOAD_SIZE_LABELS,
  NEXT_ACTION,
  orderRef,
  stageOf,
  WINDOW_LABELS,
} from './partnerUi'

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      <p className="mt-0.5 text-sm text-ink/80">{children}</p>
    </div>
  )
}

function PaymentPill({ status }) {
  const map = {
    paid: 'bg-success-soft text-success-dark',
    pending: 'bg-amber-50 text-amber-700',
    unpaid: 'bg-ink/5 text-ink/60',
    failed: 'bg-red-50 text-red-600',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] || map.unpaid}`}>
      {status}
    </span>
  )
}

// One order with the fields from the spec + the actions available at its
// current stage. `onAccept`/`onReject`/`onAdvance` return promises; the card
// manages its own busy state.
export default function OrderCard({ order, onAccept, onReject, onAdvance }) {
  const [busy, setBusy] = useState(false)
  const stage = stageOf(order)
  const next = NEXT_ACTION[stage]

  async function run(fn) {
    if (!fn) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_16px_-8px_rgba(30,27,75,0.10)] transition-shadow hover:shadow-[0_10px_28px_-12px_rgba(30,27,75,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold text-ink">{order.customerName}</span>
            <span className="text-xs font-medium text-ink/40">{orderRef(order._id)}</span>
          </div>
          <p className="mt-0.5 text-xs text-ink/50">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentPill status={order.paymentStatus} />
          <StageBadge order={order} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Pickup address">{formatAddress(order.address)}</Field>
        <Field label="Delivery address">{order.deliveryAddress ? formatAddress(order.deliveryAddress) : 'Same as pickup'}</Field>
        <Field label="Services">{LOAD_SIZE_LABELS[order.loadSize] || order.loadSize}</Field>
        <Field label="Pickup time">{formatDate(order.preferredDate)} · {WINDOW_LABELS[order.window]?.split(' ')[0]}</Field>
        <Field label="Delivery deadline">{WINDOW_LABELS[order.deliveryWindow]?.split(' ')[0] || '—'}</Field>
        <Field label="Amount">{formatCurrency(order.pricing?.amount)}</Field>
      </div>

      {(onAccept || onReject || (onAdvance && next)) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {onAccept && stage === 'new' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onAccept(order))}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
            >
              Accept order
            </button>
          )}
          {onAdvance && next && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onAdvance(order, next.action))}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-light disabled:opacity-50"
            >
              {next.label}
            </button>
          )}
          {onReject && stage !== 'delivered' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onReject(order))}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}
