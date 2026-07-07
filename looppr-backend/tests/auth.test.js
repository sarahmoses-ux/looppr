import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { sendOtpEmail } from '../services/emailService.js'

const app = createApp()

const payload = {
  name: 'Test User',
  email: 'client-auth-test@example.com',
  phone: '+14055551234',
  password: 'password123',
}

function lastOtpCode() {
  const calls = sendOtpEmail.mock.calls
  return calls[calls.length - 1][2]
}

describe('client register/login', () => {
  it('registers a new client and issues a session', async () => {
    const res = await request(app).post('/api/auth/client/register').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.user.role).toBe('client')
    expect(res.body.user.isVerified).toBe(false)
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects a second registration with the same email', async () => {
    await request(app).post('/api/auth/client/register').send(payload)
    const res = await request(app).post('/api/auth/client/register').send(payload)
    expect(res.status).toBe(409)
  })

  it('rejects a weak password at registration', async () => {
    const res = await request(app)
      .post('/api/auth/client/register')
      .send({ ...payload, email: 'weakpass@example.com', password: 'short' })
    expect(res.status).toBe(422)
  })

  describe('once registered', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/client/register').send(payload)
      // Registration itself sends a verification OTP — reset the spy so
      // each test's own assertions about login's OTP call start from zero.
      vi.clearAllMocks()
    })

    it('completes login via password + emailed OTP', async () => {
      const loginRes = await request(app)
        .post('/api/auth/client/login')
        .send({ email: payload.email, password: payload.password })
      expect(loginRes.status).toBe(200)
      expect(loginRes.body.requiresOtp).toBe(true)
      expect(sendOtpEmail).toHaveBeenCalledTimes(1)

      const code = lastOtpCode()
      const verifyRes = await request(app)
        .post('/api/auth/client/login/verify-otp')
        .send({ challengeToken: loginRes.body.challengeToken, code })
      expect(verifyRes.status).toBe(200)
      expect(verifyRes.body.accessToken).toBeTruthy()
      expect(verifyRes.body.user.email).toBe(payload.email)
    })

    it('rejects an incorrect password without sending an OTP', async () => {
      const res = await request(app)
        .post('/api/auth/client/login')
        .send({ email: payload.email, password: 'wrongpassword1' })
      expect(res.status).toBe(401)
      expect(sendOtpEmail).not.toHaveBeenCalled()
    })

    it('rejects an incorrect OTP code', async () => {
      const loginRes = await request(app)
        .post('/api/auth/client/login')
        .send({ email: payload.email, password: payload.password })

      const res = await request(app)
        .post('/api/auth/client/login/verify-otp')
        .send({ challengeToken: loginRes.body.challengeToken, code: '000000' })
      expect(res.status).toBe(400)
    })

    it('rejects a login for a non-existent email with the same message as a wrong password', async () => {
      const wrongEmailRes = await request(app)
        .post('/api/auth/client/login')
        .send({ email: 'nobody@example.com', password: payload.password })
      const wrongPasswordRes = await request(app)
        .post('/api/auth/client/login')
        .send({ email: payload.email, password: 'wrongpassword1' })

      expect(wrongEmailRes.status).toBe(401)
      expect(wrongPasswordRes.status).toBe(401)
      expect(wrongEmailRes.body.message).toBe(wrongPasswordRes.body.message)
    })
  })
})
