import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

async function clientToken() {
  const user = await createTestUser({ email: `addresses-test-${Date.now()}-${Math.random()}@example.com` })
  return tokenFor(user)
}

describe('saved addresses', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/addresses')
    expect(res.status).toBe(401)
  })

  it('starts empty for a fresh account', async () => {
    const token = await clientToken()
    const res = await request(app).get('/api/addresses').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.addresses).toEqual([])
  })

  it('adds an address, defaulting label and state', async () => {
    const token = await clientToken()
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ street: '12 Test Ave', city: 'Edmond', zip: '73003' })

    expect(res.status).toBe(201)
    expect(res.body.addresses).toHaveLength(1)
    expect(res.body.addresses[0]).toMatchObject({
      label: 'Address',
      street: '12 Test Ave',
      city: 'Edmond',
      state: 'OK',
      zip: '73003',
    })
  })

  it('rejects an invalid ZIP code', async () => {
    const token = await clientToken()
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ street: '12 Test Ave', city: 'Edmond', zip: 'not-a-zip' })
    expect(res.status).toBe(422)
  })

  it('rejects a non-Oklahoma state', async () => {
    const token = await clientToken()
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ street: '12 Test Ave', city: 'Dallas', state: 'TX', zip: '75201' })
    expect(res.status).toBe(422)
  })

  it('deletes an address', async () => {
    const token = await clientToken()
    const added = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ street: '12 Test Ave', city: 'Edmond', zip: '73003' })
    const id = added.body.addresses[0]._id

    const res = await request(app).delete(`/api/addresses/${id}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.addresses).toEqual([])
  })

  it('404s deleting an address that does not exist', async () => {
    const token = await clientToken()
    const res = await request(app)
      .delete('/api/addresses/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('never lets one customer see or delete another\'s addresses', async () => {
    const tokenA = await clientToken()
    const tokenB = await clientToken()
    const added = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ street: '12 Test Ave', city: 'Edmond', zip: '73003' })
    const id = added.body.addresses[0]._id

    const listB = await request(app).get('/api/addresses').set('Authorization', `Bearer ${tokenB}`)
    expect(listB.body.addresses).toEqual([])

    const deleteB = await request(app).delete(`/api/addresses/${id}`).set('Authorization', `Bearer ${tokenB}`)
    expect(deleteB.status).toBe(404)

    const listAAfter = await request(app).get('/api/addresses').set('Authorization', `Bearer ${tokenA}`)
    expect(listAAfter.body.addresses).toHaveLength(1)
  })
})
