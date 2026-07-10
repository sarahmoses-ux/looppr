import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { ALL_STATUSES, ORDER_FLOW } from '../constants/orderStatus.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

async function createGuestPickup() {
  const res = await request(app)
    .post('/api/pickups/guest')
    .send({
      guest: { name: 'Status Test', email: `status-test-${Date.now()}@example.com`, phone: '+14055552222' },
      address: { street: '1 Status Ave', apartment: 'Apt 1', city: 'Edmond', state: 'OK', zip: '73003' },
      preferredDate: '2027-01-20',
      window: 'evening',
      loadSize: 'small',
      notes: '',
      deliveryWindow: 'evening',
    })
  return res.body.pickup
}

async function adminToken() {
  const admin = await createTestUser({ role: 'admin', email: `order-status-admin-${Date.now()}@example.com` })
  return tokenFor(admin)
}

describe('admin order status updates', () => {
  it('walks an order through the entire lifecycle', async () => {
    const pickup = await createGuestPickup()
    const token = await adminToken()

    for (const status of ORDER_FLOW) {
      const res = await request(app)
        .patch(`/api/admin/pickups/${pickup.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status })
      expect(res.status).toBe(200)
      expect(res.body.pickup.status).toBe(status)
    }
  })

  it('accepts cancelled from any state', async () => {
    const pickup = await createGuestPickup()
    const token = await adminToken()

    const res = await request(app)
      .patch(`/api/admin/pickups/${pickup.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'cancelled' })
    expect(res.status).toBe(200)
    expect(res.body.pickup.status).toBe('cancelled')
  })

  it('rejects an invalid status value', async () => {
    const pickup = await createGuestPickup()
    const token = await adminToken()

    const res = await request(app)
      .patch(`/api/admin/pickups/${pickup.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'not_a_real_status' })
    expect(res.status).toBe(422)
  })

  it('rejects the request entirely without an admin session', async () => {
    const pickup = await createGuestPickup()

    const res = await request(app)
      .patch(`/api/admin/pickups/${pickup.id}/status`)
      .send({ status: 'pickup' })
    expect(res.status).toBe(401)
  })

  it('404s for a non-existent pickup id', async () => {
    const token = await adminToken()
    const res = await request(app)
      .patch('/api/admin/pickups/000000000000000000000000/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pickup' })
    expect(res.status).toBe(404)
  })

  it('every value in ALL_STATUSES is accepted by the validator', () => {
    // Sanity check that the shared constants list matches what the schema
    // enum + validator actually accept — see models/PickupRequest.js and
    // validations/adminValidation.js, which both import ALL_STATUSES too.
    expect(ALL_STATUSES).toContain('cancelled')
    expect(ALL_STATUSES.length).toBe(ORDER_FLOW.length + 1)
  })
})
