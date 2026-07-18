import { useState } from 'react'
import StageBadge from './StageBadge'
import {
  displayWeight,
  formatAddress,
  formatCurrency,
  formatDate,
  NEXT_ACTION,
  orderRef,
  stageOf,
  WINDOW_LABELS,
} from './driverUi'

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

// One delivery with the fields a driver needs + the actions available at its
// current stage. `onAccept`/`onReject`/`onAdvance`/`onConfirmWeight` return
// promises (or, for the reason/weight modals, just open them); the card
// manages its own busy state.
export default function DeliveryCard({ delivery, onAccept, onReject, onAdvance, onConfirmWeight }) {
  const [busy, setBusy] = useState(false)
  const stage = stageOf(delivery)
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
            <span className="font-display text-base font-semibold text-ink">{delivery.customerName}</span>
            <span className="text-xs font-medium text-ink/40">{orderRef(delivery._id)}</span>
          </div>
          <p className="mt-0.5 text-xs text-ink/50">Placed {formatDate(delivery.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentPill status={delivery.paymentStatus} />
          <StageBadge delivery={delivery} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Pickup address">{formatAddress(delivery.address)}</Field>
        <Field label="Delivery address">{delivery.deliveryAddress ? formatAddress(delivery.deliveryAddress) : 'Same as pickup'}</Field>
        <Field label="Weight">{displayWeight(delivery)}</Field>
        <Field label="Pickup window">{formatDate(delivery.preferredDate)} · {WINDOW_LABELS[delivery.window]?.split(' ')[0]}</Field>
        <Field label="Delivery window">{WINDOW_LABELS[delivery.deliveryWindow]?.split(' ')[0] || '—'}</Field>
        <Field label="Delivery fee">{formatCurrency(delivery.pricing?.deliveryFee)}</Field>
      </div>

      {(onAccept || onReject || onConfirmWeight || (onAdvance && next)) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {onAccept && stage === 'new' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onAccept(delivery))}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
            >
              Accept delivery
            </button>
          )}
          {onConfirmWeight && stage !== 'new' && stage !== 'delivered' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onConfirmWeight(delivery))}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:opacity-50"
            >
              {delivery.actualWeightLbs != null ? 'Update pounds' : 'Confirm pounds'}
            </button>
          )}
          {onAdvance && next && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onAdvance(delivery, next.action))}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-light disabled:opacity-50"
            >
              {next.label}
            </button>
          )}
          {onReject && stage !== 'delivered' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onReject(delivery))}
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
