import { ApiError } from '../utils/ApiError.js'
import { stripe } from '../utils/stripeClient.js'

// Shared by pickupController.createPaymentIntent (account orders) and
// guestPickupController.createGuestPaymentIntent (guest orders) — creates
// the PaymentIntent the "Pay now" screen confirms against, or hands back the
// existing one if the customer re-opens that screen (avoids spawning a new
// PaymentIntent, and therefore a new card entry, on every reload/retry).
export async function createOrReusePaymentIntent(pickup) {
  if (pickup.paymentStatus === 'paid') throw new ApiError(409, 'This order has already been paid for.')
  if (pickup.paymentStatus !== 'pending' && pickup.paymentStatus !== 'failed') {
    throw new ApiError(409, 'This order is not ready for payment yet.')
  }
  if (!pickup.pricing?.amount) throw new ApiError(409, 'This order has no price set.')

  if (pickup.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(pickup.stripePaymentIntentId)
    if (existing.status !== 'canceled' && existing.status !== 'succeeded') {
      return existing
    }
  }

  const intent = await stripe.paymentIntents.create({
    // Stripe expects the smallest currency unit (cents for usd) — pricing.amount
    // is stored as dollars to match the receipt/display formatting elsewhere.
    amount: Math.round(pickup.pricing.amount * 100),
    currency: pickup.pricing.currency || 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { pickupId: pickup._id.toString() },
  })

  pickup.stripePaymentIntentId = intent.id
  await pickup.save()

  return intent
}
