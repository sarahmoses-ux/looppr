import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { BusinessUser } from '../models/BusinessUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

async function createBusiness(overrides = {}) {
  return BusinessUser.create({
    businessName: 'Riverside Hotel',
    businessType: 'hotel',
    contactPerson: 'Sam Lee',
    email: `business-${Date.now()}-${Math.random()}@example.com`,
    phone: '+19185550789',
    passwordHash: 'x',
    address: '1 River Rd',
    city: 'Tulsa',
    ...overrides,
  })
}

async function createPaidOrder({ businessId, amount, paidAt }) {
  return PickupRequest.create({
    address: { street: '9 Oak Ave', apartment: 'Apt 2', city: 'Tulsa', state: 'OK', zip: '74103' },
    preferredDate: new Date(Date.now() + 86400000),
    window: 'morning',
    deliveryWindow: 'afternoon',
    loadSize: 'medium',
    pricing: { amount, currency: 'usd' },
    paymentStatus: 'paid',
    paidAt,
    businessId,
  })
}

describe('business invoices (super_admin only)', () => {
  it('generates a sequential invoice number and computes the amount from paid orders', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'invoice-super-1@example.com' })
    const business = await createBusiness()
    const inRange = new Date('2026-01-15')

    await createPaidOrder({ businessId: business._id, amount: 60, paidAt: inRange })
    await createPaidOrder({ businessId: business._id, amount: 40, paidAt: inRange })

    const res = await request(app)
      .post('/api/admin/invoices')
      .set('Authorization', `Bearer ${tokenFor(superAdmin)}`)
      .send({ businessId: business._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })

    expect(res.status).toBe(201)
    expect(res.body.invoice.amount).toBe(100)
    expect(res.body.invoice.orderCount).toBe(2)
    expect(res.body.invoice.status).toBe('draft')
    expect(res.body.invoice.invoiceNumber).toMatch(/^INV-\d{5}$/)
  })

  it('only allows the linear draft -> sent -> paid transition, not skipping ahead', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'invoice-super-2@example.com' })
    const business = await createBusiness()
    await createPaidOrder({ businessId: business._id, amount: 25, paidAt: new Date('2026-01-10') })

    const token = tokenFor(superAdmin)
    const generated = await request(app)
      .post('/api/admin/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessId: business._id.toString(), periodStart: '2026-01-01', periodEnd: '2026-01-31' })
    const invoiceId = generated.body.invoice._id

    const skipAhead = await request(app)
      .patch(`/api/admin/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'paid' })
    expect(skipAhead.status).toBe(409)

    const toSent = await request(app)
      .patch(`/api/admin/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sent' })
    expect(toSent.status).toBe(200)
    expect(toSent.body.invoice.status).toBe('sent')

    const toPaid = await request(app)
      .patch(`/api/admin/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'paid' })
    expect(toPaid.status).toBe(200)
    expect(toPaid.body.invoice.status).toBe('paid')
  })

  it('blocks ops and support from every invoice route', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'invoice-ops-1@example.com' })
    const res = await request(app).get('/api/admin/invoices').set('Authorization', `Bearer ${tokenFor(ops)}`)
    expect(res.status).toBe(403)
  })
})
