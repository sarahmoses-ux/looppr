import bcrypt from 'bcryptjs'
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { DriverUser } from '../models/DriverUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { __setIntentStatus } from '../utils/stripeClient.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

// A freshly-created order's paymentStatus is already 'pending' (charged
// immediately at booking, see createPickup) with a PaymentIntent already
// attached — kept as a no-op-ish helper so these tests still read clearly
// even though it's no longer strictly required.
async function markPending(pickupId) {
  await PickupRequest.updateOne({ _id: pickupId }, { paymentStatus: 'pending' })
}

const app = createApp()

async function clientToken() {
  const user = await createTestUser({ email: `pickups-test-${Date.now()}-${Math.random()}@example.com` })
  return { user, token: tokenFor(user) }
}

function pickupPayload(overrides = {}) {
  return {
    address: { street: '1 Pickup Test Ln', apartment: 'Apt 1', city: 'Edmond', state: 'OK', zip: '73003' },
    preferredDate: '2027-06-01',
    window: 'morning',
    loadSize: 'medium',
    notes: '',
    deliveryWindow: 'evening',
    ...overrides,
  }
}

describe('authenticated pickup creation & pricing', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/pickups').send(pickupPayload())
    expect(res.status).toBe(401)
  })

  it('computes an itemized price breakdown at creation (subtotal + deliveryFee + amount)', async () => {
    const { token } = await clientToken()
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload({ loadSize: 'large' }))

    expect(res.status).toBe(201)
    expect(res.body.pickup.pricing).toMatchObject({
      amount: 55.65,
      subtotal: 55.65,
      deliveryFee: 0,
      currency: 'usd',
    })
  })

  it('charges delivery fee starting on the 3rd order (free-delivery limit is 2)', async () => {
    const { token } = await clientToken()
    await request(app).post('/api/pickups').set('Authorization', `Bearer ${token}`).send(pickupPayload())
    await request(app).post('/api/pickups').set('Authorization', `Bearer ${token}`).send(pickupPayload())
    const third = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())

    expect(third.body.pickup.pricing.deliveryFee).toBe(4.99)
  })

  it('creates a PaymentIntent immediately and returns its clientSecret, with paymentStatus already pending', async () => {
    const { token } = await clientToken()
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())

    expect(res.status).toBe(201)
    expect(res.body.clientSecret).toMatch(/^pi_test_/)
    expect(res.body.pickup.paymentStatus).toBe('pending')
  })

  it('rejects an invalid load size', async () => {
    const { token } = await clientToken()
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload({ loadSize: 'extra-large' }))
    expect(res.status).toBe(422)
  })
})

