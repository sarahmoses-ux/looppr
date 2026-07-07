// Seeds ONE admin account. This is intentionally the *only* way an admin
// account can ever be created — there is no public /admin/register endpoint
// (see routes/authRoutes.js). Run manually by someone with direct access to
// the production environment/DB, not exposed over HTTP.
//
// Reads ADMIN_SEED_NAME / ADMIN_SEED_EMAIL / ADMIN_SEED_PHONE /
// ADMIN_SEED_PASSWORD from .env (via dotenv/config below) — set those four
// lines there, then run:
//   npm run seed:admin
//
// .env is gitignored, so this is the "secured" way to hold the seed
// credentials — never commit them, never pass the password as a bare shell
// arg (it'd land in shell history). Rotate/remove them from .env once the
// admin account exists. Safe to re-run to seed additional admins with
// different details; refuses to run on missing/weak input or a duplicate
// email.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { User } from '../models/User.js'

const NAME = process.env.ADMIN_SEED_NAME?.trim()
const EMAIL = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase()
const PHONE = process.env.ADMIN_SEED_PHONE?.trim()
const PASSWORD = process.env.ADMIN_SEED_PASSWORD

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exitCode = 1
  return false
}

function validate() {
  if (!NAME || NAME.length < 2 || NAME.length > 100) {
    return fail('ADMIN_SEED_NAME is required and must be 2–100 characters.')
  }
  if (!EMAIL || !/^\S+@\S+\.\S+$/.test(EMAIL)) {
    return fail('ADMIN_SEED_EMAIL is required and must be a valid email address.')
  }
  if (!PHONE || !/^\+?[0-9\s()-]{7,20}$/.test(PHONE)) {
    return fail('ADMIN_SEED_PHONE is required and must be a valid phone number.')
  }
  if (!PASSWORD || !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(PASSWORD)) {
    return fail(
      'ADMIN_SEED_PASSWORD is required and must be at least 8 characters, including a letter and a number.',
    )
  }
  return true
}

async function main() {
  if (!validate()) return

  await connectDB()

  try {
    const existing = await User.findOne({ email: EMAIL })
    if (existing) {
      fail(`A user with email "${EMAIL}" already exists (role: ${existing.role}).`)
      return
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 12)

    // This is a SEED admin account — created directly against the DB, not
    // through the register endpoint, and skips email verification since
    // there's no public sign-up step to verify.
    const admin = await User.create({
      name: NAME,
      email: EMAIL,
      phone: PHONE,
      passwordHash,
      role: 'admin',
      isVerified: true,
    })

    console.log(`\n✓ Seed admin account created`)
    console.log(`  id:    ${admin._id.toString()}`)
    console.log(`  name:  ${admin.name}`)
    console.log(`  email: ${admin.email}`)
    console.log(`\nSign in at /admin/login. Rotate ADMIN_SEED_PASSWORD out of your env now.\n`)
  } catch (err) {
    fail(`Failed to create admin account: ${err.message}`)
  } finally {
    await disconnectDB()
  }
}

main()
