import { PickupRequest } from '../models/PickupRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { stripe } from '../utils/stripeClient.js'

// Source of truth for paymentStatus moving to 'paid'/'failed' — the
// frontend's post-confirm call (pickupController.confirmPayment /
// guestPickupController.confirmGuestPayment) also nudges the status for
// snappier UI feedback, but this is what's authoritative even if the
// customer closes the tab before that call fires.
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const intent = event.data.object
  const pickupId = intent.metadata?.pickupId

  if (pickupId && event.type === 'payment_intent.succeeded') {
    await PickupRequest.findOneAndUpdate(
      { _id: pickupId, paymentStatus: { $ne: 'paid' } },
      { paymentStatus: 'paid', paidAt: new Date() },
    )
  } else if (pickupId && event.type === 'payment_intent.payment_failed') {
    await PickupRequest.findOneAndUpdate(
      { _id: pickupId, paymentStatus: { $ne: 'paid' } },
      { paymentStatus: 'failed' },
    )
  }

  res.json({ received: true })
})
