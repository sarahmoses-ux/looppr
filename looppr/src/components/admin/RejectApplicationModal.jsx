import { useState } from 'react'
import Button from '../Button'

// Modeled on components/partner/RejectReasonModal.jsx (same structure) but
// the reason is optional here — it's included in the applicant's rejection
// email if provided, not required to reject. `application` is the partner/
// driver being rejected; `onConfirm(reason)` returns a promise.
export default function RejectApplicationModal({ application, applicantLabel, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!application) return null

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm(reason.trim())
    } catch {
      setError('Could not reject this application. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-application-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="reject-application-title" className="font-display text-lg font-semibold text-ink">
          Reject {applicantLabel}?
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          They'll be notified by email. This can't be undone from here.
        </p>

        <label htmlFor="reject-application-reason" className="mt-4 block text-sm font-medium text-ink/80">
          Reason <span className="text-ink/40">(optional — included in their email if provided)</span>
        </label>
        <textarea
          id="reject-application-reason"
          rows={3}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError('') }}
          placeholder="e.g. Outside our current service area…"
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sky-400"
        />
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-2.5!">Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={busy} className="flex-1 py-2.5!">
            {busy ? 'Rejecting…' : 'Reject application'}
          </Button>
        </div>
      </div>
    </div>
  )
}
