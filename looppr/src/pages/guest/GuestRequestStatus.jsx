import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button'
import SEO from '../../components/SEO'
import OrderTimeline from '../../components/OrderTimeline'
import StripePaymentForm from '../../components/StripePaymentForm'
import { confirmGuestPayment, createGuestPaymentIntent, fetchGuestPickup } from '../../services/guestPickupApi'

function formatMoney(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)
}

export default function GuestRequestStatus() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const location = useLocation()

  const [pickup, setPickup] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [payStatus, setPayStatus] = useState('idle')
  const [payError, setPayError] = useState('')
  const [payInfo, setPayInfo] = useState('')
  // Populated immediately when arriving fresh from GuestBook.jsx (which now
  // creates the PaymentIntent at booking time) so the Payment Element shows
  // up without an extra "Pay now" click. Empty on a direct/bookmarked visit
  // — that falls back to the button below, which creates one on demand.
  const [clientSecret, setClientSecret] = useState(location.state?.clientSecret || '')

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    fetchGuestPickup(id, token)
      .then(({ pickup: fetched }) => {
        if (!cancelled) setPickup(fetched)
      })
      .catch(() => {
        if (!cancelled) setLoadError("We couldn't find that request — check the link and try again.")
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  async function handleStartPay() {
    setPayStatus('pending')
    setPayError('')
    try {
      const { clientSecret: secret } = await createGuestPaymentIntent(id, token)
      setClientSecret(secret)
    } catch (err) {
      setPayError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setPayStatus('idle')
    }
  }

  async function handlePaymentSuccess(status) {
    try {
      const { pickup: updated } = await confirmGuestPayment(id, token)
      setClientSecret('')
      setPickup(updated)
      setPayInfo(
        updated.paymentStatus === 'paid'
          ? 'Payment successful — thanks!'
          : "Payment is processing — you'll see this marked Paid once it clears.",
      )
    } catch {
      setPayInfo('')
      setPayError(
        status === 'succeeded'
          ? "Payment went through, but we couldn't refresh this page — refresh to see your receipt."
          : 'Something went wrong confirming your payment. Refresh the page to check its status.',
      )
    }
  }

  if (!token || loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <SEO title="Request not found" noindex />
        <p className="text-sm text-ink/60">
          {!token ? 'This link is missing its access token.' : loadError}
        </p>
        <Button to="/guest/book" variant="ghost" className="mt-6">
          Start a new request
        </Button>
      </div>
    )
  }

  if (!pickup) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-3xl bg-linen-soft" />
      </div>
    )
  }

  const dateLabel = new Date(pickup.preferredDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Your guest request" noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Guest request
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
        {pickup.address.street}, {pickup.address.city}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {dateLabel} · {pickup.window} · {pickup.loadSize} load
      </p>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/45">Price</p>
        <p className="mt-2 font-display text-3xl font-semibold text-ink">
          {formatMoney(pickup.pricing.amount, pickup.pricing.currency)}
        </p>

        {pickup.paymentStatus === 'paid' && (
          <p className="mt-3 inline-flex rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-dark">
            Paid
          </p>
        )}

        {payInfo && (
          <p
            role="status"
            className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
              pickup.paymentStatus === 'paid' ? 'bg-success-soft text-success-dark' : 'bg-periwinkle-soft text-periwinkle-text'
            }`}
          >
            {payInfo}
          </p>
        )}

        {(pickup.paymentStatus === 'pending' || pickup.paymentStatus === 'failed') && (
          <div className="mt-5">
            {pickup.paymentStatus === 'failed' && !clientSecret && (
              <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                Your last payment attempt failed — try again.
              </p>
            )}
            {payError && (
              <p role="alert" className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {payError}
              </p>
            )}
            {clientSecret ? (
              <StripePaymentForm
                clientSecret={clientSecret}
                amountLabel={formatMoney(pickup.pricing.amount, pickup.pricing.currency)}
                onSuccess={handlePaymentSuccess}
                onError={setPayError}
              />
            ) : (
              <Button onClick={handleStartPay} variant="primary" className="w-full" disabled={payStatus === 'pending'}>
                {payStatus === 'pending'
                  ? 'Loading…'
                  : `Pay ${formatMoney(pickup.pricing.amount, pickup.pricing.currency)} now`}
              </Button>
            )}
          </div>
        )}

        {pickup.paymentStatus === 'unpaid' && (
          <p className="mt-3 text-sm text-ink/55">
            We're reviewing your request — you'll be notified by email when it's time to pay.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-ink/45">Order status</p>
        <OrderTimeline status={pickup.status} />
      </div>

      <p className="mt-6 text-center text-xs text-ink/45">
        Bookmark this page's link (or check your email) to come back and check your status anytime.{' '}
        <Link to="/guest/book" className="underline hover:text-ink">
          Start another request
        </Link>
      </p>
    </div>
  )
}
