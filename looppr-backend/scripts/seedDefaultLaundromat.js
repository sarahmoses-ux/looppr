// Seeds/updates the ONE default in-house laundromat PartnerUser account —
// the system-owned fallback assignee services/assignmentService.js uses
// whenever no dedicated partner match exists yet.
//
// Unlike seedOps.js's throwaway dev fixtures (Rider/LaundryPartner), this is
// a REAL operational login: ops staff sign into the Partner Portal
// (/partners/login) as this account to work in-house orders. So, like
// seedAdmin.js, credentials come from .env — never hardcoded, never
// committed. Unlike seedAdmin.js, this is safe to re-run any time (upserts
// by email via $set, not a hard refuse) so ops can rotate the password or
// tweak business details without hand-editing the DB. Uses an explicit
// $set (not a raw replacement object like seedOps.js) specifically so
// re-running never clobbers tokenVersion/createdAt on an existing account.
//
// Reads DEFAULT_LAUNDROMAT_EMAIL / DEFAULT_LAUNDROMAT_PASSWORD /
// DEFAULT_LAUNDROMAT_PHONE from .env, then:
//   npm run seed:default-laundromat
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { PartnerUser } from '../models/PartnerUser.js'

const EMAIL = process.env.DEFAULT_LAUNDROMAT_EMAIL?.trim().toLowerCase()
const PASSWORD = process.env.DEFAULT_LAUNDROMAT_PASSWORD
const PHONE = process.env.DEFAULT_LAUNDROMAT_PHONE?.trim()

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exitCode = 1
  return false
}

function validate() {
  if (!EMAIL || !/^\S+@\S+\.\S+$/.test(EMAIL)) {
    return fail('DEFAULT_LAUNDROMAT_EMAIL is required and must be a valid email address.')
  }
  if (!PHONE || !/^\+?[0-9\s()-]{7,20}$/.test(PHONE)) {
    return fail('DEFAULT_LAUNDROMAT_PHONE is required and must be a valid phone number.')
  }
  if (!PASSWORD || !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(PASSWORD)) {
    return fail(
      'DEFAULT_LAUNDROMAT_PASSWORD is required and must be at least 8 characters, including a letter and a number.',
    )
  }
  return true
}

async function main() {
  if (!validate()) return

  await connectDB()

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 12)

    const partner = await PartnerUser.findOneAndUpdate(
      { email: EMAIL },
      {
        $set: {
          businessName: 'Looppr In-House Laundromat', // placeholder — rename later
          ownerName: 'Looppr Operations',
          email: EMAIL,
          phone: PHONE,
          passwordHash,
          address: '123 Main St',
          city: 'Tulsa',
          state: 'OK',
          description:
            "Looppr's in-house laundromat — the default assignee for orders until a partner network is live.",
          servicesOffered: ['wash_fold', 'dry_cleaning', 'ironing', 'express'],
          pickupAvailable: true,
          deliveryAvailable: true,
          maxDailyCapacity: 100,
          isVerified: true,
          accountStatus: 'active',
          availability: 'online',
          isDefaultLaundromat: true,
          role: 'partner',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    console.log(`\n✓ Default laundromat account ready`)
    console.log(`  id:    ${partner._id.toString()}`)
    console.log(`  email: ${partner.email}`)
    console.log(`\nSign in at /partners/login. Rotate DEFAULT_LAUNDROMAT_PASSWORD out of your env now.\n`)
  } catch (err) {
    fail(`Failed to seed default laundromat account: ${err.message}`)
  } finally {
    await disconnectDB()
  }
}

main()
