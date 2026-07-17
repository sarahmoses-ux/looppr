import { useState } from 'react'
import Button from '../Button'

// Small modal to capture a rejection reason (required by the API). `order` is
// the order being rejected; `onConfirm(reason)` returns a promise.
export default function RejectReasonModal({ order, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!order) return null

  async function handleConfirm() {
    if (reason.trim().length < 2) {
      setError('Please give a short reason.')
      return
    }
    setBusy(true)
    try {
      await onConfirm(reason.trim())
    } catch {
      setError('Could not reject the order. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="reject-title" className="font-display text-lg font-semibold text-ink">Reject this order?</h2>
        <p className="mt-1 text-sm text-ink/55">Let us know why so we can route it elsewhere.</p>

        <label htmlFor="reject-reason" className="mt-4 block text-sm font-medium text-ink/80">Reason</label>
        <textarea
          id="reject-reason"
          rows={3}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError('') }}
          placeholder="e.g. At capacity for the day, outside service area…"
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sky-400"
        />
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-2.5!">Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={busy} className="flex-1 py-2.5!">
            {busy ? 'Rejecting…' : 'Reject order'}
          </Button>
        </div>
      </div>
    </div>
  )
}
