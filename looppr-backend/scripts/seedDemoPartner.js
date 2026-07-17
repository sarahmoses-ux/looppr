// Seeds ONE pre-verified demo Partner Portal account plus sample orders:
// a few claimable (incoming) orders, a couple of in-progress jobs, and one
// delivered+paid order for earnings. Safe to re-run. NOT production data.
//
//   npm run seed:demo-partner
//
// Then sign in at /partners/login with the credentials printed at the end.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { computeOrderPrice } from '../utils/pricing.js'

const EMAIL = 'demo.partner@example.com'
const PASSWORD = 'looppr123'

function daysFromNow(n, hour = 9) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, 0, 0, 0)
  return d
}

const addr = (street) => ({ street, apartment: 'Unit 1', city: 'Tulsa', state: 'OK', zip: '74103' })

async function main() {
  await connectDB()
  try {
    const existing = await PartnerUser.findOne({ email: EMAIL })
    if (existing) {
      await PickupRequest.deleteMany({ partnerUserId: existing._id })
      await PartnerUser.deleteOne({ _id: existing._id })
    }
    // Also clear demo-seeded claimable orders (guest name flagged) so re-runs
    // don't pile up unclaimed orders.
    await PickupRequest.deleteMany({ 'guest.email': 'demo-seed@partner.local' })

    const passwordHash = await bcrypt.hash(PASSWORD, 12)
    const partner = await PartnerUser.create({
      businessName: 'Sparkle Wash Laundromat',
      ownerName: 'Alex Rivera',
      email: EMAIL,
      phone: '+19185550123',
      passwordHash,
      address: '120 Main St',
      city: 'Tulsa',
      state: 'OK',
      description: 'Full-service neighbourhood laundromat — wash, fold, and dry cleaning.',
      yearsInBusiness: 6,
      employeeCount: 9,
      maxDailyCapacity: 40,
      servicesOffered: ['wash_fold', 'dry_cleaning', 'ironing', 'express'],
      pickupAvailable: true,
      deliveryAvailable: true,
      operatingHours: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({ day, open: '08:00', close: '19:00', closed: false })),
      isVerified: true,
      accountStatus: 'active',
      availability: 'online',
      averageRating: 4.8,
    })

    const guest = (name) => ({ name, email: 'demo-seed@partner.local', phone: '+19185550000' })

    // Claimable (incoming) — unclaimed new requests.
    const claimable = [
      { name: 'Maria Gonzalez', loadSize: 'large', date: daysFromNow(1) },
      { name: 'James Carter', loadSize: 'medium', date: daysFromNow(1, 13) },
      { name: 'Priya Patel', loadSize: 'small', date: daysFromNow(2) },
    ]
    for (const c of claimable) {
      await PickupRequest.create({
        source: 'guest', guest: guest(c.name), address: addr('55 Elm St'),
        preferredDate: c.date, window: 'morning', deliveryWindow: 'afternoon',
        loadSize: c.loadSize, pricing: computeOrderPrice(c.loadSize, 5),
      })
    }

    // Claimed by the demo partner — in-flight jobs.
    const mine = [
      { name: 'Daniel Kim', loadSize: 'medium', stage: 'accepted', status: 'request_received', date: daysFromNow(0), pay: 'unpaid' },
      { name: 'Sofia Rossi', loadSize: 'large', stage: 'laundry_in_progress', status: 'laundry_in_progress', date: daysFromNow(-1), pay: 'pending' },
      { name: 'Emma Wilson', loadSize: 'medium', stage: 'ready_for_delivery', status: 'ready_delivered', date: daysFromNow(-1, 14), pay: 'unpaid' },
      { name: 'Noah Brown', loadSize: 'small', stage: 'delivered', status: 'ready_delivered', date: daysFromNow(-5), pay: 'paid' },
      { name: 'Olivia Davis', loadSize: 'large', stage: 'delivered', status: 'ready_delivered', date: daysFromNow(-9), pay: 'paid' },
    ]
    for (const m of mine) {
      await PickupRequest.create({
        source: 'guest', guest: guest(m.name), address: addr('88 Birch Rd'),
        preferredDate: m.date, window: 'afternoon', deliveryWindow: 'evening',
        loadSize: m.loadSize, pricing: computeOrderPrice(m.loadSize, 5),
        partnerUserId: partner._id, partnerStage: m.stage, partnerAcceptedAt: m.date,
        status: m.status, paymentStatus: m.pay, paidAt: m.pay === 'paid' ? m.date : undefined,
      })
    }

    console.log(`\n✓ Demo partner seeded (${claimable.length} incoming, ${mine.length} claimed)`)
    console.log(`  Sign in at /partners/login`)
    console.log(`  email:    ${EMAIL}`)
    console.log(`  password: ${PASSWORD}\n`)
  } catch (err) {
    console.error(`\n✗ Failed to seed demo partner: ${err.message}\n`)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

main()
