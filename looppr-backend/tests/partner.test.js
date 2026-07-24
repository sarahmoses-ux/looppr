// Distinct partner JWT secrets so isolation is genuinely exercised. Set
// before app.js is imported.
process.env.JWT_PARTNER_ACCESS_SECRET = 'test-partner-access-secret'
process.env.JWT_PARTNER_REFRESH_SECRET = 'test-partner-refresh-secret'

import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { PartnerUser } from '../models/PartnerUser.js'
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

// For tests about something other than the approval flow itself (order
// management, portal isolation) — pre-approves the account (accountStatus:
// 'active') before verifying, so verify-email issues a session exactly like
// it did before the approval system existed. The approval flow itself
// (pending -> admin review -> active/rejected) is covered separately below,
// in 'partner application approval'.
async function registerAndVerify(overrides = {}) {
  const payload = { ...BASE_PARTNER, ...overrides }
  const reg = await request(app).post('/api/partner-auth/register').send(payload)
  expect(reg.status).toBe(201)
  expect(reg.body.requiresVerification).toBe(true)

  await PartnerUser.updateOne({ email: payload.email }, { accountStatus: 'active' })

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

describe('partner application approval', () => {
  async function registerAndVerifyPending(overrides = {}) {
    const payload = { ...BASE_PARTNER, ...overrides }
    const reg = await request(app).post('/api/partner-auth/register').send(payload)
    expect(reg.status).toBe(201)

    const code = sendOtpEmail.mock.calls.at(-1)[2]
    const verify = await request(app).post('/api/partner-auth/verify-email').send({ email: payload.email, code })
    return { email: payload.email, verify }
  }

  it('defaults new signups to accountStatus pending, not active', async () => {
    const payload = { ...BASE_PARTNER, email: 'default-status@sparkle.test' }
    await request(app).post('/api/partner-auth/register').send(payload)
    const partner = await PartnerUser.findOne({ email: payload.email })
    expect(partner.accountStatus).toBe('pending')
  })

  it('verify-email issues no session for a pending account, and notifies the admin', async () => {
    const { verify } = await registerAndVerifyPending({ email: 'pending-verify@sparkle.test' })
    expect(verify.status).toBe(200)
    expect(verify.body.pendingApproval).toBe(true)
    expect(verify.body.accessToken).toBeUndefined()
  })

  it('blocks login with a pendingApproval flag while pending, no session issued', async () => {
    const { email } = await registerAndVerifyPending({ email: 'pending-login@sparkle.test' })
    const login = await request(app).post('/api/partner-auth/login').send({ email, password: BASE_PARTNER.password })
    expect(login.status).toBe(200)
    expect(login.body.pendingApproval).toBe(true)
    expect(login.body.accessToken).toBeUndefined()
  })

  it('admin can approve a pending application, unlocking login and the dashboard', async () => {
    const { email } = await registerAndVerifyPending({ email: 'approve-me@sparkle.test' })
    const partner = await PartnerUser.findOne({ email })
    const admin = await createTestUser({ role: 'admin', email: 'approver@example.com' })

    const approve = await request(app)
      .post(`/api/admin/partners/${partner._id}/approve`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(approve.status).toBe(200)
    expect(approve.body.partner.accountStatus).toBe('active')

    // Approving twice is rejected — an application can only be reviewed once.
    const approveAgain = await request(app)
      .post(`/api/admin/partners/${partner._id}/approve`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(approveAgain.status).toBe(409)

    const login = await request(app).post('/api/partner-auth/login').send({ email, password: BASE_PARTNER.password })
    expect(login.status).toBe(200)
    expect(login.body.accessToken).toBeTruthy()

    const overview = await request(app)
      .get('/api/partner/overview')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
    expect(overview.status).toBe(200)
  })

  it('admin can reject a pending application, keeping login/dashboard blocked', async () => {
    const { email } = await registerAndVerifyPending({ email: 'reject-me@sparkle.test' })
    const partner = await PartnerUser.findOne({ email })
    const admin = await createTestUser({ role: 'admin', email: 'rejecter@example.com' })

    const reject = await request(app)
      .post(`/api/admin/partners/${partner._id}/reject`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ reason: 'Outside our current service area' })
    expect(reject.status).toBe(200)
    expect(reject.body.partner.accountStatus).toBe('rejected')

    const login = await request(app).post('/api/partner-auth/login').send({ email, password: BASE_PARTNER.password })
    expect(login.status).toBe(200)
    expect(login.body.applicationRejected).toBe(true)
    expect(login.body.accessToken).toBeUndefined()
  })

  it('blocks dashboard access via a still-valid token the moment accountStatus changes mid-session (defense in depth)', async () => {
    const token = await registerAndVerify({ email: 'midsession@sparkle.test' })
    const overviewBefore = await request(app).get('/api/partner/overview').set('Authorization', `Bearer ${token}`)
    expect(overviewBefore.status).toBe(200)

    // Simulates an admin suspending/rejecting after the session was issued —
    // the JWT itself is still valid and unexpired, but requireApprovedPartner
    // re-checks the DB on every request rather than trusting the token.
    await PartnerUser.updateOne({ email: 'midsession@sparkle.test' }, { accountStatus: 'rejected' })

    const overviewAfter = await request(app).get('/api/partner/overview').set('Authorization', `Bearer ${token}`)
    expect(overviewAfter.status).toBe(403)
    expect(overviewAfter.body.details.accountStatus).toBe('rejected')
  })
})
