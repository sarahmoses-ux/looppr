// Distinct partner JWT secrets so isolation is genuinely exercised. Set
// before app.js is imported.
process.env.JWT_PARTNER_ACCESS_SECRET = 'test-partner-access-secret'
process.env.JWT_PARTNER_REFRESH_SECRET = 'test-partner-refresh-secret'

import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { sendOtpEmail } from '../services/emailService.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

const BASE_PARTNER = {
  businessName: 'Sparkle Wash',
  ownerName: 'Alex Rivera',
  email: 'shop@sparkle.test',
  phone: '+19185550123',
  password: 'password123',
  address: '120 Main St',
  city: 'Tulsa',
  state: 'OK',
  servicesOffered: ['wash_fold', 'dry_cleaning'],
  agreedToTerms: 'true',
}

async function registerAndVerify(overrides = {}) {
  const payload = { ...BASE_PARTNER, ...overrides }
  const reg = await request(app).post('/api/partner-auth/register').send(payload)
  expect(reg.status).toBe(201)
  expect(reg.body.requiresVerification).toBe(true)

  const code = sendOtpEmail.mock.calls.at(-1)[2]
  const verify = await request(app).post('/api/partner-auth/verify-email').send({ email: payload.email, code })
  expect(verify.status).toBe(200)
  expect(verify.body.accessToken).toBeTruthy()
  return verify.body.accessToken
}

async function createClaimableOrder() {
  return PickupRequest.create({
    address: { street: '9 Oak Ave', apartment: 'Apt 2', city: 'Tulsa', state: 'OK', zip: '74103' },
    preferredDate: new Date(Date.now() + 86400000),
    window: 'morning',
    deliveryWindow: 'afternoon',
    loadSize: 'medium',
    pricing: { amount: 31.8, currency: 'usd' },
  })
}

describe('partner portal auth', () => {
  it('registers unverified, verifies, and issues a partner session', async () => {
    const token = await registerAndVerify()
    const me = await request(app).get('/api/partner-auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
    expect(me.body.partner.role).toBe('partner')
    expect(me.body.partner.isVerified).toBe(true)
  })

  it('requires agreeing to terms', async () => {
    const res = await request(app).post('/api/partner-auth/register').send({ ...BASE_PARTNER, email: 'noterms@sparkle.test', agreedToTerms: 'false' })
    expect(res.status).toBe(422)
  })

  it('blocks login until verified', async () => {
    await request(app).post('/api/partner-auth/register').send({ ...BASE_PARTNER, email: 'unverified@sparkle.test' })
    const res = await request(app).post('/api/partner-auth/login').send({ email: 'unverified@sparkle.test', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.requiresVerification).toBe(true)
    expect(res.body.accessToken).toBeUndefined()
  })

  it('rejects duplicate emails and wrong passwords', async () => {
    await registerAndVerify({ email: 'dupe@sparkle.test' })
    const dup = await request(app).post('/api/partner-auth/register').send({ ...BASE_PARTNER, email: 'dupe@sparkle.test' })
    expect(dup.status).toBe(409)
    const bad = await request(app).post('/api/partner-auth/login').send({ email: 'dupe@sparkle.test', password: 'nope' })
    expect(bad.status).toBe(401)
  })
})

describe('partner order management', () => {
  it('lists, accepts, and advances an order through delivery', async () => {
    const token = await registerAndVerify({ email: 'orders@sparkle.test' })
    const order = await createClaimableOrder()

    const incoming = await request(app).get('/api/partner/orders/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming.status).toBe(200)
    expect(incoming.body.orders).toHaveLength(1)

    const accept = await request(app).post(`/api/partner/orders/${order._id}/accept`).set('Authorization', `Bearer ${token}`)
    expect(accept.status).toBe(200)
    expect(accept.body.order.partnerStage).toBe('accepted')

    // No longer in the incoming pool once claimed.
    const incoming2 = await request(app).get('/api/partner/orders/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming2.body.orders).toHaveLength(0)

    const advance = await request(app).patch(`/api/partner/orders/${order._id}/stage`).set('Authorization', `Bearer ${token}`).send({ action: 'laundry_in_progress' })
    expect(advance.status).toBe(200)
    expect(advance.body.order.partnerStage).toBe('laundry_in_progress')
    expect(advance.body.order.status).toBe('laundry_in_progress')

    const overview = await request(app).get('/api/partner/overview').set('Authorization', `Bearer ${token}`)
    expect(overview.body.overview.activeOrders).toBe(1)
  })

  it('rejects an order with a reason and drops it from the incoming list', async () => {
    const token = await registerAndVerify({ email: 'reject@sparkle.test' })
    const order = await createClaimableOrder()

    const reject = await request(app).post(`/api/partner/orders/${order._id}/reject`).set('Authorization', `Bearer ${token}`).send({ reason: 'At capacity today' })
    expect(reject.status).toBe(200)

    const incoming = await request(app).get('/api/partner/orders/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming.body.orders).toHaveLength(0)
  })

  it('requires a reason to reject', async () => {
    const token = await registerAndVerify({ email: 'reject2@sparkle.test' })
    const order = await createClaimableOrder()
    const res = await request(app).post(`/api/partner/orders/${order._id}/reject`).set('Authorization', `Bearer ${token}`).send({})
    expect(res.status).toBe(422)
  })
})

describe('partner portal isolation', () => {
  it('rejects a partner token on customer/admin/business routes', async () => {
    const token = await registerAndVerify({ email: 'iso@sparkle.test' })
    const onCustomer = await request(app).get('/api/pickups/me').set('Authorization', `Bearer ${token}`)
    const onAdmin = await request(app).get('/api/admin/pickups').set('Authorization', `Bearer ${token}`)
    const onBusiness = await request(app).get('/api/business/overview').set('Authorization', `Bearer ${token}`)
    expect(onCustomer.status).toBe(401)
    expect(onAdmin.status).toBe(401)
    expect(onBusiness.status).toBe(401)
  })

  it('rejects a customer/admin token on partner routes', async () => {
    const client = await createTestUser({ role: 'client', email: 'iso-client-p@example.com' })
    const admin = await createTestUser({ role: 'admin', email: 'iso-admin-p@example.com' })
    const clientRes = await request(app).get('/api/partner/orders/incoming').set('Authorization', `Bearer ${tokenFor(client)}`)
    const adminRes = await request(app).get('/api/partner/orders/incoming').set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(clientRes.status).toBe(401)
    expect(adminRes.status).toBe(401)
  })

  it('rejects unauthenticated access to partner routes', async () => {
    const res = await request(app).get('/api/partner/overview')
    expect(res.status).toBe(401)
  })
})
