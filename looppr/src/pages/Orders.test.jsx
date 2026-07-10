import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext'
import { PickupCard } from './Orders'

vi.mock('../services/pickupApi', () => ({
  payMyOrder: vi.fn(),
  fetchMyPickups: vi.fn(),
}))

function renderCard(pickup, props = {}) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <PickupCard pickup={pickup} detailed {...props} />
      </ToastProvider>
    </MemoryRouter>,
  )
}

const basePickup = {
  _id: 'abcdef0123456789abcdef01',
  address: { street: '1 Test Ln', city: 'Edmond', state: 'OK', zip: '73003' },
  preferredDate: '2027-06-01',
  window: 'morning',
  loadSize: 'large',
  notes: '',
  status: 'request_received',
  paymentStatus: 'paid',
  createdAt: '2026-01-01T00:00:00.000Z',
  paidAt: '2026-01-02T00:00:00.000Z',
  pricing: { amount: 55.65, currency: 'usd', subtotal: 55.65, deliveryFee: 0 },
}

describe('PickupCard receipt', () => {
  it('does not show a receipt toggle for unpaid orders', () => {
    renderCard({ ...basePickup, paymentStatus: 'unpaid' })
    expect(screen.queryByText('View receipt')).not.toBeInTheDocument()
  })

  it('shows an itemized breakdown when subtotal/deliveryFee are present', () => {
    renderCard(basePickup)
    fireEvent.click(screen.getByText('View receipt'))

    expect(screen.getByText(/Order #/)).toBeInTheDocument()
    expect(screen.getByText('Large load · 5+ bags')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    // Appears three times: the card's summary line, the receipt's line-item
    // subtotal, and the receipt's total row — free delivery means subtotal
    // equals the total here, so all three read the same amount.
    expect(screen.getAllByText('$55.65')).toHaveLength(3)
  })

  it('falls back to a non-itemized total for legacy orders missing subtotal/deliveryFee', () => {
    renderCard({ ...basePickup, pricing: { amount: 40, currency: 'usd' } })
    fireEvent.click(screen.getByText('View receipt'))

    expect(screen.queryByText('Free')).not.toBeInTheDocument()
    expect(screen.getByText('Total paid')).toBeInTheDocument()
    expect(screen.getAllByText('$40.00')).toHaveLength(2)
  })

  it('toggles the receipt open and closed', () => {
    renderCard(basePickup)
    fireEvent.click(screen.getByText('View receipt'))
    expect(screen.getByText('Total paid')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Hide receipt'))
    expect(screen.queryByText('Total paid')).not.toBeInTheDocument()
  })
})

describe('PickupCard book again', () => {
  it('renders a "Book again" link back to /book', () => {
    renderCard(basePickup)
    const link = screen.getByText('Book again').closest('a')
    expect(link).toHaveAttribute('href', '/book')
  })
})
