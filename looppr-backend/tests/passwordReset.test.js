import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { sendPasswordResetEmail } from '../services/emailService.js'
import { createTestUser } from './helpers/auth.js'
import { signRefreshToken } from '../utils/tokens.js'

function extractRefreshCookie(res) {
  return res.headers['set-cookie']?.find((c) => c.startsWith('refreshToken='))?.split(';')[0]
}

const app = createApp()

const payload = {
  name: 'Reset Test',
  email: 'password-reset-test@example.com',
  phone: '+14055554444',
  password: 'oldpassword1',
}

function lastResetCode() {
  const calls = sendPasswordResetEmail.mock.calls
  return calls[calls.length - 1][2]
}

describe('forgot/reset password', () => {
  beforeEach(async () => {
    // Created directly rather than via /client/register: registering also
    // sends an email-verification OTP, which shares the same 60s resend
    // cooldown field as the reset code — doing both back to back in a test
    // would make the second one silently no-op.
    await createTestUser(payload)
  })

  it('gives the exact same response for a registered and an unregistered email', async () => {
    const registered = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: payload.email })
    const unregistered = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' })

    expect(registered.status).toBe(200)
    expect(unregistered.status).toBe(200)
    expect(registered.body.message).toBe(unregistered.body.message)
  })

  it('only actually emails a code for a registered email', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: payload.email })
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1)

    await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' })
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1)
  })

  it('resets the password with a valid code and signs the user in', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: payload.email })
    const code = lastResetCode()

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: payload.email, code, newPassword: 'newpassword2' })
    expect(resetRes.status).toBe(200)
    expect(resetRes.body.accessToken).toBeTruthy()

    const oldLogin = await request(app)
      .post('/api/auth/client/login')
      .send({ email: payload.email, password: payload.password })
    expect(oldLogin.status).toBe(401)

    const newLogin = await request(app)
      .post('/api/auth/client/login')
      .send({ email: payload.email, password: 'newpassword2' })
    expect(newLogin.status).toBe(200)
    expect(newLogin.body.requiresOtp).toBe(true)
  })

  it('rejects an incorrect reset code', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: payload.email })

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: payload.email, code: '000000', newPassword: 'newpassword2' })
    expect(res.status).toBe(400)
  })

  it('rejects reset-password for an unregistered email without leaking a different error shape', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'nobody@example.com', code: '123456', newPassword: 'newpassword2' })
    expect(res.status).toBe(400)
  })

  it('invalidates refresh tokens issued before the reset, while the newly issued one keeps working', async () => {
    const user = await createTestUser({ ...payload, email: `invalidation-${payload.email}` })
    const oldRefreshToken = signRefreshToken(user)

    await request(app).post('/api/auth/forgot-password').send({ email: user.email })
    const code = lastResetCode()
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: user.email, code, newPassword: 'newpassword2' })
    expect(resetRes.status).toBe(200)
    const newCookie = extractRefreshCookie(resetRes)
    expect(newCookie).toBeTruthy()

    const oldRefresh = await request(app).post('/api/auth/refresh').set('Cookie', `refreshToken=${oldRefreshToken}`)
    expect(oldRefresh.status).toBe(401)

    const newRefresh = await request(app).post('/api/auth/refresh').set('Cookie', newCookie)
    expect(newRefresh.status).toBe(200)
  })
})
