// Seeds a handful of sample Rider/LaundryPartner documents with real
// Oklahoma-area coordinates (Tulsa + OKC) so geospatial $near queries are
// testable before any admin UI exists to create these records for real.
//
// Unlike seedAdmin.js, this is dev/test fixture data, not a sensitive
// one-time account — safe to re-run any time (upserts by email) and safe
// to run against the in-memory DB fallback (config/db.js) when MONGO_URI
// isn't set.
//   npm run seed:ops
import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import { Rider } from '../models/Rider.js'
import { LaundryPartner } from '../models/LaundryPartner.js'

const RIDERS = [
  {
    name: 'Alex Rider',
    email: 'alex.rider@looppr.dev',
    phone: '(918) 555-0101',
    status: 'active',
    availability: 'available',
    vehicleType: 'car',
    location: { type: 'Point', coordinates: [-95.9928, 36.154] }, // Tulsa
    locationUpdatedAt: new Date(),
  },
  {
    name: 'Bailey Rivers',
    email: 'bailey.rivers@looppr.dev',
    phone: '(918) 555-0102',
    status: 'active',
    availability: 'available',
    vehicleType: 'bike',
    location: { type: 'Point', coordinates: [-95.937, 36.1284] }, // East Tulsa
    locationUpdatedAt: new Date(),
  },
  {
    name: 'Casey Okafor',
    email: 'casey.okafor@looppr.dev',
    phone: '(405) 555-0103',
    status: 'active',
    availability: 'available',
    vehicleType: 'van',
    location: { type: 'Point', coordinates: [-97.5164, 35.4676] }, // OKC
    locationUpdatedAt: new Date(),
  },
]

const PARTNERS = [
  {
    businessName: 'Tulsa Fresh Laundry Co.',
    contactName: 'Dana Fresh',
    email: 'dana@tulsafreshlaundry.dev',
    phone: '(918) 555-0201',
    address: { street: '210 S Main St', apartment: '', city: 'Tulsa', state: 'OK', zip: '74103' },
    location: { type: 'Point', coordinates: [-95.9903, 36.1556] },
    status: 'active',
    acceptsLoadSizes: ['small', 'medium', 'large'],
    operatingHours: ['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => ({
      day,
      open: '08:00',
      close: '18:00',
      closed: false,
    })),
  },
  {
    businessName: 'Riverside Wash & Fold',
    contactName: 'Jordan Rivers',
    email: 'jordan@riversidewashfold.dev',
    phone: '(918) 555-0202',
    address: { street: '4521 Riverside Dr', apartment: '', city: 'Tulsa', state: 'OK', zip: '74105' },
    location: { type: 'Point', coordinates: [-95.9822, 36.1156] },
    status: 'active',
    acceptsLoadSizes: ['small', 'medium'],
    operatingHours: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({
      day,
      open: '07:00',
      close: '19:00',
      closed: false,
    })),
  },
  {
    businessName: 'OKC Metro Cleaners',
    contactName: 'Morgan Metro',
    email: 'morgan@okcmetrocleaners.dev',
    phone: '(405) 555-0203',
    address: { street: '900 N Broadway Ave', apartment: '', city: 'Oklahoma City', state: 'OK', zip: '73102' },
    location: { type: 'Point', coordinates: [-97.5153, 35.4759] },
    status: 'active',
    acceptsLoadSizes: ['small', 'medium', 'large'],
    operatingHours: ['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => ({
      day,
      open: '08:00',
      close: '17:00',
      closed: false,
    })),
  },
]

async function main() {
  await connectDB()

  try {
    for (const rider of RIDERS) {
      await Rider.findOneAndUpdate({ email: rider.email }, rider, { upsert: true, new: true })
    }
    console.log(`✓ Seeded ${RIDERS.length} riders`)

    for (const partner of PARTNERS) {
      await LaundryPartner.findOneAndUpdate({ email: partner.email }, partner, { upsert: true, new: true })
    }
    console.log(`✓ Seeded ${PARTNERS.length} laundry partners`)
  } catch (err) {
    console.error(`✗ Failed to seed ops data: ${err.message}`)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

main()
