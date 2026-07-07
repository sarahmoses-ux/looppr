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
