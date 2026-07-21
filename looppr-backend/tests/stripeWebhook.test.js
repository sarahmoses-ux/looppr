import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

// tests/setup.js mocks stripe.webhooks.constructEvent to accept this literal
// in place of a real HMAC signature, and to JSON.parse the raw body as the
// event — see that file for why (we're testing our handler, not Stripe's).
function postWebhookEvent(event) {
  return request(app)
    .post('/api/stripe/webhook')
    .set('Content-Type', 'application/json')
    .set('Stripe-Signature', 'test-signature')
    .send(JSON.stringify(event))
}

async function createPickup() {
  const user = await createTestUser({ email: `stripe-webhook-${Date.now()}-${Math.random()}@example.com` })
  const token = tokenFor(user)
  const res = await request(app)
    .post('/api/pickups')
    .set('Authorization', `Bearer ${token}`)
    .send({
      address: { street: '1 Webhook Test Ln', apartment: 'Apt 1', city: 'Edmond', state: 'OK', zip: '73003' },
      preferredDate: '2027-06-01',
      window: 'morning',
      loadSize: 'medium',
      notes: '',
      deliveryWindow: 'evening',
    })
  await PickupRequest.updateOne({ _id: res.body.pickup._id }, { paymentStatus: 'pending' })
  return res.body.pickup
}

describe('POST /api/stripe/webhook', () => {
  it('rejects a request with an invalid signature', async () => {
    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', 'not-the-real-signature')
      .send(JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { metadata: {} } } }))
    expect(res.status).toBe(400)
  })

  it('marks the order paid on payment_intent.succeeded', async () => {
    const pickup = await createPickup()

    const res = await postWebhookEvent({
      type: 'payment_intent.succeeded',
      data: { object: { metadata: { pickupId: pickup._id } } },
    })
    expect(res.status).toBe(200)

    const updated = await PickupRequest.findById(pickup._id)
    expect(updated.paymentStatus).toBe('paid')
    expect(updated.paidAt).toBeTruthy()
  })

  it('marks the order failed on payment_intent.payment_failed', async () => {
    const pickup = await createPickup()

    const res = await postWebhookEvent({
      type: 'payment_intent.payment_failed',
      data: { object: { metadata: { pickupId: pickup._id } } },
    })
    expect(res.status).toBe(200)

    const updated = await PickupRequest.findById(pickup._id)
    expect(updated.paymentStatus).toBe('failed')
  })

  it('never overwrites an already-paid order', async () => {
    const pickup = await createPickup()
    await PickupRequest.updateOne({ _id: pickup._id }, { paymentStatus: 'paid', paidAt: new Date('2027-01-01') })

    await postWebhookEvent({
      type: 'payment_intent.payment_failed',
      data: { object: { metadata: { pickupId: pickup._id } } },
    })

    const updated = await PickupRequest.findById(pickup._id)
    expect(updated.paymentStatus).toBe('paid')
  })
})
