// Distinct business JWT secrets so isolation is actually exercised — without
// these they'd fall back to the shared test secret and a client token would
// (wrongly) verify on business routes. Set before app.js is imported.
process.env.JWT_BUSINESS_ACCESS_SECRET = 'test-business-access-secret'
process.env.JWT_BUSINESS_REFRESH_SECRET = 'test-business-refresh-secret'

import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { sendOtpEmail } from '../services/emailService.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

const BASE_BUSINESS = {
  businessName: 'Riverside Hotel',
  businessType: 'hotel',
  contactPerson: 'Jordan Lee',
  email: 'ops@riverside.test',
  phone: '+19185550123',
  password: 'password123',
  address: '500 Riverside Dr',
  city: 'Tulsa',
  state: 'OK',
  weeklyVolume: '300 lbs/week',
}

// Runs the full register -> capture OTP -> verify flow and returns the
// business's access token, mirroring how a real signup completes.
async function registerAndVerify(overrides = {}) {
  const payload = { ...BASE_BUSINESS, ...overrides }

  const reg = await request(app).post('/api/business-auth/register').send(payload)
  expect(reg.status).toBe(201)
  expect(reg.body.requiresVerification).toBe(true)

  // The mocked sendOtpEmail captured (email, name, code) — read the code back.
  const lastCall = sendOtpEmail.mock.calls.at(-1)
  const code = lastCall[2]

  const verify = await request(app)
    .post('/api/business-auth/verify-email')
    .send({ email: payload.email, code })
  expect(verify.status).toBe(200)
  expect(verify.body.accessToken).toBeTruthy()
  return verify.body.accessToken
}

describe('business portal auth', () => {
  it('registers unverified, then verifies via the emailed code and issues a session', async () => {
    const token = await registerAndVerify()
    const me = await request(app)
      .get('/api/business-auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
    expect(me.body.business.email).toBe(BASE_BUSINESS.email)
    expect(me.body.business.isVerified).toBe(true)
    expect(me.body.business.role).toBe('business')
  })

  it('blocks login until the email is verified', async () => {
    await request(app).post('/api/business-auth/register').send({ ...BASE_BUSINESS, email: 'unverified@riverside.test' })
    const res = await request(app)
      .post('/api/business-auth/login')
      .send({ email: 'unverified@riverside.test', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.requiresVerification).toBe(true)
    expect(res.body.accessToken).toBeUndefined()
  })

  it('rejects duplicate business emails', async () => {
    await registerAndVerify({ email: 'dupe@riverside.test' })
    const again = await request(app).post('/api/business-auth/register').send({ ...BASE_BUSINESS, email: 'dupe@riverside.test' })
    expect(again.status).toBe(409)
  })

  it('logs a verified business in with the correct password', async () => {
    await registerAndVerify({ email: 'login@riverside.test' })
    const res = await request(app)
      .post('/api/business-auth/login')
      .send({ email: 'login@riverside.test', password: 'password123', rememberMe: true })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
  })

  it('rejects a wrong password', async () => {
    await registerAndVerify({ email: 'wrongpw@riverside.test' })
    const res = await request(app)
      .post('/api/business-auth/login')
      .send({ email: 'wrongpw@riverside.test', password: 'nope' })
    expect(res.status).toBe(401)
  })
})

describe('business portal dashboard data', () => {
  it('creates a pickup and reflects it in the pickup list and overview', async () => {
    const token = await registerAndVerify({ email: 'pickup@riverside.test' })

    const create = await request(app)
      .post('/api/business/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: { street: '500 Riverside Dr', apartment: 'Suite 200', city: 'Tulsa', state: 'OK', zip: '74103' },
        preferredDate: new Date(Date.now() + 86400000).toISOString(),
        window: 'morning',
        deliveryWindow: 'afternoon',
        loadSize: 'medium',
        notes: 'Front desk',
      })
    expect(create.status).toBe(201)
    expect(create.body.pickup.source).toBe('business')
    expect(create.body.pickup.pricing.amount).toBeGreaterThan(0)

    const list = await request(app).get('/api/business/pickups').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.pickups).toHaveLength(1)

    const overview = await request(app).get('/api/business/overview').set('Authorization', `Bearer ${token}`)
    expect(overview.status).toBe(200)
    expect(overview.body.overview.activeOrders).toBe(1)
    expect(overview.body.overview.ordersThisMonth).toBe(1)
  })
})

describe('business portal isolation from customer/admin auth', () => {
  it('rejects a business token on customer and admin routes', async () => {
    const businessToken = await registerAndVerify({ email: 'iso1@riverside.test' })

    const onCustomer = await request(app).get('/api/pickups/me').set('Authorization', `Bearer ${businessToken}`)
    const onAdmin = await request(app).get('/api/admin/pickups').set('Authorization', `Bearer ${businessToken}`)
    expect(onCustomer.status).toBe(401)
    expect(onAdmin.status).toBe(401)
  })

  it('rejects a customer/admin token on business routes', async () => {
    const client = await createTestUser({ role: 'client', email: 'iso-client@example.com' })
    const admin = await createTestUser({ role: 'admin', email: 'iso-admin@example.com' })

    const clientOnBusiness = await request(app).get('/api/business/pickups').set('Authorization', `Bearer ${tokenFor(client)}`)
    const adminOnBusiness = await request(app).get('/api/business/pickups').set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(clientOnBusiness.status).toBe(401)
    expect(adminOnBusiness.status).toBe(401)
  })

  it('rejects unauthenticated access to business routes', async () => {
    const res = await request(app).get('/api/business/overview')
    expect(res.status).toBe(401)
  })
})
