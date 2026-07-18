// Distinct driver JWT secrets so isolation is genuinely exercised. Set
// before app.js is imported.
process.env.JWT_DRIVER_ACCESS_SECRET = 'test-driver-access-secret'
process.env.JWT_DRIVER_REFRESH_SECRET = 'test-driver-refresh-secret'

import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { sendOtpEmail } from '../services/emailService.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

const BASE_DRIVER = {
  name: 'Jamie Chen',
  email: 'jamie@driver.test',
  phone: '+19185550123',
  password: 'password123',
  address: '120 Main St',
  city: 'Tulsa',
  state: 'OK',
  vehicleType: 'car',
  vehicleName: 'Toyota Corolla',
  agreedToTerms: 'true',
}

async function registerAndVerify(overrides = {}) {
  const payload = { ...BASE_DRIVER, ...overrides }
  const reg = await request(app).post('/api/driver-auth/register').send(payload)
  expect(reg.status).toBe(201)
  expect(reg.body.requiresVerification).toBe(true)

  const code = sendOtpEmail.mock.calls.at(-1)[2]
  const verify = await request(app).post('/api/driver-auth/verify-email').send({ email: payload.email, code })
  expect(verify.status).toBe(200)
  expect(verify.body.accessToken).toBeTruthy()
  return verify.body.accessToken
}

async function createClaimableDelivery() {
  return PickupRequest.create({
    address: { street: '9 Oak Ave', apartment: 'Apt 2', city: 'Tulsa', state: 'OK', zip: '74103' },
    preferredDate: new Date(Date.now() + 86400000),
    window: 'morning',
    deliveryWindow: 'afternoon',
    loadSize: 'medium',
    pricing: { amount: 31.8, currency: 'usd', deliveryFee: 4.99 },
  })
}

