import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

describe('existing order details', () => {
  it('lists historical booking information without rewriting the original order or price', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'history-admin@example.com' })
    const record = {
      source: 'guest',
      guest: { name: 'Previous Client', email: 'previous@example.com', phone: '4055551234' },
      address: { street: '1 Original St', apartment: 'Unit 3', city: 'Tulsa', state: 'OK', zip: '74103' },
      deliveryAddress: { street: '2 Return St', apartment: 'Unit 7', city: 'Edmond', state: 'OK', zip: '73003' },
      preferredDate: new Date('2026-07-01'), window: 'morning', deliveryWindow: 'evening',
      loadSize: 'medium', notes: 'Call on arrival', status: 'request_received',
      pricing: { amount: 31.8, currency: 'usd' }, paymentStatus: 'paid',
      createdAt: new Date('2026-06-30'), updatedAt: new Date('2026-06-30'),
    }
    const { insertedId } = await PickupRequest.collection.insertOne(record)
    const res = await request(app).get('/api/admin/pickups').query({ search: 'Unit 7' })
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
    expect(res.status).toBe(200)
    expect(res.body.pickups).toHaveLength(1)
    expect(res.body.pickups[0]).toMatchObject({
      guest: record.guest, address: record.address, deliveryAddress: record.deliveryAddress,
      deliveryWindow: 'evening', notes: 'Call on arrival', pricing: { amount: 31.8 },
    })
    const saved = await PickupRequest.collection.findOne({ _id: insertedId })
    expect(saved.weightLbs).toBeUndefined()
    expect(saved.pricing).toEqual(record.pricing)
    expect(saved.updatedAt).toEqual(record.updatedAt)
  })
})
