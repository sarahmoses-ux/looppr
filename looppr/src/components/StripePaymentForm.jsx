import { useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Button from './Button'
import { getStripe } from '../lib/stripe'

const APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#7C73E6',
    colorText: '#1E1B4B',
    colorDanger: '#dc2626',
    fontFamily: 'Hanken Grotesk, system-ui, sans-serif',
    borderRadius: '10px',
  },
}

function Form({ amountLabel, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements || submitting) return

    setSubmitting(true)
    onError('')
    // redirect: 'if_required' keeps card payments (the only method type
    // enabled today) resolving inline — Stripe only navigates away if a
    // chosen payment method actually requires it.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Payment failed. Please try again.')
      setSubmitting(false)
      return
    }
    // 'processing' is normal (not a failure) for methods that settle after a
    // delay — e.g. a bank transfer/ACH debit can take a few business days.
    // Only genuinely terminal non-success statuses should read as an error.
    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onSuccess(paymentIntent.status)
      return
    }
    onError('Payment did not complete. Please try again.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <PaymentElement />
      <Button type="submit" variant="primary" className="w-full" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : `Pay ${amountLabel} now`}
      </Button>
    </form>
  )
}

// clientSecret comes from POST /pickups/:id/pay/intent (or the guest
// equivalent) — see services/pickupApi.js / guestPickupApi.js. onSuccess is
// called once Stripe confirms the charge client-side; the caller is still
// responsible for telling the backend (confirmPayment/confirmGuestPayment)
// so paymentStatus flips without waiting on the webhook.
export default function StripePaymentForm({ clientSecret, amountLabel, onSuccess, onError }) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance: APPEARANCE }}>
      <Form amountLabel={amountLabel} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
