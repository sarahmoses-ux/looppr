import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { __setIntentStatus } from '../utils/stripeClient.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

const guestPayload = {
  guest: { name: 'Guest Tester', email: 'guest-checkout-test@example.com', phone: '+14055559999' },
  address: { street: '100 Test Ave', apartment: 'Apt 1', city: 'Edmond', state: 'OK', zip: '73003' },
  preferredDate: '2027-01-15',
  window: 'morning',
  loadSize: 'large',
  notes: '',
  deliveryWindow: 'evening',
}

async function createGuestPickup(overrides = {}) {
  const res = await request(app)
    .post('/api/pickups/guest')
    .send({ ...guestPayload, ...overrides })
  return res.body
}

async function adminToken() {
  const admin = await createTestUser({ role: 'admin', email: 'guest-checkout-admin@example.com' })
  return tokenFor(admin)
}

describe('guest booking pricing', () => {
  it('auto-computes price from load size, with free delivery on the first order', async () => {
    const { pickup } = await createGuestPickup()
    // large = 35 lbs * $1.59/lb, no delivery fee (first order for this email)
    expect(pickup.pricing.amount).toBeCloseTo(55.65, 2)
    expect(pickup.paymentStatus).toBe('pending')
    expect(pickup.status).toBe('request_received')
  })

  it('creates a PaymentIntent immediately and returns its clientSecret', async () => {
    const { clientSecret } = await createGuestPickup({
      guest: { name: 'Immediate Pay', email: 'guest-checkout-immediate@example.com', phone: '+14055552222' },
    })
    expect(clientSecret).toMatch(/^pi_test_/)
  })

  it('charges delivery on a third order for the same email', async () => {
    await createGuestPickup()
    await createGuestPickup()
    const { pickup } = await createGuestPickup()
    // third order: no more free delivery
    expect(pickup.pricing.amount).toBeCloseTo(55.65 + 4.99, 2)
  })
})

describe('guest tracking', () => {
  it('returns the pickup for the correct token, 404s for a wrong one', async () => {
    const { pickup, guestAccessToken } = await createGuestPickup()

    const ok = await request(app).get(`/api/pickups/guest/${pickup.id}`).query({ token: guestAccessToken })
    expect(ok.status).toBe(200)

    const wrongToken = await request(app).get(`/api/pickups/guest/${pickup.id}`).query({ token: 'not-the-real-token' })
    expect(wrongToken.status).toBe(404)
  })
})

describe('guest payment (Stripe PaymentIntent)', () => {
  it('goes unpaid -> pending -> paid through the admin + guest flow, without moving the fulfillment status', async () => {
    const { pickup, guestAccessToken } = await createGuestPickup()
    const token = await adminToken()

    const sendReq = await request(app)
      .post(`/api/admin/pickups/${pickup.id}/send-payment-request`)
      .set('Authorization', `Bearer ${token}`)
    expect(sendReq.status).toBe(200)
    expect(sendReq.body.pickup.status).toBe('request_received')
    expect(sendReq.body.pickup.paymentStatus).toBe('pending')
    expect(sendReq.body.emailSent).toBe(true)

    const intentRes = await request(app)
      .post(`/api/pickups/guest/${pickup.id}/pay/intent`)
      .send({ token: guestAccessToken })
    expect(intentRes.status).toBe(200)
    const intentId = intentRes.body.clientSecret.split('_secret_')[0]
    __setIntentStatus(intentId, 'succeeded')

    const confirm = await request(app)
      .post(`/api/pickups/guest/${pickup.id}/pay/confirm`)
      .send({ token: guestAccessToken })
    expect(confirm.status).toBe(200)
    expect(confirm.body.pickup.paymentStatus).toBe('paid')
    expect(confirm.body.pickup.status).toBe('request_received')
  })

  it('rejects creating a PaymentIntent twice paid for the same order', async () => {
    const { pickup, guestAccessToken } = await createGuestPickup()
    const token = await adminToken()
    await request(app)
      .post(`/api/admin/pickups/${pickup.id}/send-payment-request`)
      .set('Authorization', `Bearer ${token}`)

    const intentRes = await request(app)
      .post(`/api/pickups/guest/${pickup.id}/pay/intent`)
      .send({ token: guestAccessToken })
    const intentId = intentRes.body.clientSecret.split('_secret_')[0]
    __setIntentStatus(intentId, 'succeeded')
    await request(app).post(`/api/pickups/guest/${pickup.id}/pay/confirm`).send({ token: guestAccessToken })

    const secondAttempt = await request(app)
      .post(`/api/pickups/guest/${pickup.id}/pay/intent`)
      .send({ token: guestAccessToken })

    expect(secondAttempt.status).toBe(409)
  })

  it('rejects paying with someone else\'s access token', async () => {
    const { pickup } = await createGuestPickup()
    const { guestAccessToken: otherToken } = await createGuestPickup({
      guest: { name: 'Someone Else', email: 'guest-checkout-other@example.com', phone: '+14055551111' },
    })

    const res = await request(app).post(`/api/pickups/guest/${pickup.id}/pay/intent`).send({ token: otherToken })
    expect(res.status).toBe(404)
  })
})