describe('listMyPickups', () => {
  it('only returns the requesting user\'s own pickups', async () => {
    const a = await clientToken()
    const b = await clientToken()
    await request(app).post('/api/pickups').set('Authorization', `Bearer ${a.token}`).send(pickupPayload())
    await request(app).post('/api/pickups').set('Authorization', `Bearer ${b.token}`).send(pickupPayload())

    const res = await request(app).get('/api/pickups/me').set('Authorization', `Bearer ${a.token}`)
    expect(res.status).toBe(200)
    expect(res.body.pickups).toHaveLength(1)
    expect(res.body.pickups[0].clientId).toBe(a.user._id.toString())
  })

  it('shows the assigned driver\'s public profile once claimed, without leaking private fields', async () => {
    const { token } = await clientToken()
    const created = await request(app).post('/api/pickups').set('Authorization', `Bearer ${token}`).send(pickupPayload())

    const passwordHash = await bcrypt.hash('password123', 12)
    const driver = await DriverUser.create({
      name: 'Jamie Chen',
      email: 'jamie-pub@driver.test',
      phone: '+19185550199', // private — must not appear in the customer-facing response
      passwordHash,
      address: '200 Riverside Dr', // private
      city: 'Tulsa',
      licenseNumber: 'OK-DL-99999', // private
      vehiclePlate: 'LPR-0001', // private
      vehicleType: 'car',
      vehicleName: 'Toyota Corolla',
      profilePhoto: 'data:image/png;base64,abc123',
      averageRating: 4.8,
      isVerified: true,
    })
    await PickupRequest.updateOne({ _id: created.body.pickup._id }, { driverUserId: driver._id, driverStage: 'assigned' })

    const res = await request(app).get('/api/pickups/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const pickup = res.body.pickups.find((p) => p._id === created.body.pickup._id)
    expect(pickup.driverUserId).toMatchObject({
      name: 'Jamie Chen',
      profilePhoto: 'data:image/png;base64,abc123',
      vehicleType: 'car',
      vehicleName: 'Toyota Corolla',
      averageRating: 4.8,
    })
    // Public-safe populate — private driver fields must never reach the customer.
    expect(pickup.driverUserId.email).toBeUndefined()
    expect(pickup.driverUserId.phone).toBeUndefined()
    expect(pickup.driverUserId.address).toBeUndefined()
    expect(pickup.driverUserId.licenseNumber).toBeUndefined()
    expect(pickup.driverUserId.vehiclePlate).toBeUndefined()
  })
})

describe('createPaymentIntent + confirmPayment', () => {
  it('creates a PaymentIntent, then marks the order paid once it succeeds', async () => {
    const { token } = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())
    await markPending(created.body.pickup._id)

    const intentRes = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay/intent`)
      .set('Authorization', `Bearer ${token}`)
    expect(intentRes.status).toBe(200)
    expect(intentRes.body.clientSecret).toMatch(/^pi_test_/)

    const intentId = intentRes.body.clientSecret.split('_secret_')[0]
    __setIntentStatus(intentId, 'succeeded')

    const confirmRes = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay/confirm`)
      .set('Authorization', `Bearer ${token}`)
    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.pickup.paymentStatus).toBe('paid')
    expect(confirmRes.body.pickup.paidAt).toBeTruthy()
  })

  it('does not mark the order paid if the PaymentIntent has not succeeded yet', async () => {
    const { token } = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())
    await markPending(created.body.pickup._id)

    await request(app).post(`/api/pickups/${created.body.pickup._id}/pay/intent`).set('Authorization', `Bearer ${token}`)
    const confirmRes = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay/confirm`)
      .set('Authorization', `Bearer ${token}`)

    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.pickup.paymentStatus).toBe('pending')
  })

  it('rejects creating a PaymentIntent for an order that has already been paid', async () => {
    const { token } = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())
    await PickupRequest.updateOne({ _id: created.body.pickup._id }, { paymentStatus: 'paid' })

    const res = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay/intent`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(409)
  })

  it('rejects creating a PaymentIntent for another customer\'s order', async () => {
    const a = await clientToken()
    const b = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${a.token}`)
      .send(pickupPayload())
    await markPending(created.body.pickup._id)

    const res = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay/intent`)
      .set('Authorization', `Bearer ${b.token}`)
    expect(res.status).toBe(404)
  })
})

// Exercises the full pay flow end to end for the getMyStats tests below,
// which only care that a paid order's amount lands in totalSpent.
async function payOrder(app, token, pickupId) {
  await markPending(pickupId)
  const intentRes = await request(app)
    .post(`/api/pickups/${pickupId}/pay/intent`)
    .set('Authorization', `Bearer ${token}`)
  const intentId = intentRes.body.clientSecret.split('_secret_')[0]
  __setIntentStatus(intentId, 'succeeded')
  return request(app).post(`/api/pickups/${pickupId}/pay/confirm`).set('Authorization', `Bearer ${token}`)
}

describe('getMyStats', () => {
  it('starts at zero for a fresh account', async () => {
    const { token } = await clientToken()
    const res = await request(app).get('/api/pickups/me/stats').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.stats).toEqual({ totalOrders: 0, totalSpent: 0 })
  })

  it('counts all orders but only sums paid amounts', async () => {
    const { token } = await clientToken()
    const unpaid = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload({ loadSize: 'small' }))
    const paid = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload({ loadSize: 'medium' }))
    await payOrder(app, token, paid.body.pickup._id)

    const res = await request(app).get('/api/pickups/me/stats').set('Authorization', `Bearer ${token}`)
    expect(res.body.stats.totalOrders).toBe(2)
    expect(res.body.stats.totalSpent).toBe(paid.body.pickup.pricing.amount)
    expect(unpaid.status).toBe(201)
  })

  it('never mixes stats across customers', async () => {
    const a = await clientToken()
    const b = await clientToken()
    const order = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${a.token}`)
      .send(pickupPayload())
    await payOrder(app, a.token, order.body.pickup._id)

    const res = await request(app).get('/api/pickups/me/stats').set('Authorization', `Bearer ${b.token}`)
    expect(res.body.stats).toEqual({ totalOrders: 0, totalSpent: 0 })
  })
})
