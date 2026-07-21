import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import StripePaymentForm from '../components/StripePaymentForm'
import { confirmPayment, createPickup, fetchMyPickups } from '../services/pickupApi'
import { fetchAddresses, saveAddress } from '../services/addressApi'

const WINDOWS = [
  { value: 'morning', label: 'Morning · 8am – 11am' },
  { value: 'afternoon', label: 'Afternoon · 12pm – 3pm' },
  { value: 'evening', label: 'Evening · 4pm – 7pm' },
]

const LOAD_SIZES = [
  { value: 'small', label: 'Small · 1–2 bags', lbs: 10 },
  { value: 'medium', label: 'Medium · 3–4 bags', lbs: 20 },
  { value: 'large', label: 'Large · 5+ bags', lbs: 35 },
]

const PRICE_PER_LB = 1.59
const DELIVERY_FEE = 4.99
const FREE_DELIVERY_ORDER_LIMIT = 2

function minDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatMoney(n) {
  return `$${n.toFixed(2)}`
}

export default function Book() {
  const location = useLocation()
  // Pre-fill from Orders.jsx's "Book again" (see Button state={{ rebook }})
  // — a past order's address/load/notes, but never its date/window, since
  // those should always be a fresh choice.
  const rebook = location.state?.rebook

  const [step, setStep] = useState('details') // details | checkout
  const [priorOrderCount, setPriorOrderCount] = useState(null)
  const [form, setForm] = useState({
    street: rebook?.street || '',
    apartment: rebook?.apartment || '',
    city: rebook?.city || '',
    zip: rebook?.zip || '',
    preferredDate: '',
    window: '',
    loadSize: rebook?.loadSize || '',
    notes: rebook?.notes || '',
    deliveryWindow: '',
    deliverySameAsPickup: true,
    deliveryStreet: '',
    deliveryApartment: '',
    deliveryCity: '',
    deliveryZip: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [payError, setPayError] = useState('')
  const [status, setStatus] = useState('idle')
  const [confirmed, setConfirmed] = useState(null)
  const [bookedPickup, setBookedPickup] = useState(null)
  const [clientSecret, setClientSecret] = useState('')

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  useEffect(() => {
    fetchMyPickups()
      .then(({ pickups }) => setPriorOrderCount(pickups.filter((p) => p.status !== 'cancelled').length))
      .catch(() => setPriorOrderCount(0))
    fetchAddresses()
      .then(({ addresses }) => setSavedAddresses(addresses))
      .catch(() => setSavedAddresses([]))
  }, [])

  function handleSelectAddress(address) {
    setSelectedAddressId(address._id)
    setForm((f) => ({
      ...f,
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      zip: address.zip,
    }))
    setErrors((e) => ({ ...e, street: undefined, city: undefined, zip: undefined }))
  }

  function handleUseNewAddress() {
    setSelectedAddressId('')
    setForm((f) => ({ ...f, street: '', apartment: '', city: '', zip: '' }))
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    // Editing the address fields by hand means they're no longer using the
    // saved address as-is, even if they started from one.
    if (selectedAddressId && ['street', 'city', 'zip'].includes(name)) {
      setSelectedAddressId('')
    }
  }

  function validate() {
    const next = {}
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

  function handleContinue(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Fire-and-forget: don't block moving on to checkout if this fails.
    // Skipped if they picked an existing saved address, or if what they
    // typed already exactly matches one (e.g. re-using "Book again" on the
    // same order repeatedly shouldn't pile up duplicate saved addresses).
    const alreadySaved = savedAddresses.some(
      (a) => a.street === form.street && a.zip === form.zip,
    )
    if (saveNewAddress && !selectedAddressId && !alreadySaved) {
      saveAddress({ street: form.street, apartment: form.apartment, city: form.city, zip: form.zip }).catch(() => {})
    }

    setStep('checkout')
  }

  const selectedLoad = LOAD_SIZES.find((l) => l.value === form.loadSize)
  const subtotal = selectedLoad ? selectedLoad.lbs * PRICE_PER_LB : 0
  const freeDelivery = priorOrderCount !== null && priorOrderCount < FREE_DELIVERY_ORDER_LIMIT
  const deliveryFee = freeDelivery ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  async function handlePay(e) {
    e.preventDefault()
    setFormError('')

    setStatus('pending')
    try {
      const { pickup, clientSecret: secret } = await createPickup({
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
      setBookedPickup(pickup)
      if (secret) {
        setClientSecret(secret)
      } else {
        // Stripe hiccupped at booking time — the order still exists
        // (paymentStatus 'pending'), payable later from Orders.jsx.
        setConfirmed(pickup)
      }
    } catch (err) {
      const message =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.message ||
        'Something went wrong requesting your pickup. Please try again.'
      setFormError(message)
    } finally {
      setStatus('idle')
    }
  }

  async function handlePaymentSuccess(status) {
    try {
      const { pickup } = await confirmPayment(bookedPickup._id)
      setConfirmed(pickup)
    } catch {
      // Payment succeeded (or is processing) on Stripe's side even if this
      // confirm call failed — the webhook will still reconcile paymentStatus
      // server-side. Reflect what Stripe told us client-side in the meantime.
      setConfirmed({ ...bookedPickup, paymentStatus: status === 'succeeded' ? 'paid' : bookedPickup.paymentStatus })
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <SEO title="Pickup confirmed" noindex />
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-success-dark" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">You're on the list!</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          We've saved your pickup request for <strong>{dateLabel}</strong>,{' '}
          {windowLabel?.toLowerCase()}. Looppr launches in your area on
          August 1, 2026 — we'll email you to confirm your exact window as we
          get closer.
        </p>

        {confirmed.paymentStatus === 'paid' ? (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-4 py-2 text-sm font-semibold text-success-dark">
            Payment received — {formatMoney(confirmed.pricing.amount)} charged
          </p>
        ) : (
          <p className="mt-5 rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
            {confirmed.paymentStatus === 'pending'
              ? "Your payment is still processing — we'll email you once it clears, or check anytime from your Orders page."
              : "We couldn't confirm your payment yet — you can complete it anytime from your Orders page."}
          </p>
        )}

        <Button to="/home" variant="primary" className="mt-8">
          Back to home
        </Button>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <SEO title="Review & pay" noindex />
        {!clientSecret && (
          <button
            type="button"
            onClick={() => setStep('details')}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M12.5 15.5 7 10l5.5-5.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        )}

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
          Step 2 of 2
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Review &amp; pay
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Your card (or bank account) is charged now to confirm your pickup.
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
              Pickup details
            </h2>
            {!clientSecret && (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-sm font-semibold text-periwinkle-text hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/50">Pickup address</dt>
              <dd className="text-right text-ink">
                {form.street}
                {form.apartment && `, ${form.apartment}`}, {form.city}, OK {form.zip}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Date &amp; window</dt>
              <dd className="text-ink">
                {new Date(form.preferredDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {WINDOWS.find((w) => w.value === form.window)?.label}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Load size</dt>
              <dd className="text-ink">{selectedLoad?.label}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
              Delivery preferences
            </h2>
            {!clientSecret && (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-sm font-semibold text-periwinkle-text hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/50">Delivery window</dt>
              <dd className="text-ink">
                {WINDOWS.find((w) => w.value === form.deliveryWindow)?.label}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Delivery address</dt>
              <dd className="text-right text-ink">
                {form.deliverySameAsPickup ? (
                  'Same as pickup address'
                ) : (
                  <>
                    {form.deliveryStreet}
                    {form.deliveryApartment && `, ${form.deliveryApartment}`}, {form.deliveryCity} OK{' '}
                    {form.deliveryZip}
                  </>
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
            Your estimated delivery date will be confirmed once your order has been received.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
            Price breakdown
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">
                Wash &amp; fold · ~{selectedLoad?.lbs} lbs @ {formatMoney(PRICE_PER_LB)}/lb
              </dt>
              <dd className="text-ink">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-ink/70">
                Delivery fee
                {freeDelivery && (
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-dark">
                    Free — order {priorOrderCount + 1} of {FREE_DELIVERY_ORDER_LIMIT}
                  </span>
                )}
              </dt>
              <dd className={freeDelivery ? 'text-ink/40 line-through' : 'text-ink'}>
                {formatMoney(DELIVERY_FEE)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
            Payment
          </h2>

          {clientSecret ? (
            <>
              <p className="rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
                Your pickup is reserved — complete payment below to confirm it.
              </p>
              {payError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {payError}
                </p>
              )}
              <StripePaymentForm
                clientSecret={clientSecret}
                amountLabel={formatMoney(total)}
                onSuccess={handlePaymentSuccess}
                onError={setPayError}
              />
            </>
          ) : (
            <>
              <p className="rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
                You'll pay by card or bank transfer on the next step to confirm your pickup.
              </p>
              {formError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}
              <Button type="button" onClick={handlePay} variant="primary" className="w-full" disabled={status === 'pending'}>
                {status === 'pending' ? 'Processing…' : 'Continue to payment'}
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Schedule a pickup" noindex />
      <Link
        to="/home"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12.5 15.5 7 10l5.5-5.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </Link>

      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Step 1 of 2
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
        Tell us when &amp; where
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Looppr only serves Oklahoma at launch — we'll confirm your exact
        window closer to August 1, 2026.
      </p>

      <form onSubmit={handleContinue} noValidate className="mt-8 space-y-5">
        {savedAddresses.length > 0 && (
          <div>
            <p className="block text-base font-medium text-ink/80">Use a saved address</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {savedAddresses.map((address) => (
                <button
                  key={address._id}
                  type="button"
                  onClick={() => handleSelectAddress(address)}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    selectedAddressId === address._id
                      ? 'border-periwinkle bg-periwinkle-soft text-periwinkle-text'
                      : 'border-line bg-white text-ink/70 hover:border-periwinkle-muted'
                  }`}
                >
                  <span className="block font-semibold">{address.label}</span>
                  <span className="text-xs">{address.street}, {address.city}</span>
                </button>
              ))}
              {selectedAddressId && (
                <button
                  type="button"
                  onClick={handleUseNewAddress}
                  className="rounded-xl border border-dashed border-line px-3.5 py-2.5 text-sm text-ink/50 transition-colors hover:border-periwinkle-muted hover:text-ink"
                >
                  + Use a different address
                </button>
              )}
            </div>
          </div>
        )}

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

        {!selectedAddressId && (
          <label className="flex items-center gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={saveNewAddress}
              onChange={(e) => setSaveNewAddress(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-periwinkle focus:ring-periwinkle"
            />
            Save this address for next time
          </label>
        )}

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
        <p className="-mt-3 text-xs font-medium text-ink/50">
          Minimum order is 10 lbs (Small) — the least we take per pickup.
        </p>

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

        <Button type="submit" variant="primary" className="w-full">
          Continue to payment
        </Button>
      </form>
    </div>
  )
}
