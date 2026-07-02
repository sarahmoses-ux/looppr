import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import { createPickup } from '../services/pickupApi'

const WINDOWS = [
  { value: 'morning', label: 'Morning · 8am – 11am' },
  { value: 'afternoon', label: 'Afternoon · 12pm – 3pm' },
  { value: 'evening', label: 'Evening · 4pm – 7pm' },
]

const LOAD_SIZES = [
  { value: 'small', label: 'Small · 1–2 bags' },
  { value: 'medium', label: 'Medium · 3–4 bags' },
  { value: 'large', label: 'Large · 5+ bags' },
]

function minDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function Book() {
  const [form, setForm] = useState({
    street: '',
    city: '',
    zip: '',
    preferredDate: '',
    window: '',
    loadSize: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')
  const [confirmed, setConfirmed] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (form.street.trim().length < 3) next.street = 'Enter your street address.'
    if (form.city.trim().length < 2) next.city = 'Enter your city.'
    if (!/^\d{5}(-\d{4})?$/.test(form.zip)) next.zip = 'Enter a valid ZIP code.'
    if (!form.preferredDate) next.preferredDate = 'Choose a date.'
    if (!form.window) next.window = 'Choose a pickup window.'
    if (!form.loadSize) next.loadSize = 'Choose a load size.'
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
      const { pickup } = await createPickup({
        address: { street: form.street, city: form.city, state: 'OK', zip: form.zip },
        preferredDate: form.preferredDate,
        window: form.window,
        loadSize: form.loadSize,
        notes: form.notes,
      })
      setConfirmed(pickup)
    } catch (err) {
      const message =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.message ||
        'Something went wrong requesting your pickup. Please try again.'
      setFormError(message)
      setStatus('idle')
    }
  }

  if (confirmed) {
    const windowLabel = WINDOWS.find((w) => w.value === confirmed.window)?.label
    const dateLabel = new Date(confirmed.preferredDate).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <span className="text-3xl">🎉</span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">You're on the list!</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          We've saved your pickup request for <strong>{dateLabel}</strong>,{' '}
          {windowLabel?.toLowerCase()}. Looppr launches in your area on July
          23, 2026 — we'll email you to confirm your exact window as we get
          closer.
        </p>
        <Button to="/home" variant="primary" className="mt-8">
          Back to home
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Schedule a pickup
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
        Tell us when &amp; where
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Looppr only serves Oklahoma at launch — we'll confirm your exact
        window closer to July 23, 2026.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          id="street"
          name="street"
          label="Street address"
          value={form.street}
          onChange={handleChange}
          error={errors.street}
          placeholder="123 Main St"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="city"
            name="city"
            label="City"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Edmond"
          />
          <Input
            id="zip"
            name="zip"
            label="ZIP code"
            value={form.zip}
            onChange={handleChange}
            error={errors.zip}
            placeholder="73003"
          />
        </div>

        <Input
          id="preferredDate"
          name="preferredDate"
          type="date"
          label="Preferred date"
          min={minDate()}
          value={form.preferredDate}
          onChange={handleChange}
          error={errors.preferredDate}
        />

        <Select
          id="window"
          name="window"
          label="Pickup window"
          value={form.window}
          onChange={handleChange}
          error={errors.window}
        >
          <option value="" disabled>
            Choose a window
          </option>
          {WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </Select>

        <Select
          id="loadSize"
          name="loadSize"
          label="Load size"
          value={form.loadSize}
          onChange={handleChange}
          error={errors.loadSize}
        >
          <option value="" disabled>
            Choose a load size
          </option>
          {LOAD_SIZES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-ink/80">
            Notes <span className="text-ink/40">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder="Gate code, special instructions, delicate items…"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-periwinkle"
          />
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Submitting…' : 'Request pickup'}
        </Button>

        <p className="text-center text-xs text-ink/45">
          <Link to="/home" className="underline hover:text-ink">
            Back to home
          </Link>
        </p>
      </form>
    </div>
  )
}
