import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { ActivityLog } from '../models/ActivityLog.js'
import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

async function createPartner(overrides = {}) {
  return PartnerUser.create({
    businessName: 'Sparkle Wash',
    ownerName: 'Alex Rivera',
    email: `partner-${Date.now()}-${Math.random()}@example.com`,
    phone: '+19185550123',
    passwordHash: 'x',
    address: '120 Main St',
    city: 'Tulsa',
    accountStatus: 'active',
    ...overrides,
  })
}

async function createDriver(overrides = {}) {
  return DriverUser.create({
    name: 'Jamie Fox',
    email: `driver-${Date.now()}-${Math.random()}@example.com`,
    phone: '+19185550456',
    passwordHash: 'x',
    address: '5 Elm St',
    city: 'Tulsa',
    vehicleType: 'car',
    accountStatus: 'active',
    ...overrides,
  })
}

async function createPaidOrder({ partnerUserId, driverUserId, amount, deliveryFee, paidAt }) {
  return PickupRequest.create({
    address: { street: '9 Oak Ave', apartment: 'Apt 2', city: 'Tulsa', state: 'OK', zip: '74103' },
    preferredDate: new Date(Date.now() + 86400000),
    window: 'morning',
    deliveryWindow: 'afternoon',
    loadSize: 'medium',
    pricing: { amount, currency: 'usd', deliveryFee },
    paymentStatus: 'paid',
    paidAt,
    partnerUserId,
    driverUserId,
  })
}

describe('partner/driver payouts (super_admin only)', () => {
  it('computes a partner payout from paid orders\' pricing.amount within the period', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'payout-super-1@example.com' })
    const partner = await createPartner()
    const inRange = new Date('2026-01-15')
    const outOfRange = new Date('2026-02-15')

    await createPaidOrder({ partnerUserId: partner._id, amount: 30, paidAt: inRange })
    await createPaidOrder({ partnerUserId: partner._id, amount: 20, paidAt: inRange })
    await createPaidOrder({ partnerUserId: partner._id, amount: 999, paidAt: outOfRange })

    const res = await request(app)
      .post('/api/admin/payouts')
      .set('Authorization', `Bearer ${tokenFor(superAdmin)}`)
      .send({ payeeType: 'partner', payeeId: partner._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })

    expect(res.status).toBe(201)
    expect(res.body.payout.amount).toBe(50)
    expect(res.body.payout.orderCount).toBe(2)
    expect(res.body.payout.status).toBe('pending')

    const logged = await ActivityLog.findOne({ action: 'partner_payout_created', entityId: partner._id })
    expect(logged).not.toBeNull()
  })

  it('computes a driver payout from pricing.deliveryFee, not the full order amount', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'payout-super-2@example.com' })
    const driver = await createDriver()
    const inRange = new Date('2026-01-15')

    await createPaidOrder({ driverUserId: driver._id, amount: 40, deliveryFee: 8, paidAt: inRange })

    const res = await request(app)
      .post('/api/admin/payouts')
      .set('Authorization', `Bearer ${tokenFor(superAdmin)}`)
      .send({ payeeType: 'driver', payeeId: driver._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })

    expect(res.status).toBe(201)
    expect(res.body.payout.amount).toBe(8)
  })

  it('rejects generating a payout when there are no paid orders in range', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'payout-super-3@example.com' })
    const partner = await createPartner()

    const res = await request(app)
      .post('/api/admin/payouts')
      .set('Authorization', `Bearer ${tokenFor(superAdmin)}`)
      .send({ payeeType: 'partner', payeeId: partner._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })

    expect(res.status).toBe(409)
  })

  it('marks a pending payout paid exactly once', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'payout-super-4@example.com' })
    const partner = await createPartner()
    await createPaidOrder({ partnerUserId: partner._id, amount: 15, paidAt: new Date('2026-01-10') })

    const token = tokenFor(superAdmin)
    const generated = await request(app)
      .post('/api/admin/payouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ payeeType: 'partner', payeeId: partner._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })

    const payoutId = generated.body.payout._id
    const firstMark = await request(app).post(`/api/admin/payouts/${payoutId}/mark-paid`).set('Authorization', `Bearer ${token}`)
    const secondMark = await request(app).post(`/api/admin/payouts/${payoutId}/mark-paid`).set('Authorization', `Bearer ${token}`)

    expect(firstMark.status).toBe(200)
    expect(firstMark.body.payout.status).toBe('paid')
    expect(secondMark.status).toBe(409)
  })

  it('blocks ops and support from every payout route', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'payout-ops-1@example.com' })
    const support = await createTestUser({ role: 'admin', adminRole: 'support', email: 'payout-support-1@example.com' })

    for (const user of [ops, support]) {
      const res = await request(app).get('/api/admin/payouts').set('Authorization', `Bearer ${tokenFor(user)}`)
      expect(res.status).toBe(403)
    }
  })
})
