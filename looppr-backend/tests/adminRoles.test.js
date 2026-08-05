import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, tokenFor } from './helpers/auth.js'

const app = createApp()

describe('admin sub-roles (requireAdminRole)', () => {
  it('lets ops onto ops-only routes (Applications) and blocks support', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'ops-1@example.com' })
    const support = await createTestUser({ role: 'admin', adminRole: 'support', email: 'support-1@example.com' })

    const opsRes = await request(app).get('/api/admin/partners').set('Authorization', `Bearer ${tokenFor(ops)}`)
    const supportRes = await request(app).get('/api/admin/partners').set('Authorization', `Bearer ${tokenFor(support)}`)

    expect(opsRes.status).toBe(200)
    expect(supportRes.status).toBe(403)
  })

  it('lets support onto support-only routes (Customer Care) and blocks ops', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'ops-2@example.com' })
    const support = await createTestUser({ role: 'admin', adminRole: 'support', email: 'support-2@example.com' })

    const supportRes = await request(app)
      .get('/api/admin/contact-messages')
      .set('Authorization', `Bearer ${tokenFor(support)}`)
    const opsRes = await request(app).get('/api/admin/contact-messages').set('Authorization', `Bearer ${tokenFor(ops)}`)

    expect(supportRes.status).toBe(200)
    expect(opsRes.status).toBe(403)
  })

  it('super_admin passes every sub-role gate without being listed explicitly', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'super-1@example.com' })
    const token = tokenFor(superAdmin)

    const applications = await request(app).get('/api/admin/partners').set('Authorization', `Bearer ${token}`)
    const customerCare = await request(app).get('/api/admin/contact-messages').set('Authorization', `Bearer ${token}`)
    const dataCollection = await request(app).get('/api/admin/data-collection').set('Authorization', `Bearer ${token}`)

    expect(applications.status).toBe(200)
    expect(customerCare.status).toBe(200)
    expect(dataCollection.status).toBe(200)
  })

  it('grandfathers a missing adminRole in as super_admin (pre-existing seeded admins)', async () => {
    const legacyAdmin = await createTestUser({ role: 'admin', email: 'legacy-admin@example.com' })
    const token = tokenFor(legacyAdmin)

    const dataCollection = await request(app).get('/api/admin/data-collection').set('Authorization', `Bearer ${token}`)
    expect(dataCollection.status).toBe(200)
  })

  it('reserves Data Collection, Reports-backing routes, and Admin Users for super_admin only', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'ops-3@example.com' })
    const support = await createTestUser({ role: 'admin', adminRole: 'support', email: 'support-3@example.com' })

    for (const user of [ops, support]) {
      const token = tokenFor(user)
      const dataCollection = await request(app).get('/api/admin/data-collection').set('Authorization', `Bearer ${token}`)
      const adminUsers = await request(app).get('/api/admin/admin-users').set('Authorization', `Bearer ${token}`)
      expect(dataCollection.status).toBe(403)
      expect(adminUsers.status).toBe(403)
    }
  })
})

describe('Admin Users management', () => {
  it('lets super_admin create a new admin account with a sub-role', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'super-2@example.com' })
    const token = tokenFor(superAdmin)

    const res = await request(app)
      .post('/api/admin/admin-users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Ops',
        email: 'new-ops@example.com',
        phone: '+14055550001',
        password: 'password123',
        adminRole: 'ops',
      })

    expect(res.status).toBe(201)
    expect(res.body.admin.adminRole).toBe('ops')
    expect(res.body.admin.email).toBe('new-ops@example.com')
  })

  it('blocks ops/support from creating or listing admin accounts', async () => {
    const ops = await createTestUser({ role: 'admin', adminRole: 'ops', email: 'ops-4@example.com' })
    const res = await request(app)
      .post('/api/admin/admin-users')
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({ name: 'X', email: 'x@example.com', phone: '+14055550002', password: 'password123', adminRole: 'support' })
    expect(res.status).toBe(403)
  })

  it('refuses to let an admin change their own role', async () => {
    const superAdmin = await createTestUser({ role: 'admin', adminRole: 'super_admin', email: 'super-3@example.com' })
    const token = tokenFor(superAdmin)

    const res = await request(app)
      .patch(`/api/admin/admin-users/${superAdmin._id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ adminRole: 'ops' })

    expect(res.status).toBe(400)
  })
})
