import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { createPickup, fetchMyPickups } from '../services/pickupApi'
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
    city: rebook?.city || '',
    zip: rebook?.zip || '',
    preferredDate: '',
    window: '',
    loadSize: rebook?.loadSize || '',
    notes: rebook?.notes || '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [cardErrors, setCardErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [confirmed, setConfirmed] = useState(null)

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
    setForm((f) => ({ ...f, street: address.street, city: address.city, zip: address.zip }))
    setErrors((e) => ({ ...e, street: undefined, city: undefined, zip: undefined }))
  }

  function handleUseNewAddress() {
    setSelectedAddressId('')
    setForm((f) => ({ ...f, street: '', city: '', zip: '' }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Editing the address fields by hand means they're no longer using the
    // saved address as-is, even if they started from one.
    if (selectedAddressId && ['street', 'city', 'zip'].includes(name)) {
      setSelectedAddressId('')
    }
  }

  function handleCardChange(e) {
    const { name, value } = e.target
    setCard((c) => ({ ...c, [name]: value }))
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

  function validateCard() {
    const next = {}
    if (!/^[\d\s]{13,19}$/.test(card.number)) next.number = 'Enter a valid card number.'
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) next.expiry = 'MM/YY'
    if (!/^\d{3,4}$/.test(card.cvc)) next.cvc = 'Invalid'
    if (card.name.trim().length < 2) next.name = 'Enter the name on your card.'
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
      saveAddress({ street: form.street, city: form.city, zip: form.zip }).catch(() => {})
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
    const next = validateCard()
    setCardErrors(next)
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

  if (step === 'checkout') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <SEO title="Review & pay" noindex />
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

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
          Step 2 of 2
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Review &amp; pay
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Your card is charged once your pickup is confirmed by a laundry pro.
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
              Pickup details
            </h2>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="text-sm font-semibold text-periwinkle-text hover:underline"
            >
              Edit
            </button>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/50">Address</dt>
              <dd className="text-right text-ink">
                {form.street}, {form.city}, OK {form.zip}
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

        <form onSubmit={handlePay} noValidate className="mt-6 space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
            Payment method
          </h2>

          <Input
            id="cardName"
            name="name"
            label="Name on card"
            value={card.name}
            onChange={handleCardChange}
            error={cardErrors.name}
            placeholder="Jane Doe"
            autoComplete="cc-name"
          />
          <Input
            id="cardNumber"
            name="number"
            label="Card number"
            value={card.number}
            onChange={handleCardChange}
            error={cardErrors.number}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            autoComplete="cc-number"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="cardExpiry"
              name="expiry"
              label="Expiry"
              value={card.expiry}
              onChange={handleCardChange}
              error={cardErrors.expiry}
              placeholder="MM/YY"
              autoComplete="cc-exp"
            />
            <Input
              id="cardCvc"
              name="cvc"
              label="CVC"
              value={card.cvc}
              onChange={handleCardChange}
              error={cardErrors.cvc}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>

          <p className="rounded-lg bg-periwinkle-soft px-4 py-3 text-xs font-medium text-periwinkle-text">
            Secure payment isn't wired up to Stripe yet — that's the next
            milestone. This screen is ready to go once it is.
          </p>

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
            {status === 'pending' ? 'Processing…' : `Pay ${formatMoney(total)} and schedule pickup`}
          </Button>
        </form>
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
        window closer to July 23, 2026.
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

        {!selectedAddressId && (
          <label className="flex items-center gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={saveNewAddress}
              onChange={(e) => setSaveNewAddress(e.target.checked)}
              className="h-4 w-4 rounded border-line text-periwinkle focus:ring-periwinkle"
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

        <Button type="submit" variant="primary" className="w-full">
          Continue to payment
        </Button>
      </form>
    </div>
  )
}
