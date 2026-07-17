// Seeds ONE pre-verified demo Business Portal account plus a handful of sample
// pickups, so the dashboard can be viewed populated without going through the
// email-verification flow. Safe to re-run: it wipes and recreates the demo
// account + its pickups each time. NOT for production data — it's a demo.
//
//   npm run seed:demo-business
//
// Then sign in at /business/login with the credentials printed at the end.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { BusinessUser } from '../models/BusinessUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { computeOrderPrice } from '../utils/pricing.js'

const EMAIL = 'demo.business@example.com'
const PASSWORD = 'looppr123'

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(9, 0, 0, 0)
  return d
}

async function main() {
  await connectDB()
  try {
    // Clean slate so re-running gives predictable demo data.
    const existing = await BusinessUser.findOne({ email: EMAIL })
    if (existing) {
      await PickupRequest.deleteMany({ businessId: existing._id })
      await BusinessUser.deleteOne({ _id: existing._id })
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 12)
    const business = await BusinessUser.create({
      businessName: 'Riverside Hotel',
      businessType: 'hotel',
      contactPerson: 'Jordan Lee',
      email: EMAIL,
      phone: '+19185550123',
      passwordHash,
      address: '500 Riverside Dr',
      city: 'Tulsa',
      state: 'OK',
      weeklyVolume: '300 lbs/week',
      registrationNumber: 'OK-BIZ-4471',
      isVerified: true,
      accountStatus: 'active',
    })

    const addr = { street: '500 Riverside Dr', apartment: 'Front desk', city: 'Tulsa', state: 'OK', zip: '74103' }
    const samples = [
      { status: 'request_received', preferredDate: daysFromNow(1), window: 'morning', loadSize: 'large', payment: 'unpaid', prior: 0 },
      { status: 'pickup', preferredDate: daysFromNow(2), window: 'afternoon', loadSize: 'medium', payment: 'unpaid', prior: 1 },
      { status: 'laundry_in_progress', preferredDate: daysFromNow(-1), window: 'morning', loadSize: 'large', payment: 'pending', prior: 2 },
      { status: 'ready_delivered', preferredDate: daysFromNow(-4), window: 'evening', loadSize: 'medium', payment: 'paid', prior: 3 },
      { status: 'ready_delivered', preferredDate: daysFromNow(-9), window: 'morning', loadSize: 'small', payment: 'paid', prior: 4 },
    ]

    for (const s of samples) {
      await PickupRequest.create({
        businessId: business._id,
        source: 'business',
        address: addr,
        preferredDate: s.preferredDate,
        window: s.window,
        deliveryWindow: 'afternoon',
        loadSize: s.loadSize,
        notes: 'Demo order',
        status: s.status,
        paymentStatus: s.payment,
        paidAt: s.payment === 'paid' ? s.preferredDate : undefined,
        pricing: computeOrderPrice(s.loadSize, s.prior),
      })
    }

    console.log(`\n✓ Demo business seeded with ${samples.length} sample pickups`)
    console.log(`  Sign in at /business/login`)
    console.log(`  email:    ${EMAIL}`)
    console.log(`  password: ${PASSWORD}\n`)
  } catch (err) {
    console.error(`\n✗ Failed to seed demo business: ${err.message}\n`)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

main()
