import { describe, expect, it, beforeAll } from 'vitest'
import { Rider } from '../models/Rider.js'
import { LaundryPartner } from '../models/LaundryPartner.js'
import { PickupRequest } from '../models/PickupRequest.js'

// $near requires the 2dsphere index to actually be built before querying —
// Model.init() waits for that (autoIndex build is otherwise async/racy).
beforeAll(async () => {
  await Promise.all([Rider.init(), LaundryPartner.init(), PickupRequest.init()])
})

function validPickupData(overrides = {}) {
  return {
    source: 'guest',
    guest: { name: 'Test Guest', email: 'guest@example.com', phone: '+14055550100' },
    address: { street: '1 Main St', apartment: 'Apt 1', city: 'Tulsa', state: 'OK', zip: '74103' },
    preferredDate: new Date('2027-01-20'),
    window: 'morning',
    loadSize: 'small',
    deliveryWindow: 'morning',
    ...overrides,
  }
}

describe('Rider model', () => {
  it('requires name, email, phone, and vehicleType', async () => {
    await expect(Rider.create({})).rejects.toThrow()
  })

  it('rejects an invalid vehicleType', async () => {
    await expect(
      Rider.create({
        name: 'Test Rider',
        email: 'rider1@example.com',
        phone: '+14055550101',
        vehicleType: 'spaceship',
      }),
    ).rejects.toThrow()
  })

  it('creates a valid rider with defaults applied', async () => {
    const rider = await Rider.create({
      name: 'Test Rider',
      email: 'rider2@example.com',
      phone: '+14055550102',
      vehicleType: 'bike',
    })
    expect(rider.status).toBe('pending')
    expect(rider.availability).toBe('offline')
    expect(rider.activeDeliveryCount).toBe(0)
    expect(rider.location).toBeUndefined()
  })
})

describe('LaundryPartner model', () => {
  it('requires businessName, contactName, email, phone, and address', async () => {
    await expect(LaundryPartner.create({})).rejects.toThrow()
  })

  it('rejects an invalid acceptsLoadSizes value', async () => {
    await expect(
      LaundryPartner.create({
        businessName: 'Test Cleaners',
        contactName: 'Test Contact',
        email: 'partner1@example.com',
        phone: '+14055550201',
        address: { street: '1 Main St', city: 'Tulsa', state: 'OK', zip: '74103' },
        acceptsLoadSizes: ['xl'],
      }),
    ).rejects.toThrow()
  })

  it('defaults state to OK and status to pending', async () => {
    const partner = await LaundryPartner.create({
      businessName: 'Test Cleaners',
      contactName: 'Test Contact',
      email: 'partner2@example.com',
      phone: '+14055550202',
      address: { street: '1 Main St', city: 'Tulsa', zip: '74103' },
    })
    expect(partner.address.state).toBe('OK')
    expect(partner.status).toBe('pending')
  })
})

describe('geospatial $near queries', () => {
  it('returns riders sorted nearest-first', async () => {
    const near = { name: 'Near Rider', email: 'near@example.com', phone: '+14055550301', vehicleType: 'car' }
    const mid = { name: 'Mid Rider', email: 'mid@example.com', phone: '+14055550302', vehicleType: 'car' }
    const far = { name: 'Far Rider', email: 'far@example.com', phone: '+14055550303', vehicleType: 'car' }

    await Rider.create({ ...near, location: { type: 'Point', coordinates: [-95.9928, 36.154] } })
    await Rider.create({ ...mid, location: { type: 'Point', coordinates: [-95.9, 36.1] } })
    await Rider.create({ ...far, location: { type: 'Point', coordinates: [-96.5, 35.5] } })

    const results = await Rider.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [-95.9928, 36.154] } } },
    })

    expect(results.map((r) => r.name)).toEqual(['Near Rider', 'Mid Rider', 'Far Rider'])
  })

  it('returns laundry partners sorted nearest-first', async () => {
    await LaundryPartner.create({
      businessName: 'Near Cleaners',
      contactName: 'A',
      email: 'near-partner@example.com',
      phone: '+14055550401',
      address: { street: '1 Main St', city: 'Tulsa', zip: '74103' },
      location: { type: 'Point', coordinates: [-95.9928, 36.154] },
    })
    await LaundryPartner.create({
      businessName: 'Far Cleaners',
      contactName: 'B',
      email: 'far-partner@example.com',
      phone: '+14055550402',
      address: { street: '1 Main St', city: 'Oklahoma City', zip: '73102' },
      location: { type: 'Point', coordinates: [-97.5164, 35.4676] },
    })

    const results = await LaundryPartner.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [-95.9928, 36.154] } } },
    })

    expect(results.map((p) => p.businessName)).toEqual(['Near Cleaners', 'Far Cleaners'])
  })
})

describe('PickupRequest.geoLocation sync', () => {
  it('populates geoLocation from location.lat/lng on save', async () => {
    const pickup = await PickupRequest.create(validPickupData({ location: { lat: 36.154, lng: -95.9928 } }))
    expect(pickup.geoLocation.coordinates).toEqual([-95.9928, 36.154])
  })

  it('leaves geoLocation unset when location is absent', async () => {
    const pickup = await PickupRequest.create(validPickupData())
    expect(pickup.geoLocation).toBeUndefined()
  })
})
