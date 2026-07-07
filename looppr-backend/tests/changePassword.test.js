import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, tokenFor } from './helpers/auth.js'
import { signRefreshToken } from '../utils/tokens.js'

const app = createApp()

function extractRefreshCookie(res) {
  return res.headers['set-cookie']?.find((c) => c.startsWith('refreshToken='))?.split(';')[0]
}

async function registeredUser(overrides = {}) {
  const user = await createTestUser({
    email: `change-password-test-${Date.now()}-${Math.random()}@example.com`,
    password: 'oldpassword1',
    ...overrides,
  })
  return { user, token: tokenFor(user) }
}

describe('change password', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: 'oldpassword1', newPassword: 'newpassword2' })
    expect(res.status).toBe(401)
  })

  it('rejects an incorrect current password', async () => {
    const { token } = await registeredUser()
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword2' })
    expect(res.status).toBe(401)
  })

  it('rejects a weak new password', async () => {
    const { token } = await registeredUser()
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword1', newPassword: 'short' })
    expect(res.status).toBe(422)
  })

  it('changes the password and lets the new one log in', async () => {
    const { user, token } = await registeredUser()
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword1', newPassword: 'newpassword2' })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()

    const oldLogin = await request(app)
      .post('/api/auth/client/login')
      .send({ email: user.email, password: 'oldpassword1' })
    expect(oldLogin.status).toBe(401)

    const newLogin = await request(app)
      .post('/api/auth/client/login')
      .send({ email: user.email, password: 'newpassword2' })
    expect(newLogin.status).toBe(200)
  })

  it('invalidates refresh tokens issued before the change, while the newly issued one keeps working', async () => {
    const { user, token } = await registeredUser()
    const oldRefreshToken = signRefreshToken(user)

    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword1', newPassword: 'newpassword2' })
    const newCookie = extractRefreshCookie(changeRes)
    expect(newCookie).toBeTruthy()

    const oldRefresh = await request(app).post('/api/auth/refresh').set('Cookie', `refreshToken=${oldRefreshToken}`)
    expect(oldRefresh.status).toBe(401)

    const newRefresh = await request(app).post('/api/auth/refresh').set('Cookie', newCookie)
    expect(newRefresh.status).toBe(200)
  })
})