describe('driver portal auth', () => {
  it('registers unverified, verifies, and issues a driver session', async () => {
    const token = await registerAndVerify()
    const me = await request(app).get('/api/driver-auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
    expect(me.body.driver.role).toBe('driver')
    expect(me.body.driver.isVerified).toBe(true)
    expect(me.body.driver.vehicleType).toBe('car')
  })

  it('requires agreeing to terms', async () => {
    const res = await request(app).post('/api/driver-auth/register').send({ ...BASE_DRIVER, email: 'noterms@driver.test', agreedToTerms: 'false' })
    expect(res.status).toBe(422)
  })

  it('blocks login until verified', async () => {
    await request(app).post('/api/driver-auth/register').send({ ...BASE_DRIVER, email: 'unverified@driver.test' })
    const res = await request(app).post('/api/driver-auth/login').send({ email: 'unverified@driver.test', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.requiresVerification).toBe(true)
    expect(res.body.accessToken).toBeUndefined()
  })

  it('rejects duplicate emails and wrong passwords', async () => {
    await registerAndVerify({ email: 'dupe@driver.test' })
    const dup = await request(app).post('/api/driver-auth/register').send({ ...BASE_DRIVER, email: 'dupe@driver.test' })
    expect(dup.status).toBe(409)
    const bad = await request(app).post('/api/driver-auth/login').send({ email: 'dupe@driver.test', password: 'nope' })
    expect(bad.status).toBe(401)
  })
})

describe('driver delivery management', () => {
  it('lists, accepts, and advances a delivery through the full lifecycle', async () => {
    const token = await registerAndVerify({ email: 'deliveries@driver.test' })
    const delivery = await createClaimableDelivery()

    const incoming = await request(app).get('/api/driver/deliveries/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming.status).toBe(200)
    expect(incoming.body.deliveries).toHaveLength(1)

    const accept = await request(app).post(`/api/driver/deliveries/${delivery._id}/accept`).set('Authorization', `Bearer ${token}`)
    expect(accept.status).toBe(200)
    expect(accept.body.delivery.driverStage).toBe('assigned')

    // No longer in the incoming pool once claimed.
    const incoming2 = await request(app).get('/api/driver/deliveries/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming2.body.deliveries).toHaveLength(0)

    const pickedUp = await request(app).patch(`/api/driver/deliveries/${delivery._id}/stage`).set('Authorization', `Bearer ${token}`).send({ action: 'pickup_completed' })
    expect(pickedUp.status).toBe(200)
    expect(pickedUp.body.delivery.driverStage).toBe('pickup_completed')
    expect(pickedUp.body.delivery.status).toBe('pickup')

    const atLaundromat = await request(app).patch(`/api/driver/deliveries/${delivery._id}/stage`).set('Authorization', `Bearer ${token}`).send({ action: 'at_laundromat' })
    expect(atLaundromat.status).toBe(200)
    expect(atLaundromat.body.delivery.driverStage).toBe('at_laundromat')
    // Intermediate stage deliberately doesn't touch the shared status.
    expect(atLaundromat.body.delivery.status).toBe('pickup')

    const outForDelivery = await request(app).patch(`/api/driver/deliveries/${delivery._id}/stage`).set('Authorization', `Bearer ${token}`).send({ action: 'out_for_delivery' })
    expect(outForDelivery.status).toBe(200)
    expect(outForDelivery.body.delivery.driverStage).toBe('out_for_delivery')

    const delivered = await request(app).patch(`/api/driver/deliveries/${delivery._id}/stage`).set('Authorization', `Bearer ${token}`).send({ action: 'delivered' })
    expect(delivered.status).toBe(200)
    expect(delivered.body.delivery.driverStage).toBe('delivered')
    expect(delivered.body.delivery.status).toBe('ready_delivered')

    const overview = await request(app).get('/api/driver/overview').set('Authorization', `Bearer ${token}`)
    expect(overview.body.overview.completedDeliveries).toBe(1)
    expect(overview.body.overview.activeDeliveries).toBe(0)
  })

  it('rejects a delivery with a reason and drops it from the incoming list', async () => {
    const token = await registerAndVerify({ email: 'reject@driver.test' })
    const delivery = await createClaimableDelivery()

    const reject = await request(app).post(`/api/driver/deliveries/${delivery._id}/reject`).set('Authorization', `Bearer ${token}`).send({ reason: 'Outside my route' })
    expect(reject.status).toBe(200)

    const incoming = await request(app).get('/api/driver/deliveries/incoming').set('Authorization', `Bearer ${token}`)
    expect(incoming.body.deliveries).toHaveLength(0)
  })

  it('requires a reason to reject', async () => {
    const token = await registerAndVerify({ email: 'reject2@driver.test' })
    const delivery = await createClaimableDelivery()
    const res = await request(app).post(`/api/driver/deliveries/${delivery._id}/reject`).set('Authorization', `Bearer ${token}`).send({})
    expect(res.status).toBe(422)
  })

  it('a driver and a partner can independently claim the same order without blocking each other', async () => {
    const driverToken = await registerAndVerify({ email: 'coclaim@driver.test' })
    const delivery = await createClaimableDelivery()

    const driverAccept = await request(app).post(`/api/driver/deliveries/${delivery._id}/accept`).set('Authorization', `Bearer ${driverToken}`)
    expect(driverAccept.status).toBe(200)

    // Register+verify a real partner, then confirm they can still claim the
    // SAME order on their side — the driver's claim above doesn't move
    // status away from 'request_received', which is what partner claims key
    // off, so the two claim systems stay decoupled.
    const partnerReg = await request(app).post('/api/partner-auth/register').send({
      businessName: 'Sparkle Wash', ownerName: 'Alex Rivera', email: 'coclaim@partner.test',
      phone: '+19185550123', password: 'password123', address: '120 Main St', city: 'Tulsa',
      state: 'OK', agreedToTerms: 'true',
    })
    expect(partnerReg.status).toBe(201)
    const partnerCode = sendOtpEmail.mock.calls.at(-1)[2]
    const partnerVerify = await request(app).post('/api/partner-auth/verify-email').send({ email: 'coclaim@partner.test', code: partnerCode })
    const partnerToken = partnerVerify.body.accessToken

    const partnerAccept = await request(app).post(`/api/partner/orders/${delivery._id}/accept`).set('Authorization', `Bearer ${partnerToken}`)
    expect(partnerAccept.status).toBe(200)

    const fresh = await PickupRequest.findById(delivery._id)
    expect(fresh.driverUserId).not.toBeNull()
    expect(fresh.partnerUserId).not.toBeNull()
  })
})

describe('driver weight confirmation', () => {
  it('lets the claiming driver confirm/override the actual pounds and re-prices an unpaid order', async () => {
    const token = await registerAndVerify({ email: 'weight@driver.test' })
    // medium loadSize -> pricing computed for 20 lbs at booking time.
    const delivery = await createClaimableDelivery()
    await request(app).post(`/api/driver/deliveries/${delivery._id}/accept`).set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .patch(`/api/driver/deliveries/${delivery._id}/weight`)
      .set('Authorization', `Bearer ${token}`)
      .send({ actualWeightLbs: 30 })
    expect(res.status).toBe(200)
    expect(res.body.delivery.actualWeightLbs).toBe(30)
    // loadSize itself is untouched — actualWeightLbs is what overrides it.
    expect(res.body.delivery.loadSize).toBe('medium')

    // Re-priced from the corrected weight: subtotal = 30 * 1.59, deliveryFee
    // unchanged from what was already on the order.
    const fresh = await PickupRequest.findById(delivery._id)
    expect(fresh.pricing.subtotal).toBeCloseTo(30 * 1.59, 2)
    expect(fresh.pricing.deliveryFee).toBe(delivery.pricing.deliveryFee)
    expect(fresh.weightConfirmedAt).toBeTruthy()
  })

  it('does not re-price an already-paid order', async () => {
    const token = await registerAndVerify({ email: 'weightpaid@driver.test' })
    const delivery = await createClaimableDelivery()
    delivery.paymentStatus = 'paid'
    await delivery.save()
    await request(app).post(`/api/driver/deliveries/${delivery._id}/accept`).set('Authorization', `Bearer ${token}`)

    const originalAmount = delivery.pricing.amount
    const res = await request(app)
      .patch(`/api/driver/deliveries/${delivery._id}/weight`)
      .set('Authorization', `Bearer ${token}`)
      .send({ actualWeightLbs: 40 })
    expect(res.status).toBe(200)
    expect(res.body.delivery.actualWeightLbs).toBe(40)

    const fresh = await PickupRequest.findById(delivery._id)
    expect(fresh.pricing.amount).toBe(originalAmount)
  })

  it('rejects an invalid weight and a weight-confirm from a non-claiming driver', async () => {
    const token = await registerAndVerify({ email: 'weightbad@driver.test' })
    const otherToken = await registerAndVerify({ email: 'weightother@driver.test' })
    const delivery = await createClaimableDelivery()
    await request(app).post(`/api/driver/deliveries/${delivery._id}/accept`).set('Authorization', `Bearer ${token}`)

    const badWeight = await request(app)
      .patch(`/api/driver/deliveries/${delivery._id}/weight`)
      .set('Authorization', `Bearer ${token}`)
      .send({ actualWeightLbs: -5 })
    expect(badWeight.status).toBe(422)

    const wrongDriver = await request(app)
      .patch(`/api/driver/deliveries/${delivery._id}/weight`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ actualWeightLbs: 25 })
    expect(wrongDriver.status).toBe(404)
  })
})

describe('driver location + availability', () => {
  it('updates live location and reflects it on /me', async () => {
    const token = await registerAndVerify({ email: 'location@driver.test' })
    const res = await request(app).patch('/api/driver/location').set('Authorization', `Bearer ${token}`).send({ lat: 36.15, lng: -95.99 })
    expect(res.status).toBe(200)
    expect(res.body.driver.location.coordinates).toEqual([-95.99, 36.15])

    const me = await request(app).get('/api/driver-auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.body.driver.location.coordinates).toEqual([-95.99, 36.15])
  })

  it('rejects an invalid location', async () => {
    const token = await registerAndVerify({ email: 'badlocation@driver.test' })
    const res = await request(app).patch('/api/driver/location').set('Authorization', `Bearer ${token}`).send({ lat: 999, lng: -95.99 })
    expect(res.status).toBe(422)
  })

  it('maps the online/offline toggle onto the available/offline enum', async () => {
    const token = await registerAndVerify({ email: 'avail@driver.test' })
    const online = await request(app).patch('/api/driver/availability').set('Authorization', `Bearer ${token}`).send({ availability: 'online' })
    expect(online.status).toBe(200)
    expect(online.body.driver.availability).toBe('available')

    const offline = await request(app).patch('/api/driver/availability').set('Authorization', `Bearer ${token}`).send({ availability: 'offline' })
    expect(offline.body.driver.availability).toBe('offline')
  })
})

describe('driver portal isolation', () => {
  it('rejects a driver token on customer/admin/business/partner routes', async () => {
    const token = await registerAndVerify({ email: 'iso@driver.test' })
    const onCustomer = await request(app).get('/api/pickups/me').set('Authorization', `Bearer ${token}`)
    const onAdmin = await request(app).get('/api/admin/pickups').set('Authorization', `Bearer ${token}`)
    const onBusiness = await request(app).get('/api/business/overview').set('Authorization', `Bearer ${token}`)
    const onPartner = await request(app).get('/api/partner/overview').set('Authorization', `Bearer ${token}`)
    expect(onCustomer.status).toBe(401)
    expect(onAdmin.status).toBe(401)
    expect(onBusiness.status).toBe(401)
    expect(onPartner.status).toBe(401)
  })

  it('rejects a customer/admin token on driver routes', async () => {
    const client = await createTestUser({ role: 'client', email: 'iso-client-d@example.com' })
    const admin = await createTestUser({ role: 'admin', email: 'iso-admin-d@example.com' })
    const clientRes = await request(app).get('/api/driver/deliveries/incoming').set('Authorization', `Bearer ${tokenFor(client)}`)
    const adminRes = await request(app).get('/api/driver/deliveries/incoming').set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(clientRes.status).toBe(401)
    expect(adminRes.status).toBe(401)
  })

  it('rejects unauthenticated access to driver routes', async () => {
    const res = await request(app).get('/api/driver/overview')
    expect(res.status).toBe(401)
  })
})
