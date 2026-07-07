import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { sendWaitlistConfirmationEmail } from '../services/emailService.js'
import { WaitlistSignup } from '../models/WaitlistSignup.js'

const app = createApp()

describe('waitlist', () => {
  it('joins the waitlist and sends a confirmation', async () => {
    const res = await request(app).post('/api/waitlist').send({ email: 'waitlist-test@example.com' })
    expect(res.status).toBe(201)
    expect(sendWaitlistConfirmationEmail).toHaveBeenCalledTimes(1)

    const count = await WaitlistSignup.countDocuments({ email: 'waitlist-test@example.com' })
    expect(count).toBe(1)
  })

  it('is idempotent — resubmitting the same email does not duplicate or re-email', async () => {
    await request(app).post('/api/waitlist').send({ email: 'waitlist-dup-test@example.com' })
    const res = await request(app).post('/api/waitlist').send({ email: 'waitlist-dup-test@example.com' })

    expect(res.status).toBe(201)
    expect(sendWaitlistConfirmationEmail).toHaveBeenCalledTimes(1)

    const count = await WaitlistSignup.countDocuments({ email: 'waitlist-dup-test@example.com' })
    expect(count).toBe(1)
  })

  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/waitlist').send({ email: 'not-an-email' })
    expect(res.status).toBe(422)
  })
})
