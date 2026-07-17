import { useEffect, useState } from 'react'
import Input from '../Input'
import Select from '../Select'
import Button from '../Button'
import { createBusinessPickup } from '../../services/businessDashboardApi'

const EMPTY = {
  street: '',
  apartment: '',
  city: '',
  state: 'OK',
  zip: '',
  preferredDate: '',
  window: 'morning',
  deliveryWindow: 'afternoon',
  loadSize: 'medium',
  notes: '',
}

// Dashboard "Request a pickup" flow. Creates a real PickupRequest scoped to
// the signed-in business (source: 'business') via the businessApi instance.
// The parent remounts this via a changing `key` each time it opens, so state
// starts fresh from EMPTY with no reset effect needed.
export default function RequestPickupModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!form.street.trim()) next.street = 'Enter a pickup address.'
    if (!form.apartment.trim()) next.apartment = 'Enter a suite/unit number.'
    if (!form.city.trim()) next.city = 'Enter a city.'
    if (!/^\d{5}(-\d{4})?$/.test(form.zip.trim())) next.zip = 'Enter a valid ZIP code.'
    if (!form.preferredDate) next.preferredDate = 'Choose a pickup date.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      const { pickup } = await createBusinessPickup({
        address: {
          street: form.street.trim(),
          apartment: form.apartment.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
          zip: form.zip.trim(),
        },
        preferredDate: new Date(form.preferredDate).toISOString(),
        window: form.window,
        deliveryWindow: form.deliveryWindow,
        loadSize: form.loadSize,
        notes: form.notes.trim(),
      })
      onCreated?.(pickup)
      onClose()
    } catch (err) {
      setFormError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.message ||
          'Could not submit the request. Please try again.',
      )
      setStatus('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-pickup-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="request-pickup-title" className="font-display text-xl font-semibold text-ink">
              Request a pickup
            </h2>
            <p className="mt-1 text-sm text-ink/55">We'll collect, clean and return on schedule.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink/45 transition-colors hover:bg-linen hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <Input id="street" name="street" label="Pickup address" value={form.street} onChange={handleChange} error={errors.street} placeholder="123 Main St" />
          <div className="grid grid-cols-2 gap-3">
            <Input id="apartment" name="apartment" label="Suite / unit" value={form.apartment} onChange={handleChange} error={errors.apartment} placeholder="Suite 200" />
            <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} error={errors.city} placeholder="Tulsa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
            <Input id="zip" name="zip" label="ZIP" value={form.zip} onChange={handleChange} error={errors.zip} placeholder="74103" />
          </div>
          <Input id="preferredDate" name="preferredDate" type="date" label="Pickup date" value={form.preferredDate} onChange={handleChange} error={errors.preferredDate} />
          <div className="grid grid-cols-2 gap-3">
            <Select id="window" name="window" label="Pickup window" value={form.window} onChange={handleChange}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </Select>
            <Select id="deliveryWindow" name="deliveryWindow" label="Delivery window" value={form.deliveryWindow} onChange={handleChange}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </Select>
          </div>
          <div>
            <Select id="loadSize" name="loadSize" label="Load size" value={form.loadSize} onChange={handleChange}>
              <option value="small">Small (~10 lbs)</option>
              <option value="medium">Medium (~20 lbs)</option>
              <option value="large">Large (~35 lbs)</option>
            </Select>
            <p className="mt-2 text-xs font-medium text-ink/50">
              Minimum order is 10 lbs (Small) — the least we take per pickup.
            </p>
          </div>
          <Input id="notes" name="notes" label="Notes (optional)" value={form.notes} onChange={handleChange} placeholder="Gate code, linen specs, etc." />

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-3!">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={status === 'pending'} className="flex-1 py-3!">
              {status === 'pending' ? 'Submitting…' : 'Request pickup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
