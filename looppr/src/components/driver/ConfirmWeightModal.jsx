import { useState } from 'react'
import Button from '../Button'
import { estimatedLbs, orderRef } from './driverUi'

// Lets the driver update or confirm the actual pounds for a claimed delivery
// — corrects a customer/business mistake made at booking. The confirmed
// value overrides the original loadSize estimate (see driverUi.displayWeight)
// and is re-priced on the backend unless the order is already paid.
//
// The parent should remount this via a changing `key` (e.g. delivery?._id)
// whenever `delivery` changes, so the prefilled value always matches the
// delivery currently being confirmed rather than the previous one.
export default function ConfirmWeightModal({ delivery, onConfirm, onClose }) {
  const [lbs, setLbs] = useState(() => (delivery ? String(estimatedLbs(delivery)) : ''))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!delivery) return null

  async function handleConfirm() {
    const value = Number(lbs)
    if (!Number.isFinite(value) || value <= 0 || value > 500) {
      setError('Enter a valid weight in pounds.')
      return
    }
    setBusy(true)
    try {
      await onConfirm(value)
    } catch {
      setError('Could not save the weight. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-weight-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="confirm-weight-title" className="font-display text-lg font-semibold text-ink">
          Confirm the actual pounds
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          {orderRef(delivery._id)} · Update this if the customer's load doesn't match what was booked.
        </p>

        <label htmlFor="actual-weight" className="mt-4 block text-sm font-medium text-ink/80">Weight (lbs)</label>
        <input
          id="actual-weight"
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          inputMode="decimal"
          value={lbs}
          onChange={(e) => { setLbs(e.target.value); setError('') }}
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sky-400"
        />
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-2.5!">Cancel</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={busy} className="flex-1 py-2.5!">
            {busy ? 'Saving…' : 'Confirm weight'}
          </Button>
        </div>
      </div>
    </div>
  )
}
