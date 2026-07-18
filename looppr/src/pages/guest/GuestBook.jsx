import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Button from '../../components/Button'
import SEO from '../../components/SEO'
import { PUBLIC_PAGES } from '../../seo/publicPages'
import { createGuestPickup } from '../../services/guestPickupApi'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/guest/book')

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

// Public — no account required. Creates a "guest request" that an admin
// reviews and prices; the guest completes checkout later at
// /guest/request/:id (see GuestRequestStatus.jsx), which is where an
// account actually gets created.
export default function GuestBook() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    zip: '',
    preferredDate: '',
    window: '',
    loadSize: '',
    notes: '',
    deliveryWindow: '',
    deliverySameAsPickup: true,
    deliveryStreet: '',
    deliveryApartment: '',
    deliveryCity: '',
    deliveryZip: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (form.street.trim().length < 3) next.street = 'Enter your street address.'
    if (!form.apartment.trim()) next.apartment = 'Enter your apartment/unit number.'
    if (form.city.trim().length < 2) next.city = 'Enter your city.'
    if (!/^\d{5}(-\d{4})?$/.test(form.zip)) next.zip = 'Enter a valid ZIP code.'
    if (!form.preferredDate) next.preferredDate = 'Choose a date.'
    if (!form.window) next.window = 'Choose a pickup window.'
    if (!form.loadSize) next.loadSize = 'Choose a load size.'
    if (!form.deliveryWindow) next.deliveryWindow = 'Choose a delivery window.'
    if (!form.deliverySameAsPickup) {
      if (form.deliveryStreet.trim().length < 3) next.deliveryStreet = 'Enter the delivery street address.'
      if (!form.deliveryApartment.trim()) next.deliveryApartment = 'Enter the delivery apartment/unit number.'
      if (form.deliveryCity.trim().length < 2) next.deliveryCity = 'Enter the delivery city.'
      if (!/^\d{5}(-\d{4})?$/.test(form.deliveryZip)) next.deliveryZip = 'Enter a valid delivery ZIP code.'
    }
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
      const { pickup, guestAccessToken } = await createGuestPickup({
        guest: { name: form.name, email: form.email, phone: form.phone },
        address: { street: form.street, apartment: form.apartment, city: form.city, state: 'OK', zip: form.zip },
        preferredDate: form.preferredDate,
        window: form.window,
        loadSize: form.loadSize,
        notes: form.notes,
        deliveryWindow: form.deliveryWindow,
        deliveryAddress: form.deliverySameAsPickup
          ? undefined
          : {
              street: form.deliveryStreet,
              apartment: form.deliveryApartment,
              city: form.deliveryCity,
              state: 'OK',
              zip: form.deliveryZip,
            },
      })
      navigate(`/guest/request/${pickup.id}?token=${guestAccessToken}`)
    } catch (err) {
      const message =
        err.response?.status === 429
          ? 'Too many requests. Please wait a bit and try again.'
          : err.response?.data?.details?.[0]?.message ||
            err.response?.data?.message ||
            'Something went wrong requesting your pickup. Please try again.'
      setFormError(message)
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} keywords={PAGE_META.keywords} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        No account needed
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
        Request a pickup as a guest
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Tell us who you are and what you need washed — no account required.
        You'll see your price right away, and we'll email you when it's time
        to pay.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          id="name"
          name="name"
          label="Full name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Jane Doe"
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          id="phone"
          name="phone"
          label="Phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="(405) 555-0100"
        />

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <Input
            id="street"
            name="street"
            label="Street address"
            value={form.street}
            onChange={handleChange}
            error={errors.street}
            placeholder="123 Main St"
          />
          <Input
            id="apartment"
            name="apartment"
            label="Apt / Unit"
            value={form.apartment}
            onChange={handleChange}
            error={errors.apartment}
            placeholder="Apt 4B"
          />
        </div>
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
          <label htmlFor="notes" className="block text-base font-medium text-ink/80">
            Notes <span className="text-ink/40">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder="Gate code, special instructions, delicate items…"
            className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-periwinkle"
          />
        </div>

        <div className="rounded-2xl border border-line bg-linen-soft p-5">
          <h2 className="font-display text-base font-semibold text-ink">Delivery preferences</h2>

          <div className="mt-4">
            <Select
              id="deliveryWindow"
              name="deliveryWindow"
              label="Delivery window"
              value={form.deliveryWindow}
              onChange={handleChange}
              error={errors.deliveryWindow}
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
          </div>

          <label className="mt-4 flex items-center gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              name="deliverySameAsPickup"
              checked={!form.deliverySameAsPickup}
              onChange={(e) =>
                setForm((f) => ({ ...f, deliverySameAsPickup: !e.target.checked }))
              }
              className="h-4 w-4 rounded border-line accent-periwinkle focus:ring-periwinkle"
            />
            Deliver to a different address
          </label>

          {!form.deliverySameAsPickup && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-[2fr_1fr] gap-4">
                <Input
                  id="deliveryStreet"
                  name="deliveryStreet"
                  label="Delivery street address"
                  value={form.deliveryStreet}
                  onChange={handleChange}
                  error={errors.deliveryStreet}
                  placeholder="123 Main St"
                />
                <Input
                  id="deliveryApartment"
                  name="deliveryApartment"
                  label="Apt / Unit"
                  value={form.deliveryApartment}
                  onChange={handleChange}
                  error={errors.deliveryApartment}
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="deliveryCity"
                  name="deliveryCity"
                  label="Delivery city"
                  value={form.deliveryCity}
                  onChange={handleChange}
                  error={errors.deliveryCity}
                  placeholder="Edmond"
                />
                <Input
                  id="deliveryZip"
                  name="deliveryZip"
                  label="Delivery ZIP code"
                  value={form.deliveryZip}
                  onChange={handleChange}
                  error={errors.deliveryZip}
                  placeholder="73003"
                />
              </div>
            </div>
          )}

          <p className="mt-4 rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
            Your estimated delivery date will be confirmed once your order has been received.
          </p>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Submitting…' : 'Request a pickup'}
        </Button>
      </form>
    </div>
  )
}
