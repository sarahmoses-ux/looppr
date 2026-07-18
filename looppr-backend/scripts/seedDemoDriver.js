// Seeds ONE pre-verified demo Driver Portal account plus sample deliveries:
// a few claimable (incoming) deliveries, a couple mid-route, and some
// delivered+paid ones for earnings. Safe to re-run. NOT production data.
//
//   npm run seed:demo-driver
//
// Then sign in at /drive/login with the credentials printed at the end.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { DriverUser } from '../models/DriverUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { computeOrderPrice } from '../utils/pricing.js'

const EMAIL = 'demo.driver@example.com'
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
    const existing = await DriverUser.findOne({ email: EMAIL })
    if (existing) {
      await PickupRequest.deleteMany({ driverUserId: existing._id })
      await DriverUser.deleteOne({ _id: existing._id })
    }
    // Also clear demo-seeded claimable deliveries so re-runs don't pile up
    // unclaimed ones.
    await PickupRequest.deleteMany({ 'guest.email': 'demo-seed@driver.local' })

    const passwordHash = await bcrypt.hash(PASSWORD, 12)
    const driver = await DriverUser.create({
      name: 'Jamie Chen',
      email: EMAIL,
      phone: '+19185550199',
      passwordHash,
      address: '200 Riverside Dr',
      city: 'Tulsa',
      state: 'OK',
      vehicleType: 'car',
      vehicleName: 'Toyota Corolla',
      licenseNumber: 'OK-DL-88213',
      vehiclePlate: 'LPR-4471',
      isVerified: true,
      accountStatus: 'active',
      availability: 'available',
      averageRating: 4.9,
      location: { type: 'Point', coordinates: [-95.9928, 36.1540] }, // Tulsa, OK
      locationUpdatedAt: new Date(),
    })

    const guest = (name) => ({ name, email: 'demo-seed@driver.local', phone: '+19185550000' })

    // Claimable (incoming) — unclaimed new requests.
    const claimable = [
      { name: 'Ethan Rivera', loadSize: 'medium', date: daysFromNow(1) },
      { name: 'Grace Lin', loadSize: 'small', date: daysFromNow(1, 13) },
      { name: 'Marcus Webb', loadSize: 'large', date: daysFromNow(2) },
    ]
    for (const c of claimable) {
      await PickupRequest.create({
        source: 'guest', guest: guest(c.name), address: addr('45 Cedar Ln'),
        preferredDate: c.date, window: 'morning', deliveryWindow: 'afternoon',
        loadSize: c.loadSize, pricing: computeOrderPrice(c.loadSize, 5),
      })
    }

    // Claimed by the demo driver — spanning every stage of the delivery
    // lifecycle so My Deliveries has something in each filter.
    const mine = [
      { name: 'Ava Thompson', loadSize: 'medium', stage: 'assigned', status: 'request_received', date: daysFromNow(0), pay: 'unpaid' },
      { name: 'Liam Foster', loadSize: 'small', stage: 'pickup_completed', status: 'pickup', date: daysFromNow(0, 15), pay: 'unpaid' },
      { name: 'Chloe Martin', loadSize: 'large', stage: 'at_laundromat', status: 'pickup', date: daysFromNow(-1), pay: 'pending' },
      { name: 'Nathan Price', loadSize: 'medium', stage: 'out_for_delivery', status: 'ready_delivered', date: daysFromNow(-1, 14), pay: 'unpaid' },
      { name: 'Isla Cooper', loadSize: 'small', stage: 'delivered', status: 'ready_delivered', date: daysFromNow(-5), pay: 'paid' },
      { name: 'Owen Bennett', loadSize: 'large', stage: 'delivered', status: 'ready_delivered', date: daysFromNow(-9), pay: 'paid' },
    ]
    for (const m of mine) {
      await PickupRequest.create({
        source: 'guest', guest: guest(m.name), address: addr('61 Maple Ave'),
        preferredDate: m.date, window: 'afternoon', deliveryWindow: 'evening',
        loadSize: m.loadSize, pricing: computeOrderPrice(m.loadSize, 5),
        driverUserId: driver._id, driverStage: m.stage, driverAcceptedAt: m.date,
        status: m.status, paymentStatus: m.pay, paidAt: m.pay === 'paid' ? m.date : undefined,
      })
    }

    await DriverUser.updateOne(
      { _id: driver._id },
      { activeDeliveryCount: mine.filter((m) => m.stage !== 'delivered').length },
    )

    console.log(`\n✓ Demo driver seeded (${claimable.length} incoming, ${mine.length} claimed)`)
    console.log(`  Sign in at /drive/login`)
    console.log(`  email:    ${EMAIL}`)
    console.log(`  password: ${PASSWORD}\n`)
  } catch (err) {
    console.error(`\n✗ Failed to seed demo driver: ${err.message}\n`)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

main()
