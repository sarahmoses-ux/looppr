import bcrypt from 'bcryptjs'
import { User } from '../../models/User.js'
import { signAccessToken } from '../../utils/tokens.js'

let counter = 0

// Inserts a user directly (bypassing the register/OTP HTTP flow) for tests
// that are about something else (e.g. "does this admin-only route reject
// clients") and shouldn't have to pay for a full signup every time.
export async function createTestUser({
  role = 'client',
  email,
  name = 'Test User',
  phone = '+14055550000',
  password = 'password123',
  isVerified = true,
} = {}) {
  counter += 1
  const passwordHash = await bcrypt.hash(password, 12)
  return User.create({
    name,
    email: email || `test-user-${counter}@example.com`,
    phone,
    passwordHash,
    role,
    isVerified,
  })
}

// Signs a real access token for a user without going through login+OTP —
// same helper the app itself uses, so the token is indistinguishable from
// one issued by a real login.
export function tokenFor(user) {
  return signAccessToken(user)
}
