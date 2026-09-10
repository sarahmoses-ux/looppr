import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import AdminOrderDetails from './AdminOrderDetails'

const pickup = {
  _id: 'order-123', source: 'guest',
  guest: { name: 'Client Name', email: 'client@example.com', phone: '+14055551234' },
  address: { street: '12 Pickup St', apartment: 'Unit 4', city: 'Tulsa', state: 'OK', zip: '74103' },
  deliveryAddress: { street: '45 Return Ave', apartment: 'Suite 8', city: 'Edmond', state: 'OK', zip: '73003' },
  preferredDate: '2027-06-01T00:00:00.000Z', window: 'morning', deliveryWindow: 'evening',
  loadSize: 'small', weightLbs: 12, actualWeightLbs: 12.5,
  foldStyle: 'hangers', detergent: 'eco', waterTemperature: 'warm',
  shoeLaundry: { pairs: 2 }, notes: 'Use side entrance.\nCall before arrival.',
  pricing: { subtotal: 19.88, shoeLaundrySubtotal: 60, deliveryFee: 4.99, amount: 84.87, currency: 'usd' },
  paymentStatus: 'paid',
}

describe('admin order details', () => {
  it('fully lists distinct pickup and delivery addresses, contact, preferences, notes and pricing', () => {
    render(<AdminOrderDetails pickup={pickup} />)
    const pickupSection = within(screen.getByRole('heading', { name: 'Pickup details' }).closest('section'))
    const deliverySection = within(screen.getByRole('heading', { name: 'Delivery details' }).closest('section'))
    for (const value of ['12 Pickup St', 'Unit 4', 'Tulsa', 'OK', '74103']) expect(pickupSection.getByText(value)).toBeInTheDocument()
    for (const value of ['45 Return Ave', 'Suite 8', 'Edmond', 'OK', '73003']) expect(deliverySection.getByText(value)).toBeInTheDocument()
    expect(pickupSection.getByText('Tuesday, June 1, 2027')).toBeInTheDocument()
    expect(deliverySection.getByText(/Evening/)).toBeInTheDocument()
    for (const value of ['client@example.com', '+14055551234', '12 lbs', '12.5 lbs', 'Eco-Friendly', 'On hangers', 'Warm', '$84.87']) {
      expect(screen.getByText(value)).toBeInTheDocument()
    }
    expect(screen.getByText(/Use side entrance/)).toHaveTextContent('Call before arrival.')
  })

  it('fully repeats the pickup address when delivery uses the same address', () => {
    render(<AdminOrderDetails pickup={{ ...pickup, deliveryAddress: undefined }} />)
    const delivery = within(screen.getByRole('heading', { name: 'Delivery details' }).closest('section'))
    expect(delivery.getByText('Same as pickup address')).toBeInTheDocument()
    expect(delivery.getByText('12 Pickup St')).toBeInTheDocument()
    expect(delivery.getByText('Unit 4')).toBeInTheDocument()
  })

  it('shows business contacts and handles missing historical data', () => {
    render(<AdminOrderDetails pickup={{ _id: 'legacy', source: 'business', businessId: {
      businessName: 'Riverside Hotel', contactPerson: 'Jordan Lee', email: 'hotel@example.com', phone: '4055551111',
    } }} />)
    expect(screen.getByText('Riverside Hotel')).toBeInTheDocument()
    expect(screen.getByText('Jordan Lee')).toBeInTheDocument()
    expect(screen.getByText('hotel@example.com')).toBeInTheDocument()
    expect(screen.getByText('No special instructions')).toBeInTheDocument()
    expect(screen.queryByText(/NaN|Invalid Date/)).not.toBeInTheDocument()
  })
})
