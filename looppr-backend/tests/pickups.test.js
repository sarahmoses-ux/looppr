import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

async function clientToken() {
  const user = await createTestUser({ email: `pickups-test-${Date.now()}-${Math.random()}@example.com` })
  return { user, token: tokenFor(user) }
}

function pickupPayload(overrides = {}) {
  return {
    address: { street: '1 Pickup Test Ln', city: 'Edmond', state: 'OK', zip: '73003' },
    preferredDate: '2027-06-01',
    window: 'morning',
    loadSize: 'medium',
    notes: '',
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
})

describe('payMyOrder', () => {
  it('marks an order paid and records paidAt', async () => {
    const { token } = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())

    const res = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.pickup.paymentStatus).toBe('paid')
    expect(res.body.pickup.paidAt).toBeTruthy()
  })

  it('rejects paying for an order twice', async () => {
    const { token } = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${token}`)
      .send(pickupPayload())

    await request(app).post(`/api/pickups/${created.body.pickup._id}/pay`).set('Authorization', `Bearer ${token}`)
    const second = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay`)
      .set('Authorization', `Bearer ${token}`)

    expect(second.status).toBe(409)
  })

  it('rejects paying for another customer\'s order', async () => {
    const a = await clientToken()
    const b = await clientToken()
    const created = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${a.token}`)
      .send(pickupPayload())

    const res = await request(app)
      .post(`/api/pickups/${created.body.pickup._id}/pay`)
      .set('Authorization', `Bearer ${b.token}`)
    expect(res.status).toBe(404)
  })
})

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
    await request(app).post(`/api/pickups/${paid.body.pickup._id}/pay`).set('Authorization', `Bearer ${token}`)

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
    await request(app).post(`/api/pickups/${order.body.pickup._id}/pay`).set('Authorization', `Bearer ${a.token}`)

    const res = await request(app).get('/api/pickups/me/stats').set('Authorization', `Bearer ${b.token}`)
    expect(res.body.stats).toEqual({ totalOrders: 0, totalSpent: 0 })
  })
})
