import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

describe('client/admin role separation', () => {
  it('rejects admin credentials on the client login endpoint', async () => {
    await createTestUser({ role: 'admin', email: 'admin-role-test@example.com', password: 'adminpass123' })

    const res = await request(app)
      .post('/api/auth/client/login')
      .send({ email: 'admin-role-test@example.com', password: 'adminpass123' })
    expect(res.status).toBe(401)
  })

  it('rejects client credentials on the admin login endpoint', async () => {
    await createTestUser({ role: 'client', email: 'client-role-test@example.com', password: 'clientpass123' })

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'client-role-test@example.com', password: 'clientpass123' })
    expect(res.status).toBe(401)
  })

  it('gives the identical error message either way (no leaking which check failed)', async () => {
    await createTestUser({ role: 'admin', email: 'admin-msg-test@example.com', password: 'adminpass123' })

    const wrongSurface = await request(app)
      .post('/api/auth/client/login')
      .send({ email: 'admin-msg-test@example.com', password: 'adminpass123' })
    const wrongPassword = await request(app)
      .post('/api/auth/client/login')
      .send({ email: 'admin-msg-test@example.com', password: 'nope' })

    expect(wrongSurface.body.message).toBe(wrongPassword.body.message)
  })

  it('rejects a client session on admin-only routes', async () => {
    const client = await createTestUser({ role: 'client', email: 'client-admin-route-test@example.com' })
    const token = tokenFor(client)

    const res = await request(app).get('/api/admin/pickups').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('allows an admin session on admin-only routes', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'admin-route-test@example.com' })
    const token = tokenFor(admin)

    const res = await request(app).get('/api/admin/pickups').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })

  it('rejects requests with no session at all on both customer and admin routes', async () => {
    const noAuthCustomer = await request(app).get('/api/pickups/me')
    const noAuthAdmin = await request(app).get('/api/admin/pickups')
    expect(noAuthCustomer.status).toBe(401)
    expect(noAuthAdmin.status).toBe(401)
  })
})
