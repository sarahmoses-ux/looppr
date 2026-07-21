// Runs before every test file (see vitest.config.js setupFiles).
process.env.NODE_ENV ??= 'test'
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret'
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret'
process.env.JWT_LOGIN_CHALLENGE_SECRET ??= 'test-challenge-secret'
process.env.CLIENT_URL ??= 'http://localhost:5173'

import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Real network calls never happen in tests — every email-sending function
// is a plain vi.fn() spy. Tests that need the OTP/reset code read it
// straight off the mock's captured call arguments (see tests/helpers/auth.js
// and individual test files), never a real inbox.
vi.mock('../services/emailService.js', () => ({
  sendOtpEmail: vi.fn(async () => {}),
  sendPaymentRequestEmail: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendWaitlistConfirmationEmail: vi.fn(async () => {}),
  sendContactConfirmationEmail: vi.fn(async () => {}),
  sendPartnerLeadEmail: vi.fn(async () => {}),
}))

// Same no-real-network rule for Stripe — paymentIntents are tracked in an
// in-memory Map so tests can simulate a charge going through (via
// __setIntentStatus) without ever hitting Stripe's API. constructEvent skips
// real HMAC verification (that's Stripe's own tested code, not ours) and
// just checks for a fixed literal signature, so webhook tests can exercise
// our handler's routing/idempotency logic with a plain JSON body.
vi.mock('../utils/stripeClient.js', () => {
  const intents = new Map()
  let counter = 0

  const stripe = {
    paymentIntents: {
      create: vi.fn(async ({ amount, currency, metadata }) => {
        counter += 1
        const intent = {
          id: `pi_test_${counter}`,
          client_secret: `pi_test_${counter}_secret_test`,
          amount,
          currency,
          metadata,
          status: 'requires_payment_method',
        }
        intents.set(intent.id, intent)
        return intent
      }),
      retrieve: vi.fn(async (id) => intents.get(id)),
    },
    webhooks: {
      constructEvent: vi.fn((rawBody, signature) => {
        if (signature !== 'test-signature') throw new Error('Invalid signature')
        return JSON.parse(rawBody.toString())
      }),
    },
  }

  return {
    stripe,
    __setIntentStatus(id, status) {
      const intent = intents.get(id)
      if (intent) intent.status = status
    },
  }
})

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  const { collections } = mongoose.connection
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
  vi.clearAllMocks()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
